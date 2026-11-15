export interface Snippet {
  id: number;
  title: string;
  code: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  snippet_id: number;
  file_name: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface PendingAttachment {
  id: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "uploaded" | "error";
  error?: string;
}
