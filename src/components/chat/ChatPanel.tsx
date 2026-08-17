"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/useResumeStore";
import { ChatMessage } from "@/types/chat";
import { isResumeEmpty } from "@/lib/normalizeResume";
import { cn } from "@/lib/utils";
import { tokensFromUsage, useTokenStore } from "@/store/useTokenStore";

const STARTERS = [
  "I'm a software engineer with 5 years of experience.",
  "Write a cover letter.",
  "Rewrite my summary.",
];

const ACCEPT = ".pdf,.docx,.txt,.md";
const MAX_BYTES = 4 * 1024 * 1024;

function newId() {
  return crypto.randomUUID();
}

export function ChatPanel() {
  const data = useResumeStore((state) => state.data);
  const template = useResumeStore((state) => state.template);
  const ui = useResumeStore((state) => state.ui);
  const messages = useResumeStore((state) => state.messages);
  const addMessage = useResumeStore((state) => state.addMessage);
  const setData = useResumeStore((state) => state.setData);
  const setTemplate = useResumeStore((state) => state.setTemplate);
  const setUi = useResumeStore((state) => state.setUi);
  const coverLetter = useResumeStore((state) => state.coverLetter);
  const setCoverLetter = useResumeStore((state) => state.setCoverLetter);
  const setPreviewMode = useResumeStore((state) => state.setPreviewMode);
  const addTokens = useTokenStore((state) => state.addTokens);

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((json: { configured?: boolean }) =>
        setConfigured(Boolean(json.configured)),
      )
      .catch(() => setConfigured(false));
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, sending]);

  const onPickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    event.target.value = "";
    if (!next) return;
    if (next.size > MAX_BYTES) {
      toast.error("Use a file under 4 MB.");
      return;
    }
    setFile(next);
  };

  const send = async (text: string, attached = file) => {
    const content = text.trim();
    if ((!content && !attached) || sending) return;

    const userMessage: ChatMessage = {
      id: newId(),
      role: "user",
      content:
        content ||
        (isResumeEmpty(data)
          ? `Import my full resume from ${attached?.name}.`
          : `Update my resume from ${attached?.name}.`),
      attachmentName: attached?.name,
    };

    addMessage(userMessage);
    setInput("");
    setFile(null);
    setSending(true);

    try {
      let response: Response;
      const history = [...messages, userMessage];

      if (attached) {
        const form = new FormData();
        form.set("messages", JSON.stringify(history));
        form.set("resume", JSON.stringify(data));
        form.set("template", template);
        form.set("ui", JSON.stringify(ui));
        form.set("coverLetter", coverLetter);
        form.set("file", attached);
        response = await fetch("/api/chat", {
          method: "POST",
          body: form,
        });
      } else {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            resume: data,
            template,
            ui,
            coverLetter,
          }),
        });
      }

      const json = (await response.json()) as {
        reply?: string;
        resume?: typeof data;
        template?: typeof template;
        ui?: typeof ui;
        coverLetter?: string;
        usage?: unknown;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error || "Chat failed");
      }

      if (json.resume) {
        const next = json.resume;
        const currentPhoto = data.personalInfo.photoUrl?.trim();
        if (currentPhoto && !next.personalInfo?.photoUrl?.trim()) {
          next.personalInfo = { ...next.personalInfo, photoUrl: currentPhoto };
        }
        setData(next, { label: attached ? "Import" : "Chat" });
      }
      if (json.template) setTemplate(json.template);
      if (json.ui) setUi(json.ui);
      if (typeof json.coverLetter === "string" && json.coverLetter.trim()) {
        setCoverLetter(json.coverLetter);
        setPreviewMode("cover");
      }
      addTokens(tokensFromUsage(json.usage));

      addMessage({
        id: newId(),
        role: "assistant",
        content: json.reply || "Updated your resume.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  };

  const canSend = !sending && (Boolean(input.trim()) || Boolean(file));

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 sm:gap-3">
      <div ref={listRef} className="scroll-area min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-3">
        {messages.length === 0 && !sending ? (
          <div className="space-y-3">
            <p className="glass px-4 py-3 text-sm text-muted-foreground">
              Attach a PDF to import your resume, or ask chat to write a cover
              letter. The preview updates as you chat.
            </p>
            {configured === false && (
              <p className="glass px-4 py-3 text-sm text-destructive">
                Add OPENAI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY to
                .env.local and restart the server.
              </p>
            )}
            <div className="flex flex-col gap-2">
              {STARTERS.map((starter) => (
                <Button
                  key={starter}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="glass h-auto justify-start whitespace-normal px-3 py-2 text-left font-normal"
                  onClick={() => void send(starter, null)}
                >
                  {starter}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "glass-bubble max-w-[92%] px-3.5 py-2 text-sm whitespace-pre-wrap sm:max-w-[85%]",
                  message.role === "user"
                    ? "glass-user ml-auto text-white"
                    : "glass text-foreground",
                )}
              >
                {message.attachmentName && (
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs opacity-80">
                    <Paperclip className="size-3" />
                    {message.attachmentName}
                  </div>
                )}
                {message.content}
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Updating…
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="shrink-0 pr-0 sm:pr-3">
        {file && (
          <div className="glass mb-2 flex items-center gap-2 px-2.5 py-1.5 text-xs">
            <Paperclip className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{file.name}</span>
            <button
              type="button"
              className="rounded-md p-0.5 text-muted-foreground hover:text-foreground"
              onClick={() => setFile(null)}
              aria-label="Remove file"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
        <div className="glass flex items-end gap-2 rounded-full p-1.5 pl-2">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={onPickFile}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={sending}
            aria-label="Attach file"
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip />
          </Button>
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              file
                ? "Optional note, or send to import the full resume"
                : "Message"
            }
            disabled={sending}
            rows={1}
            className="min-h-10 max-h-32 min-w-0 flex-1 resize-none rounded-full bg-transparent px-2 py-2 text-base shadow-none outline-none ring-0 backdrop-blur-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:min-h-9 sm:text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            aria-label="Send"
          >
            {sending ? <Loader2 className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
      </form>
    </div>
  );
}
