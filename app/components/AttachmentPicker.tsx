"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Button, ProgressBar } from "react-bootstrap";
import { ACCEPTED_EXTENSIONS, formatFileSize } from "../services/attachments";
import type { PendingAttachment } from "../types/snippets";

interface AttachmentPickerProps {
  files: PendingAttachment[];
  disabled: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export default function AttachmentPicker({ files, disabled, onAdd, onRemove }: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleSelection(event: ChangeEvent<HTMLInputElement>) {
    onAdd(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) onAdd(Array.from(event.dataTransfer.files));
  }

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor="snippet-attachments">Attachments</label>
      <div
        className={`attachment-dropzone ${isDragging ? "attachment-dropzone-active" : ""}`}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false); }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id="snippet-attachments"
          type="file"
          className="visually-hidden"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleSelection}
          disabled={disabled}
        />
        <p className="mb-2">Drag files here or choose files to attach.</p>
        <Button type="button" variant="outline-primary" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
          Choose files
        </Button>
        <small className="d-block mt-2 text-body-secondary">PDF, Office, text, ZIP, PNG, or JPG. Up to 20 MB each.</small>
      </div>
      {files.length > 0 && (
        <ul className="attachment-list list-unstyled mt-3 mb-0" aria-label="Selected attachments">
          {files.map((entry) => (
            <li key={entry.id} className="attachment-list-item mb-2">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div className="text-break">
                  <strong>{entry.file.name}</strong> <small className="text-body-secondary">({formatFileSize(entry.file.size)})</small>
                  <small className={`d-block ${entry.status === "error" ? "text-danger" : "text-body-secondary"}`}>
                    {entry.error || (entry.status === "uploaded" ? "Uploaded" : entry.status === "uploading" ? `Uploading ${entry.progress}%` : "Ready to upload")}
                  </small>
                </div>
                {entry.status !== "uploaded" && (
                  <Button type="button" variant="outline-secondary" size="sm" onClick={() => onRemove(entry.id)} disabled={disabled} aria-label={`Remove ${entry.file.name}`}>
                    Remove
                  </Button>
                )}
              </div>
              {entry.status === "uploading" && <ProgressBar now={entry.progress} label={`${entry.progress}%`} className="mt-2" aria-label={`${entry.file.name} upload progress`} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
