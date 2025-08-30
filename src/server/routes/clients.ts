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
  canDeleteClient,
} from '../lib/db-utils';
import logger from '../lib/logger';

const router = express.Router();

// Validation schemas
const clientCreateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  company: Joi.string().trim().max(255).allow('').optional(),
  contactName: Joi.string().trim().max(255).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().trim().max(50).allow('').optional(),
  notes: Joi.string().allow('').optional(),
});

const clientUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  company: Joi.string().trim().max(255).allow('').optional(),
  contactName: Joi.string().trim().max(255).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().trim().max(50).allow('').optional(),
  notes: Joi.string().allow('').optional(),
});

const clientQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow('').optional(),
  sortBy: Joi.string()
    .valid('name', 'company', 'createdAt', 'updatedAt')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// GET /api/clients - List clients with pagination and search
router.get(
  '/',
  requireAuth,
  validateRequest({ query: clientQuerySchema }),
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const {
        page: rawPage,
        limit: rawLimit,
        search,
        sortBy,
        sortOrder,
      } = req.query as any;
      const { skip, take, page, limit } = applyPagination({
        page: rawPage,
        limit: rawLimit,
      });

      // Build search conditions
      const searchConditions = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { company: { contains: search, mode: 'insensitive' as const } },
              {
                contactName: { contains: search, mode: 'insensitive' as const },
              },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      // Build order by
      const orderBy = { [sortBy]: sortOrder };

      // Get clients with pagination
      const [clients, total] = await Promise.all([
        prisma.client.findMany({
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
                proposals: true,
                bookings: true,
              },
            },
          },
        }),
        prisma.client.count({ where: searchConditions }),
      ]);

      const result = createPaginatedResult(clients, total, page, limit);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fetching clients:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch clients',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
);

// GET /api/clients/:id - Get client by ID
router.get(
  '/:id',
  requireAuth,
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);

      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
          proposals: {
            select: {
              id: true,
              status: true,
              totalValue: true,
              expectedCommission: true,
              createdAt: true,
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
              venue: {
                select: { id: true, name: true, location: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found',
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      res.json({
        success: true,
        data: client,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error fetching client:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch client',
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }
  }
);

// POST /api/clients - Create new client
router.post(
  '/',
  requireAuth,
  validateRequest({ body: clientCreateSchema }),
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const userId = authReq.user!.id;
      const clientData = req.body;

      // Clean up empty strings to null for optional fields
      const cleanedData = {
        ...clientData,
        company: clientData.company || null,
        contactName: clientData.contactName || null,
        email: clientData.email || null,
        phone: clientData.phone || null,
        notes: clientData.notes || null,
        createdBy: userId,
      };

      const client = await prisma.client.create({
        data: cleanedData,
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      logger.info(`Client created: ${client.id} by user ${userId}`);

      res.status(201).json({
        success: true,
        data: client,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error creating client:', error);
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

// PUT /api/clients/:id - Update client
router.put(
  '/:id',
  requireAuth,
  validateRequest({
    params: Joi.object({ id: commonSchemas.id }),
    body: clientUpdateSchema,
  }),
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const clientId = parseInt(req.params.id);
      const updateData = req.body;

      // Check if client exists
      const existingClient = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!existingClient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found',
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Clean up empty strings to null for optional fields, but only for provided fields
      const cleanedData: any = {};
      if (updateData.name !== undefined) cleanedData.name = updateData.name;
      if (updateData.company !== undefined)
        cleanedData.company = updateData.company || null;
      if (updateData.contactName !== undefined)
        cleanedData.contactName = updateData.contactName || null;
      if (updateData.email !== undefined)
        cleanedData.email = updateData.email || null;
      if (updateData.phone !== undefined)
        cleanedData.phone = updateData.phone || null;
      if (updateData.notes !== undefined)
        cleanedData.notes = updateData.notes || null;

      const client = await prisma.client.update({
        where: { id: clientId },
        data: cleanedData,
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      logger.info(`Client updated: ${client.id} by user ${authReq.user!.id}`);

      res.json({
        success: true,
        data: client,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error updating client:', error);
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

// DELETE /api/clients/:id - Delete client (with soft delete protection)
router.delete(
  '/:id',
  requireAuth,
  validateRequest({ params: Joi.object({ id: commonSchemas.id }) }),
  async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const clientId = parseInt(req.params.id);

      // Check if client exists
      const existingClient = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!existingClient) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Client not found',
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Check if client can be safely deleted
      const { canDelete, reason } = await canDeleteClient(clientId);

      if (!canDelete) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: `Cannot delete client: ${reason}`,
          },
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Delete the client
      await prisma.client.delete({
        where: { id: clientId },
      });

      logger.info(`Client deleted: ${clientId} by user ${authReq.user!.id}`);

      res.json({
        success: true,
        message: 'Client deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error deleting client:', error);
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
