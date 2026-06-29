"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import { getSupabaseClient } from "../lib/supabase";

const initialForm = {
  title: "",
  code: "",
};

export default function SnippetsPage() {
  const supabase = getSupabaseClient();
  const [form, setForm] = useState(initialForm);
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSnippets() {
      if (!supabase) {
        setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("snippets")
        .select("id, title, code, created_at")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setSnippets(data ?? []);
      }

      setIsLoading(false);
    }

    loadSnippets();
  }, [supabase]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    const title = form.title.trim();
    const code = form.code.trim();

    if (!title || !code) {
      setError("Title and code snippet are required.");
      return;
    }

    setIsSaving(true);

    const { data, error: insertError } = await supabase
      .from("snippets")
      .insert([{ title, code }])
      .select("id, title, code, created_at")
      .single();

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    setSnippets((current) => [data, ...current]);
    setForm(initialForm);
    setSuccess("Snippet saved.");
    setIsSaving(false);
  }

  return (
    <div className="d-flex justify-content-center">
      <article className="w-75 max-w-sm mx-auto">
        <header className="mb-4 text-center">
          <h1>Snippets</h1>
          <p>Save short code snippets and review them below.</p>
        </header>

        {error ? <Alert variant="danger">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

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
                {isSaving ? "Saving..." : "Save Snippet"}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        <section className="mt-0 border-0 pt-0">
          <h2 className="mb-3">Saved Snippets</h2>

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
                  <h5 className="mb-2">{snippet.title}</h5>
                  <small className="text-muted">
                    {new Date(snippet.created_at).toLocaleString()}
                  </small>
                </div>
                <pre className="mb-0">
                  <code>{snippet.code}</code>
                </pre>
              </Card.Body>
            </Card>
          ))}
        </section>
      </article>
    </div>
  );
}
