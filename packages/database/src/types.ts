// Re-export types from shared package
export type {
  User,
  Client,
  Workflow,
  Exception,
  Subscription,
  UserRole,
  ExceptionType,
  ExceptionSeverity,
  ExceptionStatus,
  SubscriptionPlan,
  CreateClientInput,
  LoginInput
} from '@nexus/shared'

// Database specific types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'admin' | 'se' | 'client'
          client_id: string | null
          assigned_clients: string[] | null
          is_billing_admin: boolean
          can_manage_users: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          role: 'admin' | 'se' | 'client'
          client_id?: string | null
          assigned_clients?: string[] | null
          is_billing_admin?: boolean
          can_manage_users?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'admin' | 'se' | 'client'
          client_id?: string | null
          assigned_clients?: string[] | null
          is_billing_admin?: boolean
          can_manage_users?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          url: string | null
          contract_start_date: string
          departments: string[]
          pipeline_phase: string
          assigned_ses: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url?: string | null
          contract_start_date: string
          departments: string[]
          pipeline_phase: string
          assigned_ses?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string | null
          contract_start_date?: string
          departments?: string[]
          pipeline_phase?: string
          assigned_ses?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          client_id: string
          name: string
          department: string
          description: string | null
          is_active: boolean
          node_count: number
          execution_count: number
          exception_count: number
          time_saved_per_execution: number
          money_saved_per_execution: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          department: string
          description?: string | null
          is_active?: boolean
          node_count?: number
          execution_count?: number
          exception_count?: number
          time_saved_per_execution?: number
          money_saved_per_execution?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          department?: string
          description?: string | null
          is_active?: boolean
          node_count?: number
          execution_count?: number
          exception_count?: number
          time_saved_per_execution?: number
          money_saved_per_execution?: number
          created_at?: string
          updated_at?: string
        }
      }
      exceptions: {
        Row: {
          id: string
          client_id: string
          workflow_id: string
          type: 'authentication' | 'data_process' | 'integration' | 'workflow_logic' | 'browser_automation'
          severity: 'critical' | 'high' | 'medium' | 'low'
          status: 'new' | 'in_progress' | 'resolved' | 'ignored'
          message: string
          remedy: string | null
          reported_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          workflow_id: string
          type: 'authentication' | 'data_process' | 'integration' | 'workflow_logic' | 'browser_automation'
          severity: 'critical' | 'high' | 'medium' | 'low'
          status?: 'new' | 'in_progress' | 'resolved' | 'ignored'
          message: string
          remedy?: string | null
          reported_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          workflow_id?: string
          type?: 'authentication' | 'data_process' | 'integration' | 'workflow_logic' | 'browser_automation'
          severity?: 'critical' | 'high' | 'medium' | 'low'
          status?: 'new' | 'in_progress' | 'resolved' | 'ignored'
          message?: string
          remedy?: string | null
          reported_at?: string
          resolved_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          client_id: string
          plan: 'basic' | 'professional' | 'enterprise'
          status: 'active' | 'cancelled' | 'past_due'
          current_period_start: string
          current_period_end: string
          monthly_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          plan: 'basic' | 'professional' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_start: string
          current_period_end: string
          monthly_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          plan?: 'basic' | 'professional' | 'enterprise'
          status?: 'active' | 'cancelled' | 'past_due'
          current_period_start?: string
          current_period_end?: string
          monthly_price?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Utility types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
