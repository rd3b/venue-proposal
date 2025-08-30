import express from 'express';
import Joi from 'joi';
import { prisma } from '../lib/database';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../lib/auth';
import {
  applyPagination,
  createPaginatedResult,
  handlePrismaError,
  canDeleteVenue,
} from '../lib/db-utils';
import logger from '../lib/logger';

const router = express.Router();

// Validation schemas
const venueCreateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  location: Joi.string().trim().max(500).allow('').optional(),
  contactName: Joi.string().trim().max(255).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().trim().max(50).allow('').optional(),
  standardCommission: Joi.number().min(0).max(100).precision(2).default(0.0),
  notes: Joi.string().allow('').optional(),
});

const venueUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  location: Joi.string().trim().max(500).allow('').optional(),
  contactName: Joi.string().trim().max(255).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().trim().max(50).allow('').optional(),
  standardCommission: Joi.number().min(0).max(100).precision(2).optional(),
  notes: Joi.string().allow('').optional(),
});

const venueQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow('').optional(),
  location: Joi.string().allow('').optional(),
  sortBy: Joi.string()
    .valid('name', 'location', 'standardCommission', 'createdAt', 'updatedAt')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// GET /api/venues - List venues with pagination and search
router.get(
  '/',
  requireAuth,
  validateRequest({ query: venueQuerySchema }),
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const {
        page: rawPage,
        limit: rawLimit,
        search,
        location,
        sortBy,
        sortOrder,
      } = req.query as any;
      const { skip, take, page, limit } = applyPagination({
        page: rawPage,
        limit: rawLimit,
      });

      // Build search conditions
      const searchConditions: any = {};

      if (search || location) {
        searchConditions.AND = [];

        if (search) {
          searchConditions.AND.push({
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { location: { contains: search, mode: 'insensitive' as const } },
              {
                contactName: { contains: search, mode: 'insensitive' as const },
              },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          });
        }

        if (location) {
          searchConditions.AND.push({
            location: { contains: location, mode: 'insensitive' as const },
          });
        }
      }

      // Build order by
      const orderBy = { [sortBy]: sortOrder };

      // Get venues with pagination
      const [venues, total] = await Promise.all([
        prisma.venue.findMany({
          where: searchConditions,
          skip,
          take,
          orderBy,
          include: {
            createdByUser: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: {
                proposalVenues: true,
                bookings: true,
              },
            },
          },
        }),
        prisma.venue.count({ where: searchConditions }),
      ]);

      const result = createPaginatedResult(venues, total, page, limit);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fetching venues:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch venues',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
);

// GET /api/venues/:id - Get venue by ID
router.get(
  '/:id',
  requireAuth,
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req, res) => {
    try {
      const venueId = parseInt(req.params.id);

      const venue = await prisma.venue.findUnique({
        where: { id: venueId },
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
          proposalVenues: {
            select: {
              id: true,
              proposal: {
                select: {
                  id: true,
                  status: true,
                  totalValue: true,
                  expectedCommission: true,
                  createdAt: true,
                  client: {
                    select: { id: true, name: true, company: true },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          bookings: {
            select: {
              id: true,
              status: true,
              totalValue: true,
              commissionAmount: true,
              createdAt: true,
              client: {
                select: { id: true, name: true, company: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!venue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Venue not found',
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      res.json({
        success: true,
        data: venue,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fetching venue:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch venue',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
);

// POST /api/venues - Create new venue
router.post(
  '/',
  requireAuth,
  validateRequest({ body: venueCreateSchema }),
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const userId = authReq.user!.id;
      const venueData = req.body;

      // Clean up empty strings to null for optional fields
      const cleanedData = {
        ...venueData,
        location: venueData.location || null,
        contactName: venueData.contactName || null,
        email: venueData.email || null,
        phone: venueData.phone || null,
        notes: venueData.notes || null,
        createdBy: userId,
      };

      const venue = await prisma.venue.create({
        data: cleanedData,
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      logger.info(`Venue created: ${venue.id} by user ${userId}`);

      res.status(201).json({
        success: true,
        data: venue,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error creating venue:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: handlePrismaError(error),
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
);

// PUT /api/venues/:id - Update venue
router.put(
  '/:id',
  requireAuth,
  validateRequest({
    params: Joi.object({ id: commonSchemas.id }),
    body: venueUpdateSchema,
  }),
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const venueId = parseInt(req.params.id);
      const updateData = req.body;

      // Check if venue exists
      const existingVenue = await prisma.venue.findUnique({
        where: { id: venueId },
      });

      if (!existingVenue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Venue not found',
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Clean up empty strings to null for optional fields, but only for provided fields
      const cleanedData: any = {};
      if (updateData.name !== undefined) cleanedData.name = updateData.name;
      if (updateData.location !== undefined)
        cleanedData.location = updateData.location || null;
      if (updateData.contactName !== undefined)
        cleanedData.contactName = updateData.contactName || null;
      if (updateData.email !== undefined)
        cleanedData.email = updateData.email || null;
      if (updateData.phone !== undefined)
        cleanedData.phone = updateData.phone || null;
      if (updateData.standardCommission !== undefined)
        cleanedData.standardCommission = updateData.standardCommission;
      if (updateData.notes !== undefined)
        cleanedData.notes = updateData.notes || null;

      const venue = await prisma.venue.update({
        where: { id: venueId },
        data: cleanedData,
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      logger.info(`Venue updated: ${venue.id} by user ${authReq.user!.id}`);

      res.json({
        success: true,
        data: venue,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error updating venue:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: handlePrismaError(error),
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
);

// DELETE /api/venues/:id - Delete venue (with soft delete protection)
router.delete(
  '/:id',
  requireAuth,
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const venueId = parseInt(req.params.id);

      // Check if venue exists
      const existingVenue = await prisma.venue.findUnique({
        where: { id: venueId },
      });

      if (!existingVenue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Venue not found',
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Check if venue can be safely deleted
      const { canDelete, reason } = await canDeleteVenue(venueId);

      if (!canDelete) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: `Cannot delete venue: ${reason}`,
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Delete the venue
      await prisma.venue.delete({
        where: { id: venueId },
      });

      logger.info(`Venue deleted: ${venueId} by user ${authReq.user!.id}`);

      res.json({
        success: true,
        message: 'Venue deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error deleting venue:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: handlePrismaError(error),
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
);

export default router;
