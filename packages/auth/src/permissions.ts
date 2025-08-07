import type { User } from '@nexus/database/types'
import { USER_ROLES } from '@nexus/shared'

export function hasAdminAccess(user: User): boolean {
  return user.role === USER_ROLES.ADMIN
}

export function hasSEAccess(user: User): boolean {
  return [USER_ROLES.ADMIN, USER_ROLES.SE].includes(user.role)
}

export function hasClientAccess(user: User): boolean {
  return user.role === USER_ROLES.CLIENT
}

export function canViewAllClients(user: User): boolean {
  return user.role === USER_ROLES.ADMIN
}

export function canViewClient(user: User, clientId: string): boolean {
  if (user.role === USER_ROLES.ADMIN) return true
  if (user.role === USER_ROLES.SE) {
    return user.assigned_clients?.includes(clientId) ?? false
  }
  if (user.role === USER_ROLES.CLIENT) {
    return user.client_id === clientId
  }
  return false
}

export function canManageUsers(user: User): boolean {
  return user.role === USER_ROLES.ADMIN || user.can_manage_users
}

export function canAccessBilling(user: User): boolean {
  return user.role !== USER_ROLES.CLIENT || user.is_billing_admin
}

export function canManageBilling(user: User): boolean {
  return user.role === USER_ROLES.ADMIN
}

export function canEditWorkflow(user: User, workflowClientId: string): boolean {
  if (user.role === USER_ROLES.CLIENT) return false
  return canViewClient(user, workflowClientId)
}

export function canResolveException(user: User, exceptionClientId: string): boolean {
  if (user.role === USER_ROLES.CLIENT) return false
  return canViewClient(user, exceptionClientId)
}
