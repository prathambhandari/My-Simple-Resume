import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResumeData, defaultResumeData, TemplateType } from "@/types/resume";
import { ChatMessage } from "@/types/chat";
import { AppUi, defaultAppUi } from "@/types/ui";
import { MAX_DOCUMENTS, PreviewMode, ResumeDocument } from "@/types/document";
import { isValidTemplateId } from "@/lib/resumeTemplates";
import { normalizeUi } from "@/lib/normalizeUi";
import { normalizeResume } from "@/lib/normalizeResume";
import {
  MAX_RESUME_VERSIONS,
  ResumeVersion,
  cloneResume,
  resumesEqual,
} from "@/lib/resumeHistory";

function isApiErrorMessage(content: string) {
  return /out of quota|API key was rejected|Could not reach the AI|rate-limited|GROQ_API_KEY|OPENAI_API_KEY|platform\.openai\.com/i.test(
    content,
  );
}

function newId() {
  return crypto.randomUUID();
}

function snapshot(
  state: { data: ResumeData; template: TemplateType },
  label: string,
): ResumeVersion {
  return {
    id: newId(),
    at: Date.now(),
    label,
    data: cloneResume(state.data),
    template: state.template,
  };
}

function makeDocument(partial?: Partial<ResumeDocument>): ResumeDocument {
  return {
    id: partial?.id || newId(),
    name: partial?.name || "Resume 1",
    data: cloneResume(partial?.data || defaultResumeData),
    template: partial?.template || "standard",
    themeColor: partial?.themeColor || "#111111",
    messages: partial?.messages || [],
    past: partial?.past || [],
    future: partial?.future || [],
    coverLetter: partial?.coverLetter || "",
    updatedAt: Date.now(),
  };
}

function activeFrom(state: {
  documents: ResumeDocument[];
  activeId: string;
  data: ResumeData;
  template: TemplateType;
  themeColor: string;
  messages: ChatMessage[];
  past: ResumeVersion[];
  future: ResumeVersion[];
  coverLetter: string;
}): ResumeDocument {
  return {
    id: state.activeId,
    name:
      state.documents.find((doc) => doc.id === state.activeId)?.name ||
      state.data.personalInfo.fullName.trim() ||
      "Resume",
    data: state.data,
    template: state.template,
    themeColor: state.themeColor,
    messages: state.messages,
    past: state.past,
    future: state.future,
    coverLetter: state.coverLetter,
    updatedAt: Date.now(),
  };
}

function applyDocument(doc: ResumeDocument) {
  return {
    activeId: doc.id,
    data: cloneResume(doc.data),
    template: doc.template,
    themeColor: doc.themeColor,
    messages: doc.messages,
    past: doc.past,
    future: doc.future,
    coverLetter: doc.coverLetter,
  };
}

function writeActive(
  state: ResumeStateValues,
  patch: Partial<ResumeStateValues>,
) {
  const next = { ...state, ...patch };
  const current = activeFrom(next);
  const documents = (state.documents.length ? state.documents : [current]).map(
    (doc) => (doc.id === next.activeId ? { ...doc, ...current } : doc),
  );
  return { ...next, documents };
}

type ResumeStateValues = {
  data: ResumeData;
  template: TemplateType;
  themeColor: string;
  ui: AppUi;
  messages: ChatMessage[];
  past: ResumeVersion[];
  future: ResumeVersion[];
  coverLetter: string;
  previewMode: PreviewMode;
  documents: ResumeDocument[];
  activeId: string;
};

interface ResumeState extends ResumeStateValues {
  setData: (data: ResumeData, meta?: { label?: string; record?: boolean }) => void;
  setTemplate: (template: TemplateType, meta?: { record?: boolean }) => void;
  setThemeColor: (color: string) => void;
  setUi: (ui: AppUi) => void;
  setCoverLetter: (coverLetter: string) => void;
  setPreviewMode: (previewMode: PreviewMode) => void;
  addMessage: (message: ChatMessage) => void;
  undo: () => void;
  redo: () => void;
  restoreVersion: (id: string) => void;
  createDocument: () => void;
  switchDocument: (id: string) => void;
  renameDocument: (id: string, name: string) => void;
  duplicateDocument: () => void;
  deleteDocument: (id: string) => void;
  importBackup: (payload: unknown) => string | null;
  resetStore: () => void;
}

const firstId = "resume-1";

