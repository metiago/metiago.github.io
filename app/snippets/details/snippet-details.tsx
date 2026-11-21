"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { getSupabaseClient } from "../../lib/supabase";
import { createAttachmentDownloadUrl, formatFileSize } from "../../services/attachments";
import type { Attachment, Snippet } from "../../types/snippets";

const supabase = getSupabaseClient();

export default function SnippetDetails() {
  const snippetId = useSearchParams().get("snippetId");
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    }).catch(() => {
      if (active) setError("Unable to check sign-in status.");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      const nextUserId = currentSession?.user.id ?? null;
      if (currentUserId.current !== nextUserId) { setSnippet(null); setAttachments([]); }
      currentUserId.current = nextUserId;
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase || !snippetId) {
      setError(!supabase ? "Supabase is not configured." : "Missing snippet ID.");
      setIsLoading(false);
      return;
    }
    let active = true;
    async function load() {
      if (!supabase || !snippetId) return;
      setIsLoading(true);
      setError("");
      setSnippet(null);
      setAttachments([]);
      const [snippetResult, attachmentResult] = await Promise.all([
        supabase.from("snippets").select("*").eq("id", snippetId).single(),
        supabase.from("attachments").select("*").eq("snippet_id", snippetId).order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (snippetResult.error || !snippetResult.data) setError("Snippet could not be found.");
      else setSnippet(snippetResult.data);
      if (attachmentResult.error) setError(attachmentResult.error.message);
      else setAttachments(attachmentResult.data ?? []);
      setIsLoading(false);
    }
    void load().catch(() => {
      if (active) { setError("Unable to load snippet details."); setIsLoading(false); }
    });
    return () => { active = false; };
  }, [snippetId, session?.access_token]);

  async function handleDownload(attachment: Attachment) {
    if (!supabase) return;
    // Open immediately so browsers allow the new tab before the async URL request.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    setDownloadingId(attachment.id);
    setError("");
    try {
      const url = await createAttachmentDownloadUrl(supabase, attachment);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      tab?.close();
      setError(downloadError instanceof Error ? downloadError.message : "Unable to prepare download.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <article className="snippets-content mx-auto mt-4">
      <Link href="/snippets">← Back to snippets</Link>
      {isLoading && <div className="d-flex align-items-center gap-2 mt-4"><Spinner animation="border" size="sm" />Loading snippet...</div>}
      {error && <Alert variant="danger" role="alert" className="mt-3">{error}</Alert>}
      {snippet && <>
        <h1 className="mt-4">{snippet.title}</h1>
        <Card><Card.Body><pre className="mb-0"><code>{snippet.code}</code></pre></Card.Body></Card>
        <section className="mt-4">
          <h2>Attachments</h2>
          {attachments.length === 0 ? <p>No attachments.</p> : (
            <ul className="list-unstyled ms-0 ps-0">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="attachment-list-item mb-2 d-flex align-items-center justify-content-between gap-3 flex-wrap">
                  <div className="text-break">
                    <strong>{attachment.file_name}</strong>
                    <small className="d-block text-body-secondary">{formatFileSize(attachment.file_size)} · Uploaded {new Date(attachment.created_at).toLocaleDateString()}</small>
                  </div>
                  <Button variant="outline-primary" size="sm" onClick={() => void handleDownload(attachment)} disabled={downloadingId === attachment.id}>
                    {downloadingId === attachment.id ? "Preparing..." : "Download"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </>}
    </article>
  );
}
