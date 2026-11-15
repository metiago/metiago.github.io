import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig, type Database } from "../lib/supabase";
import type { Attachment } from "../types/snippets";

export const ATTACHMENT_BUCKET = "snippet-attachments";
export const MAX_ATTACHMENT_SIZE = 20 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg";
const allowedExtensions = new Set(ACCEPTED_EXTENSIONS.split(","));

export function validateAttachment(file: File): string | null {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    return `${file.name}: file type is not allowed.`;
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return `${file.name}: maximum file size is 20 MB.`;
  }
  return null;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uniqueFileName(name: string): string {
  const safeName = name.normalize("NFKC").replace(/[^\p{L}\p{N}._-]/gu, "_").slice(-180);
  return `${crypto.randomUUID()}-${safeName}`;
}

function transferFile(
  url: string,
  file: File,
  accessToken: string,
  anonKey: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    request.setRequestHeader("apikey", anonKey);
    request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    request.setRequestHeader("x-upsert", "false");
    request.timeout = 120_000;
    request.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        let message = `Upload failed (${request.status}).`;
        try {
          const response: unknown = JSON.parse(request.responseText);
          if (typeof response === "object" && response !== null && "message" in response && typeof response.message === "string") {
            message = response.message;
          }
        } catch { /* The status message above is sufficient. */ }
        reject(new Error(message));
      }
    };
    request.onerror = () => reject(new Error("Network error during upload."));
    request.ontimeout = () => reject(new Error("Upload timed out."));
    request.send(file);
  });
}

export async function uploadAttachment(
  supabase: SupabaseClient<Database>,
  snippetId: number,
  file: File,
  onProgress: (percent: number) => void
): Promise<Attachment> {
  const validationError = validateAttachment(file);
  if (validationError) throw new Error(validationError);

  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error("Sign in before uploading files.");

  const storagePath = `snippets/${snippetId}/${uniqueFileName(file.name)}`;
  const objectUrl = `${config.url}/storage/v1/object/${ATTACHMENT_BUCKET}/${storagePath.split("/").map(encodeURIComponent).join("/")}`;
  await transferFile(objectUrl, file, session.access_token, config.anonKey, onProgress);

  const { data, error } = await supabase.from("attachments").insert({
    snippet_id: snippetId,
    file_name: file.name,
    storage_path: storagePath,
    file_size: file.size,
    mime_type: file.type || null,
  }).select("*").single();

  if (error || !data) {
    await supabase.storage.from(ATTACHMENT_BUCKET).remove([storagePath]);
    throw new Error(error?.message || "Unable to save attachment metadata.");
  }
  return data;
}

export async function createAttachmentDownloadUrl(
  supabase: SupabaseClient<Database>,
  attachment: Attachment
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(attachment.storage_path, 60, { download: attachment.file_name });
  if (error || !data) throw new Error(error?.message || "Unable to prepare download.");
  return data.signedUrl;
}