const initialState: ResumeStateValues = {
  data: defaultResumeData,
  template: "standard",
  themeColor: "#111111",
  ui: defaultAppUi,
  messages: [],
  past: [],
  future: [],
  coverLetter: "",
  previewMode: "resume",
  activeId: firstId,
  documents: [
    makeDocument({
      id: firstId,
      name: "Resume 1",
    }),
  ],
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      ...initialState,

      setData: (data, meta) =>
        set((state) => {
          if (resumesEqual(state.data, data)) return state;
          if (meta?.record === false) return writeActive(state, { data });
          return writeActive(state, {
            data,
            past: [...state.past, snapshot(state, meta?.label || "Edit")].slice(
              -MAX_RESUME_VERSIONS,
            ),
            future: [],
          });
        }),

      setTemplate: (template, meta) =>
        set((state) => {
          if (state.template === template) return state;
          if (meta?.record === false) return writeActive(state, { template });
          return writeActive(state, {
            template,
            past: [...state.past, snapshot(state, "Template")].slice(
              -MAX_RESUME_VERSIONS,
            ),
            future: [],
          });
        }),

      setThemeColor: (color) =>
        set((state) => writeActive(state, { themeColor: color })),

      setUi: (ui) => set({ ui: normalizeUi(ui) }),

      setCoverLetter: (coverLetter) =>
        set((state) => writeActive(state, { coverLetter })),

      setPreviewMode: (previewMode) => set({ previewMode }),

      addMessage: (message) =>
        set((state) =>
          writeActive(state, { messages: [...state.messages, message] }),
        ),

      undo: () =>
        set((state) => {
          const previous = state.past[state.past.length - 1];
          if (!previous) return state;
          return writeActive(state, {
            data: cloneResume(previous.data),
            template: previous.template,
            past: state.past.slice(0, -1),
            future: [...state.future, snapshot(state, "Current")].slice(
              -MAX_RESUME_VERSIONS,
            ),
          });
        }),

      redo: () =>
        set((state) => {
          const next = state.future[state.future.length - 1];
          if (!next) return state;
          return writeActive(state, {
            data: cloneResume(next.data),
            template: next.template,
            future: state.future.slice(0, -1),
            past: [...state.past, snapshot(state, "Current")].slice(
              -MAX_RESUME_VERSIONS,
            ),
          });
        }),

      restoreVersion: (id) =>
        set((state) => {
          const match = state.past.find((version) => version.id === id);
          if (!match) return state;
          return writeActive(state, {
            data: cloneResume(match.data),
            template: match.template,
            past: [...state.past, snapshot(state, "Before restore")].slice(
              -MAX_RESUME_VERSIONS,
            ),
            future: [],
          });
        }),

      createDocument: () =>
        set((state) => {
          if (state.documents.length >= MAX_DOCUMENTS) return state;
          const current = activeFrom(state);
          const created = makeDocument({
            name: `Resume ${state.documents.length + 1}`,
          });
          return {
            ...applyDocument(created),
            documents: [
              ...state.documents.map((doc) =>
                doc.id === state.activeId ? current : doc,
              ),
              created,
            ],
          };
        }),

      switchDocument: (id) =>
        set((state) => {
          const next = state.documents.find((doc) => doc.id === id);
          if (!next || next.id === state.activeId) return state;
          const current = activeFrom(state);
          const documents = state.documents.map((doc) =>
            doc.id === state.activeId ? current : doc,
          );
          return {
            ...applyDocument(next),
            documents,
            previewMode: state.previewMode,
            ui: state.ui,
          };
        }),

      renameDocument: (id, name) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, name: name.trim() || doc.name } : doc,
          ),
        })),

      duplicateDocument: () =>
        set((state) => {
          if (state.documents.length >= MAX_DOCUMENTS) return state;
          const copy = makeDocument({
            ...activeFrom(state),
            id: newId(),
            name: `${activeFrom(state).name} copy`,
          });
          return {
            ...applyDocument(copy),
            documents: [...state.documents, copy],
          };
        }),

      deleteDocument: (id) =>
        set((state) => {
          if (state.documents.length <= 1) return state;
          const documents = state.documents.filter((doc) => doc.id !== id);
          if (state.activeId !== id) return { documents };
          return {
            ...applyDocument(documents[0]),
            documents,
          };
        }),

      importBackup: (payload) => {
        if (!payload || typeof payload !== "object") return "Invalid backup file.";
        const raw = payload as { documents?: unknown; data?: unknown };
        const list = Array.isArray(raw.documents)
          ? raw.documents
          : raw.data
            ? [{ data: raw.data, template: (payload as { template?: unknown }).template }]
            : null;
        if (!list || list.length === 0) return "No resumes found in that file.";

        const documents = list.slice(0, MAX_DOCUMENTS).map((item, index) => {
          const doc = (item || {}) as Partial<ResumeDocument>;
          return makeDocument({
            id: typeof doc.id === "string" ? doc.id : newId(),
            name: doc.name || `Imported ${index + 1}`,
            data: normalizeResume(doc.data, defaultResumeData),
            template: isValidTemplateId(doc.template) ? doc.template : "standard",
            themeColor: doc.themeColor || "#111111",
            messages: Array.isArray(doc.messages) ? doc.messages : [],
            past: Array.isArray(doc.past) ? doc.past : [],
            future: Array.isArray(doc.future) ? doc.future : [],
            coverLetter: doc.coverLetter || "",
          });
        });
        const active = documents[0];
        set({
          ...applyDocument(active),
          documents,
        });
        return null;
      },

      resetStore: () =>
        set((state) => {
          const id = newId();
          return {
            ...initialState,
            ui: state.ui,
            activeId: id,
            documents: [makeDocument({ id, name: "Resume 1" })],
          };
        }),
    }),
    {
      name: "simple-resume-chat",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!isValidTemplateId(state.template)) state.template = "standard";
        state.ui = normalizeUi(state.ui);
        state.past = Array.isArray(state.past) ? state.past : [];
        state.future = Array.isArray(state.future) ? state.future : [];
        state.coverLetter = state.coverLetter || "";
        state.previewMode =
          state.previewMode === "cover" ? "cover" : "resume";
        state.messages = (state.messages || []).filter(
          (message) =>
            !(message.role === "assistant" && isApiErrorMessage(message.content)),
        );
        if (!Array.isArray(state.documents) || state.documents.length === 0) {
          const id = state.activeId || newId();
          state.activeId = id;
          state.documents = [
            makeDocument({
              id,
              name: state.data?.personalInfo?.fullName?.trim() || "Resume 1",
              data: state.data,
              template: state.template,
              themeColor: state.themeColor,
              messages: state.messages,
              past: state.past,
              future: state.future,
              coverLetter: state.coverLetter,
            }),
          ];
        }
        const active =
          state.documents.find((doc) => doc.id === state.activeId) ||
          state.documents[0];
        state.activeId = active.id;
      },
    },
  ),
);
