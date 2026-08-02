export type Role = 'owner' | 'admin' | 'manager' | 'agent' | 'viewer'

export interface Permission {
  resource: string
  action: 'read' | 'write' | 'delete' | 'manage'
}

export const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    { resource: 'company', action: 'manage' },
    { resource: 'team', action: 'manage' },
    { resource: 'leads', action: 'manage' },
    { resource: 'rules', action: 'manage' },
    { resource: 'webhooks', action: 'manage' },
    { resource: 'reports', action: 'read' },
    { resource: 'settings', action: 'manage' }
  ],
  admin: [
    { resource: 'team', action: 'write' },
    { resource: 'leads', action: 'write' },
    { resource: 'rules', action: 'write' },
    { resource: 'webhooks', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'settings', action: 'write' }
  ],
  manager: [
    { resource: 'team', action: 'read' },
    { resource: 'leads', action: 'write' },
    { resource: 'rules', action: 'read' },
    { resource: 'reports', action: 'read' }
  ],
  agent: [
    { resource: 'leads', action: 'read' },
    { resource: 'leads', action: 'write' },
    { resource: 'reports', action: 'read' }
  ],
  viewer: [
    { resource: 'leads', action: 'read' },
    { resource: 'reports', action: 'read' }
  ]
}

export function hasPermission(role: Role, resource: string, action: 'read' | 'write' | 'delete' | 'manage'): boolean {
  const permissions = rolePermissions[role]
  return permissions.some(p => p.resource === resource && (p.action === action || p.action === 'manage'))
}

export function getRoleLabel(role: Role): string {
  return {
    owner: 'Owner',
    admin: 'Administrator',
    manager: 'Manager',
    agent: 'Agent',
    viewer: 'Viewer'
  }[role]
}
