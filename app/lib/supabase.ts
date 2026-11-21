"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Attachment, Snippet } from "../types/snippets";

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      snippets: Table<Snippet, Pick<Snippet, "title" | "code" | "visibility">, Partial<Pick<Snippet, "title" | "code" | "visibility" | "owner_id">>>;
      attachments: Table<Attachment, Pick<Attachment, "snippet_id" | "file_name" | "storage_path"> & Partial<Pick<Attachment, "file_size" | "mime_type">>, never>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase: SupabaseClient<Database> | null =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  return supabase;
}

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  return supabaseUrl && supabaseAnonKey
    ? { url: supabaseUrl, anonKey: supabaseAnonKey }
    : null;
}
