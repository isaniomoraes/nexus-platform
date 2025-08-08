export const USER_ROLES = {
  ADMIN: 'admin',
  SE: 'se',
  CLIENT: 'client',
} as const

export const EXCEPTION_TYPES = {
  AUTHENTICATION: 'authentication',
  DATA_PROCESS: 'data_process',
  INTEGRATION: 'integration',
  WORKFLOW_LOGIC: 'workflow_logic',
  BROWSER_AUTOMATION: 'browser_automation',
} as const

export const EXCEPTION_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const

export const EXCEPTION_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  IGNORED: 'ignored',
} as const

export const PIPELINE_PHASES = [
  'Discovery: Initial Survey',
  'Discovery: Process deep dive',
  'ADA Proposal Sent',
  'ADA Proposal Review done',
  'ADA Contract Sent',
  'ADA Contract Signed',
  'Credentials collected',
  'Factory build initiated',
  'Test plan generated',
  'Testing started',
  'Production deploy',
] as const

export const SUBSCRIPTION_PLANS = {
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const
