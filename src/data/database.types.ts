export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          document_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          created_at: string
          id: string
          program_id: string
          status: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          program_id: string
          status?: string
          submitted_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          program_id?: string
          status?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_name: string
          id: string
          kind: string
          size_bytes: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          kind: string
          size_bytes: number
          storage_path: string
          user_id?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          kind?: string
          size_bytes?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_rounds: {
        Row: {
          created_at: string
          cv_document_id: string | null
          id: string
          program_id: string | null
          result: Json | null
          statement_document_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          cv_document_id?: string | null
          id?: string
          program_id?: string | null
          result?: Json | null
          statement_document_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          cv_document_id?: string | null
          id?: string
          program_id?: string | null
          result?: Json | null
          statement_document_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_rounds_cv_document_id_fkey"
            columns: ["cv_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_rounds_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_rounds_statement_document_id_fkey"
            columns: ["statement_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_consent: boolean
          ai_consent_at: string | null
          budget_band: string | null
          budget_currency: string | null
          citizenships: string[]
          country_of_origin: string | null
          country_of_residence: string | null
          created_at: string
          current_studies: string | null
          current_university: string | null
          fields: string[]
          first_name: string | null
          grade: number | null
          grade_class: string | null
          grade_scale: string | null
          id: string
          ielts: number | null
          last_name: string | null
          payers: string[]
          planned_start: string | null
          setup_step: number
          target_countries: string[]
          test_score: number | null
          test_type: string | null
          updated_at: string
        }
        Insert: {
          ai_consent?: boolean
          ai_consent_at?: string | null
          budget_band?: string | null
          budget_currency?: string | null
          citizenships?: string[]
          country_of_origin?: string | null
          country_of_residence?: string | null
          created_at?: string
          current_studies?: string | null
          current_university?: string | null
          fields?: string[]
          first_name?: string | null
          grade?: number | null
          grade_class?: string | null
          grade_scale?: string | null
          id: string
          ielts?: number | null
          last_name?: string | null
          payers?: string[]
          planned_start?: string | null
          setup_step?: number
          target_countries?: string[]
          test_score?: number | null
          test_type?: string | null
          updated_at?: string
        }
        Update: {
          ai_consent?: boolean
          ai_consent_at?: string | null
          budget_band?: string | null
          budget_currency?: string | null
          citizenships?: string[]
          country_of_origin?: string | null
          country_of_residence?: string | null
          created_at?: string
          current_studies?: string | null
          current_university?: string | null
          fields?: string[]
          first_name?: string | null
          grade?: number | null
          grade_class?: string | null
          grade_scale?: string | null
          id?: string
          ielts?: number | null
          last_name?: string | null
          payers?: string[]
          planned_start?: string | null
          setup_step?: number
          target_countries?: string[]
          test_score?: number | null
          test_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          application_fee: number | null
          careers_url: string | null
          checked_by: string
          checked_on: string
          created_at: string
          currency: string
          deadline: string | null
          degree: string
          fees_total: number
          field: string
          highly_selective: boolean
          id: string
          language: string
          length_months: number
          letters_required: number
          min_gpa: number | null
          min_gpa_class: string | null
          min_gpa_scale: string | null
          min_ielts: number | null
          official_url: string
          program: string
          ranking_url: string | null
          test_required: string
          tuition_total: number
          university_id: string
        }
        Insert: {
          application_fee?: number | null
          careers_url?: string | null
          checked_by: string
          checked_on: string
          created_at?: string
          currency: string
          deadline?: string | null
          degree?: string
          fees_total?: number
          field: string
          highly_selective?: boolean
          id?: string
          language: string
          length_months: number
          letters_required?: number
          min_gpa?: number | null
          min_gpa_class?: string | null
          min_gpa_scale?: string | null
          min_ielts?: number | null
          official_url: string
          program: string
          ranking_url?: string | null
          test_required?: string
          tuition_total: number
          university_id: string
        }
        Update: {
          application_fee?: number | null
          careers_url?: string | null
          checked_by?: string
          checked_on?: string
          created_at?: string
          currency?: string
          deadline?: string | null
          degree?: string
          fees_total?: number
          field?: string
          highly_selective?: boolean
          id?: string
          language?: string
          length_months?: number
          letters_required?: number
          min_gpa?: number | null
          min_gpa_class?: string | null
          min_gpa_scale?: string | null
          min_ielts?: number | null
          official_url?: string
          program?: string
          ranking_url?: string | null
          test_required?: string
          tuition_total?: number
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      rankings: {
        Row: {
          area: string
          checked_on: string
          id: string
          program_id: string | null
          rank: string
          ranking_name: string
          scope: string
          university_id: string
          url: string
          year: number
        }
        Insert: {
          area: string
          checked_on: string
          id?: string
          program_id?: string | null
          rank: string
          ranking_name: string
          scope: string
          university_id: string
          url: string
          year: number
        }
        Update: {
          area?: string
          checked_on?: string
          id?: string
          program_id?: string | null
          rank?: string
          ranking_name?: string
          scope?: string
          university_id?: string
          url?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "rankings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: number | null
          checked_on: string
          country: string
          covers_full_tuition: boolean
          created_at: string
          currency: string | null
          deadline: string | null
          eligible_citizenships: string[] | null
          id: string
          is_loan: boolean
          name: string
          official_url: string
          program_id: string | null
          provider: string
          university_id: string | null
        }
        Insert: {
          amount?: number | null
          checked_on: string
          country: string
          covers_full_tuition?: boolean
          created_at?: string
          currency?: string | null
          deadline?: string | null
          eligible_citizenships?: string[] | null
          id?: string
          is_loan?: boolean
          name: string
          official_url: string
          program_id?: string | null
          provider: string
          university_id?: string | null
        }
        Update: {
          amount?: number | null
          checked_on?: string
          country?: string
          covers_full_tuition?: boolean
          created_at?: string
          currency?: string | null
          deadline?: string | null
          eligible_citizenships?: string[] | null
          id?: string
          is_loan?: boolean
          name?: string
          official_url?: string
          program_id?: string | null
          provider?: string
          university_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarships_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          brand_color: string | null
          city: string
          country: string
          created_at: string
          id: string
          initials: string
          name: string
        }
        Insert: {
          brand_color?: string | null
          city: string
          country: string
          created_at?: string
          id?: string
          initials: string
          name: string
        }
        Update: {
          brand_color?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          initials?: string
          name?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
