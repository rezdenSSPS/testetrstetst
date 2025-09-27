import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Please configure Supabase connection.');
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export type Database = {
  public: {
    Tables: {
      items: {
        Row: {
          id: string;
          name: string;
          total_quantity: number;
          available_quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          total_quantity?: number;
          available_quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          total_quantity?: number;
          available_quantity?: number;
          created_at?: string;
        };
      };
      people: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          item_id: string;
          person_id: string;
          quantity: number;
          notes: string;
          condition_photo: string;
          condition_notes: string;
          loaned_at: string;
          returned_at: string | null;
        };
        Insert: {
          id?: string;
          item_id: string;
          person_id: string;
          quantity?: number;
          notes?: string;
          condition_photo?: string;
          condition_notes?: string;
          loaned_at?: string;
          returned_at?: string | null;
        };
        Update: {
          id?: string;
          item_id?: string;
          person_id?: string;
          quantity?: number;
          notes?: string;
          condition_photo?: string;
          condition_notes?: string;
          loaned_at?: string;
          returned_at?: string | null;
        };
      };
    };
  };
};