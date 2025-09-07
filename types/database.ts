export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          name: string
          role: 'streaming' | 'admin'
          is_active: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id: string
          name: string
          role: 'streaming' | 'admin'
          is_active?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: 'streaming' | 'admin'
          is_active?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}