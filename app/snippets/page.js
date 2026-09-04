"use client";

import { useEffect, useState } from "react";
import hljs from "highlight.js/lib/core";
import java from "highlight.js/lib/languages/java";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Form,
  Spinner,
} from "react-bootstrap";
import { getSupabaseClient } from "../lib/supabase";
import "highlight.js/styles/github-dark.css";

hljs.registerLanguage("java", java);

const initialForm = {
  title: "",
  code: "",
};

export default function SnippetsPage() {
  const supabase = getSupabaseClient();
  const [form, setForm] = useState(initialForm);
  const [snippets, setSnippets] = useState([]);
  const [session, setSession] = useState(null);
  const [editingSnippetId, setEditingSnippetId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSnippetId, setDeletingSnippetId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    async function initialize() {
      if (!supabase) {
        setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        setIsLoading(false);
        return;
      }

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);

      const { data, error: fetchError } = await supabase
        .from("snippets")
        .select("id, title, code, created_at")
        .order("title", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setSnippets(data ?? []);
      }

      setIsLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase
      ? supabase.auth.onAuthStateChange((_event, currentSession) => {
          setSession(currentSession);
        })
      : { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const blocks = document.querySelectorAll("pre code");
    blocks.forEach((block) => {
      hljs.highlightElement(block);
    });
  }, [snippets, expandedIds]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEdit(snippet) {
    setError("");
    setSuccess("");
    setEditingSnippetId(snippet.id);
    setForm({
      title: snippet.title,
      code: snippet.code,
    });
    setExpandedIds((current) =>
      current.includes(snippet.id) ? current : [...current, snippet.id]
    );
  }

  function handleCancelEdit() {
    setEditingSnippetId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    if (!session) {
      setError("Sign in before saving snippets.");
      return;
    }

    const title = form.title.trim();
    const code = form.code.trim();

    if (!title || !code) {
      setError("Title and code snippet are required.");
      return;
    }

    setIsSaving(true);

    if (editingSnippetId) {
      const { error: saveError } = await supabase
        .from("snippets")
        .update({ title, code })
        .eq("id", editingSnippetId);

      if (saveError) {
        setError(saveError.message);
        setIsSaving(false);
        return;
      }

      setSnippets((current) =>
        current.map((snippet) =>
          snippet.id === editingSnippetId
            ? {
                ...snippet,
                title,
                code,
              }
            : snippet
        )
      );
      setSuccess("Snippet updated.");
    } else {
      const { data, error: saveError } = await supabase
        .from("snippets")
        .insert([{ title, code }])
        .select("id, title, code, created_at")
        .single();

      if (saveError) {
        setError(saveError.message);
        setIsSaving(false);
        return;
      }

      setSnippets((current) => [data, ...current]);
      setExpandedIds((current) => [data.id, ...current]);
      setSuccess("Snippet saved.");
    }

    setEditingSnippetId(null);
    setForm(initialForm);
    setIsSaving(false);
  }

  function toggleSnippet(snippetId) {
    setExpandedIds((current) =>
      current.includes(snippetId)
        ? current.filter((id) => id !== snippetId)
        : [...current, snippetId]
    );
  }

  async function handleDelete(snippet) {
    setError("");
    setSuccess("");

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    if (!session) {
      setError("Sign in before deleting snippets.");
      return;
    }

    const shouldDelete = window.confirm(
      `Delete "${snippet.title}"? This action cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingSnippetId(snippet.id);

    try {
      const { error: deleteError } = await supabase
        .from("snippets")
        .delete()
        .eq("id", snippet.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      setSnippets((current) =>
        current.filter((currentSnippet) => currentSnippet.id !== snippet.id)
      );
      setExpandedIds((current) =>
        current.filter((id) => id !== snippet.id)
      );

      if (editingSnippetId === snippet.id) {
        setEditingSnippetId(null);
        setForm(initialForm);
      }

      setSuccess("Snippet deleted.");
    } catch {
      setError("Unable to delete the snippet. Please try again.");
    } finally {
      setDeletingSnippetId(null);
    }
  }

  return (
    <div className="d-flex justify-content-center">
      <article className="w-75 max-w-sm mx-auto">
        <header className="mb-4 text-center">
          <h1>Snippets</h1>
        </header>

        {error ? <Alert variant="danger">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        {session ? (
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="snippet-title">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Example: Docker login command"
                    maxLength={120}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="snippet-code">
                  <Form.Label>Code Snippet</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="Paste code here"
                  />
                </Form.Group>

                <Button type="submit" disabled={isSaving || !supabase}>
                  {isSaving
                    ? "Saving..."
                    : editingSnippetId
                      ? "Update Snippet"
                      : "Save Snippet"}
                </Button>
                {editingSnippetId ? (
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                ) : null}
              </Form>
            </Card.Body>
          </Card>
        ) : null}

        <section className="mt-0 border-0 pt-0">

          {isLoading ? (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" />
              <span>Loading snippets...</span>
            </div>
          ) : null}

          {!isLoading && snippets.length === 0 ? (
            <p>No snippets saved yet.</p>
          ) : null}

          {snippets.map((snippet) => (
            <Card className="mb-3" key={snippet.id}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <h5 className="mb-2">{snippet.title}</h5>
                    <small className="text-muted">
                      
                    </small>
                  </div>
                  <div className="d-flex gap-2 ms-auto">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => toggleSnippet(snippet.id)}
                      aria-expanded={expandedIds.includes(snippet.id)}
                    >
                      {expandedIds.includes(snippet.id) ? "Collapse" : "Expand"}
                    </Button>
                    {session ? (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(snippet)}
                        disabled={deletingSnippetId === snippet.id}
                      >
                        Edit
                      </Button>
                    ) : null}
                    {session ? (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(snippet)}
                        disabled={deletingSnippetId !== null}
                      >
                        {deletingSnippetId === snippet.id
                          ? "Deleting..."
                          : "Delete"}
                      </Button>
                    ) : null}
                  </div>
                </div>
                <Collapse in={expandedIds.includes(snippet.id)}>
                  <div>
                    <pre className="mb-0 mt-3">
                      <code className="language-java">{snippet.code}</code>
                    </pre>
                  </div>
                </Collapse>
              </Card.Body>
            </Card>
          ))}
        </section>
      </article>
    </div>
  );
}
