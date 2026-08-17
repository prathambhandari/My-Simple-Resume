"use client";

import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_DOCUMENTS } from "@/types/document";
import { useResumeStore } from "@/store/useResumeStore";
import { toast } from "sonner";

export function ResumeSwitcher() {
  const documents = useResumeStore((state) => state.documents);
  const activeId = useResumeStore((state) => state.activeId);
  const switchDocument = useResumeStore((state) => state.switchDocument);
  const createDocument = useResumeStore((state) => state.createDocument);
  const duplicateDocument = useResumeStore((state) => state.duplicateDocument);
  const deleteDocument = useResumeStore((state) => state.deleteDocument);
  const renameDocument = useResumeStore((state) => state.renameDocument);
  const [editing, setEditing] = useState(false);

  const active = documents.find((doc) => doc.id === activeId) || documents[0];

  return (
    <div className="flex items-center gap-1">
      {editing ? (
        <input
          autoFocus
          defaultValue={active?.name || ""}
          className="h-8 w-28 rounded-lg bg-white/10 px-2 text-xs outline-none sm:w-36"
          onBlur={(event) => {
            renameDocument(activeId, event.target.value);
            setEditing(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              renameDocument(activeId, event.currentTarget.value);
              setEditing(false);
            }
          }}
        />
      ) : (
        <select
          value={activeId}
          className="h-8 max-w-28 rounded-lg bg-transparent px-1 text-xs outline-none sm:max-w-40 sm:px-2"
          onChange={(event) => switchDocument(event.target.value)}
          onDoubleClick={() => setEditing(true)}
          title="Double-click to rename"
        >
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id} className="bg-neutral-900">
              {doc.name}
            </option>
          ))}
        </select>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="New resume"
        disabled={documents.length >= MAX_DOCUMENTS}
        onClick={() => {
          createDocument();
          toast.success("New resume created.");
        }}
      >
        <Plus />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="hidden sm:inline-flex"
        aria-label="Duplicate resume"
        disabled={documents.length >= MAX_DOCUMENTS}
        onClick={() => {
          duplicateDocument();
          toast.success("Resume duplicated.");
        }}
      >
        <Copy />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="hidden sm:inline-flex"
        aria-label="Delete resume"
        disabled={documents.length <= 1}
        onClick={() => {
          if (window.confirm("Delete this resume?")) deleteDocument(activeId);
        }}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
