import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator for public routes (skip authentication)
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Custom decorator for role-based access control
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
