"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import { Alert, Button, Card, Collapse, Form, Spinner, Toast, ToastContainer } from "react-bootstrap";
import AttachmentPicker from "../components/AttachmentPicker";
import { getSupabaseClient } from "../lib/supabase";
import { ATTACHMENT_BUCKET, uploadAttachment, validateAttachment } from "../services/attachments";
import type { PendingAttachment, Snippet } from "../types/snippets";
import "highlight.js/styles/github-dark.css";

hljs.registerLanguage("java", java);

const initialForm = { title: "", code: "", isPrivate: false };
const supabase = getSupabaseClient();

export default function SnippetsPage() {
  const [form, setForm] = useState(initialForm);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [files, setFiles] = useState<PendingAttachment[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [editingSnippetId, setEditingSnippetId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSnippetId, setDeletingSnippetId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      setIsLoading(false);
      return;
    }
    let active = true;
    async function initialize() {
      if (!supabase) return;
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!active) return;
        setSession(currentSession);
      } catch {
        if (active) setError("Unable to load snippets. Please try again.");
      }
    }
    void initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      const nextUserId = currentSession?.user.id ?? null;
      if (currentUserId.current !== nextUserId) {
        setSnippets([]);
        setEditingSnippetId(null);
        setForm(initialForm);
      }
      currentUserId.current = nextUserId;
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    async function loadSnippets() {
      if (!supabase) return;
      setIsLoading(true);
      const { data, error: fetchError } = await supabase.from("snippets").select("*").order("title", { ascending: true });
      if (!active) return;
      if (fetchError) setError(fetchError.message);
      else { setSnippets(data ?? []); setError(""); }
      setIsLoading(false);
    }
    void loadSnippets().catch(() => {
      if (active) { setError("Unable to load snippets. Please try again."); setIsLoading(false); }
    });
    return () => { active = false; };
  }, [session?.access_token]);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("pre code").forEach((block) => hljs.highlightElement(block));
  }, [snippets, expandedIds]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function addFiles(selected: File[]) {
    const accepted: PendingAttachment[] = [];
    const errors: string[] = [];
    for (const file of selected) {
      const message = validateAttachment(file);
      if (message) errors.push(message);
      else accepted.push({ id: crypto.randomUUID(), file, progress: 0, status: "queued" });
    }
    setValidationErrors(errors);
    setFiles((current) => [...current, ...accepted]);
  }

  function updateFile(id: string, changes: Partial<PendingAttachment>) {
    setFiles((current) => current.map((entry) => entry.id === id ? { ...entry, ...changes } : entry));
  }

  function resetForm() {
    setEditingSnippetId(null);
    setForm(initialForm);
    setFiles([]);
    setValidationErrors([]);
  }

  function handleEdit(snippet: Snippet) {
    setError("");
    setEditingSnippetId(snippet.id);
    setForm({ title: snippet.title, code: snippet.code, isPrivate: snippet.visibility === "private" });
    setFiles([]);
    setValidationErrors([]);
    setExpandedIds((current) => current.includes(snippet.id) ? current : [...current, snippet.id]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setToast("");
    if (!supabase) { setError("Supabase is not configured."); return; }
    if (!session) { setError("Sign in before saving snippets."); return; }
    const title = form.title.trim();
    const code = form.code.trim();
    const visibility = form.isPrivate ? "private" : "public";
    if (!title || !code) { setError("Title and code snippet are required."); return; }

    const pendingFiles = files.filter((entry) => entry.status !== "uploaded");
    const invalidFiles = pendingFiles.map((entry) => validateAttachment(entry.file)).filter((value): value is string => value !== null);
    if (invalidFiles.length) { setValidationErrors(invalidFiles); return; }
    setValidationErrors([]);
    setIsSaving(true);

    try {
      let savedSnippet: Snippet;
      if (editingSnippetId) {
        const { data, error: saveError } = await supabase.from("snippets").update({
          title, code, visibility,
          ...(visibility === "private" ? { owner_id: session.user.id } : {}),
        }).eq("id", editingSnippetId).select("*").single();
        if (saveError || !data) throw new Error(saveError?.message || "Unable to update snippet.");
        savedSnippet = data;
        setSnippets((current) => current.map((snippet) => snippet.id === data.id ? data : snippet));
      } else {
        const { data, error: saveError } = await supabase.from("snippets").insert({ title, code, visibility }).select("*").single();
        if (saveError || !data) throw new Error(saveError?.message || "Unable to save snippet.");
        savedSnippet = data;
        setSnippets((current) => [data, ...current]);
        setEditingSnippetId(data.id);
      }

      setExpandedIds((current) => current.includes(savedSnippet.id) ? current : [savedSnippet.id, ...current]);
      const failed: string[] = [];
      for (const entry of pendingFiles) {
        updateFile(entry.id, { status: "uploading", progress: 0, error: undefined });
        try {
          await uploadAttachment(supabase, savedSnippet.id, entry.file, (progress) => updateFile(entry.id, { progress }));
          updateFile(entry.id, { status: "uploaded", progress: 100 });
        } catch (uploadError) {
          const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
          updateFile(entry.id, { status: "error", error: message });
          failed.push(`${entry.file.name}: ${message}`);
        }
      }
      if (failed.length) {
        setError(`Snippet saved, but ${failed.length} attachment(s) failed. Retry with Update Snippet. ${failed.join(" ")}`);
      } else {
        resetForm();
        setToast("Snippet and attachments saved successfully.");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save snippet. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(snippet: Snippet) {
    if (!supabase || !session) { setError("Sign in before deleting snippets."); return; }
    if (!window.confirm(`Delete "${snippet.title}"? This action cannot be undone.`)) return;
    setError("");
    setDeletingSnippetId(snippet.id);
    try {
      const { data: attached, error: listError } = await supabase.from("attachments").select("*").eq("snippet_id", snippet.id);
      if (listError) throw listError;
      if (attached?.length) {
        const { error: storageError } = await supabase.storage.from(ATTACHMENT_BUCKET).remove(attached.map((item) => item.storage_path));
        if (storageError) throw storageError;
      }
      const { error: deleteError } = await supabase.from("snippets").delete().eq("id", snippet.id);
      if (deleteError) throw deleteError;
      setSnippets((current) => current.filter((item) => item.id !== snippet.id));
      setExpandedIds((current) => current.filter((id) => id !== snippet.id));
      if (editingSnippetId === snippet.id) resetForm();
      setToast("Snippet deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete snippet.");
    } finally {
      setDeletingSnippetId(null);
    }
  }

  return (
    <div className="d-flex justify-content-center">
      <article className="w-100 mx-auto snippets-content">
        <header className="mb-4 text-center"><h1>Snippets</h1></header>
        {error && <Alert variant="danger" role="alert">{error}</Alert>}
        {validationErrors.length > 0 && <Alert variant="danger" role="alert"><ul className="mb-0">{validationErrors.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}</ul></Alert>}
        <ToastContainer position="top-end" className="position-fixed p-3 snippet-toast">
          <Toast show={Boolean(toast)} onClose={() => setToast("")} delay={5000} autohide bg="success">
            <Toast.Body className="text-white">{toast}</Toast.Body>
          </Toast>
        </ToastContainer>
        {session && (
          <Card className="mb-4"><Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="snippet-title">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" name="title" value={form.title} onChange={handleChange} placeholder="Example: Docker login command" maxLength={120} required />
              </Form.Group>
              <Form.Group className="mb-3" controlId="snippet-private">
                <Form.Check type="checkbox" name="isPrivate" label="Private snippet" checked={form.isPrivate} onChange={(event) => setForm((current) => ({ ...current, isPrivate: event.target.checked }))} />
                <Form.Text className="text-body-secondary">Private snippets are visible only to you.</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3" controlId="snippet-code">
                <Form.Label>Code Snippet</Form.Label>
                <Form.Control as="textarea" rows={8} name="code" value={form.code} onChange={handleChange} placeholder="Paste code here" required />
              </Form.Group>
              <AttachmentPicker files={files} disabled={isSaving} onAdd={addFiles} onRemove={(id) => setFiles((current) => current.filter((entry) => entry.id !== id))} />
              <Button type="submit" disabled={isSaving || !supabase}>
                {isSaving ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : editingSnippetId ? "Update Snippet" : "Save Snippet"}
              </Button>
              {editingSnippetId && <Button type="button" variant="outline-secondary" className="ms-2" onClick={resetForm} disabled={isSaving}>Cancel</Button>}
            </Form>
          </Card.Body></Card>
        )}
        <section className="mt-0 border-0 pt-0">
          {isLoading && <div className="d-flex align-items-center gap-2"><Spinner animation="border" size="sm" /><span>Loading snippets...</span></div>}
          {!isLoading && snippets.length === 0 && <p>No snippets saved yet.</p>}
          {snippets.map((snippet) => (
            <Card className="mb-3" key={snippet.id}><Card.Body>
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <h5 className="mb-2 d-flex align-items-center gap-2">
                  {snippet.title}
                  <span
                    className="text-body-secondary"
                    role="img"
                    aria-label={snippet.visibility === "private" ? "Private snippet" : "Public snippet"}
                    title={snippet.visibility === "private" ? "Private snippet" : "Public snippet"}
                  >
                    <i className={`bi ${snippet.visibility === "private" ? "bi-lock-fill" : "bi-globe"}`} aria-hidden="true" />
                  </span>
                </h5>
                <div className="d-flex gap-2 ms-auto flex-wrap">
                  <Button variant="outline-secondary" size="sm" onClick={() => setExpandedIds((current) => current.includes(snippet.id) ? current.filter((id) => id !== snippet.id) : [...current, snippet.id])} aria-expanded={expandedIds.includes(snippet.id)}>
                    {expandedIds.includes(snippet.id) ? "Collapse" : "Expand"}
                  </Button>
                  <Link href={`/snippets/details?snippetId=${encodeURIComponent(snippet.id)}`} className="btn btn-outline-info btn-sm">Details & attachments</Link>
                  {session && <Button variant="outline-primary" size="sm" onClick={() => handleEdit(snippet)} disabled={deletingSnippetId === snippet.id}>Edit</Button>}
                  {session && <Button variant="outline-danger" size="sm" onClick={() => void handleDelete(snippet)} disabled={deletingSnippetId !== null}>{deletingSnippetId === snippet.id ? "Deleting..." : "Delete"}</Button>}
                </div>
              </div>
              <Collapse in={expandedIds.includes(snippet.id)}><div><pre className="mb-0 mt-3"><code className="language-java">{snippet.code}</code></pre></div></Collapse>
            </Card.Body></Card>
          ))}
        </section>
      </article>
    </div>
  );
}
