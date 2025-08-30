import { AuthenticatedUser } from './auth';

export enum UserRole {
  ADMIN = 'admin',
  CONSULTANT = 'consultant',
}

export enum Permission {
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_ALL_USERS = 'view_all_users',

  // Client management
  CREATE_CLIENT = 'create_client',
  VIEW_CLIENT = 'view_client',
  UPDATE_CLIENT = 'update_client',
  DELETE_CLIENT = 'delete_client',
  VIEW_ALL_CLIENTS = 'view_all_clients',

  // Venue management
  CREATE_VENUE = 'create_venue',
  VIEW_VENUE = 'view_venue',
  UPDATE_VENUE = 'update_venue',
  DELETE_VENUE = 'delete_venue',
  VIEW_ALL_VENUES = 'view_all_venues',

  // Proposal management
  CREATE_PROPOSAL = 'create_proposal',
  VIEW_PROPOSAL = 'view_proposal',
  UPDATE_PROPOSAL = 'update_proposal',
  DELETE_PROPOSAL = 'delete_proposal',
  VIEW_ALL_PROPOSALS = 'view_all_proposals',

  // Booking management
  CREATE_BOOKING = 'create_booking',
  VIEW_BOOKING = 'view_booking',
  UPDATE_BOOKING = 'update_booking',
  DELETE_BOOKING = 'delete_booking',
  VIEW_ALL_BOOKINGS = 'view_all_bookings',

  // Commission management
  CREATE_COMMISSION_CLAIM = 'create_commission_claim',
  VIEW_COMMISSION_CLAIM = 'view_commission_claim',
  UPDATE_COMMISSION_CLAIM = 'update_commission_claim',
  DELETE_COMMISSION_CLAIM = 'delete_commission_claim',
  VIEW_ALL_COMMISSION_CLAIMS = 'view_all_commission_claims',

  // Reporting
  VIEW_REPORTS = 'view_reports',
  VIEW_ALL_REPORTS = 'view_all_reports',
  EXPORT_DATA = 'export_data',

  // System administration
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
}

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    Permission.MANAGE_USERS,
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_CLIENT,
    Permission.VIEW_CLIENT,
    Permission.UPDATE_CLIENT,
    Permission.DELETE_CLIENT,
    Permission.VIEW_ALL_CLIENTS,
    Permission.CREATE_VENUE,
    Permission.VIEW_VENUE,
    Permission.UPDATE_VENUE,
    Permission.DELETE_VENUE,
    Permission.VIEW_ALL_VENUES,
    Permission.CREATE_PROPOSAL,
    Permission.VIEW_PROPOSAL,
    Permission.UPDATE_PROPOSAL,
    Permission.DELETE_PROPOSAL,
    Permission.VIEW_ALL_PROPOSALS,
    Permission.CREATE_BOOKING,
    Permission.VIEW_BOOKING,
    Permission.UPDATE_BOOKING,
    Permission.DELETE_BOOKING,
    Permission.VIEW_ALL_BOOKINGS,
    Permission.CREATE_COMMISSION_CLAIM,
    Permission.VIEW_COMMISSION_CLAIM,
    Permission.UPDATE_COMMISSION_CLAIM,
    Permission.DELETE_COMMISSION_CLAIM,
    Permission.VIEW_ALL_COMMISSION_CLAIMS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_ALL_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.CONSULTANT]: [
    // Consultant has limited permissions - can manage their own data
    Permission.CREATE_CLIENT,
    Permission.VIEW_CLIENT,
    Permission.UPDATE_CLIENT,
    Permission.DELETE_CLIENT,
    Permission.CREATE_VENUE,
    Permission.VIEW_VENUE,
    Permission.UPDATE_VENUE,
    Permission.DELETE_VENUE,
    Permission.CREATE_PROPOSAL,
    Permission.VIEW_PROPOSAL,
    Permission.UPDATE_PROPOSAL,
    Permission.DELETE_PROPOSAL,
    Permission.CREATE_BOOKING,
    Permission.VIEW_BOOKING,
    Permission.UPDATE_BOOKING,
    Permission.DELETE_BOOKING,
    Permission.CREATE_COMMISSION_CLAIM,
    Permission.VIEW_COMMISSION_CLAIM,
    Permission.UPDATE_COMMISSION_CLAIM,
    Permission.DELETE_COMMISSION_CLAIM,
    Permission.VIEW_REPORTS,
  ],
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (
  user: AuthenticatedUser,
  permission: Permission
): boolean => {
  const userRole = user.role as UserRole;
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (
  user: AuthenticatedUser,
  permissions: Permission[]
): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (
  user: AuthenticatedUser,
  permissions: Permission[]
): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get all permissions for a user role
 */
export const getUserPermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a user can access a resource they created
 * Admins can access all resources, consultants can only access their own
 */
export const canAccessOwnResource = (
  user: AuthenticatedUser,
  resourceCreatorId: number
): boolean => {
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  return user.id === resourceCreatorId;
};

/**
 * Check if a user can view all resources of a type
 * Only admins can view all resources by default
 */
export const canViewAllResources = (user: AuthenticatedUser): boolean => {
  return user.role === UserRole.ADMIN;
};
