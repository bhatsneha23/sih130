"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader, Button, Panel } from "@/components/ui";
import { createProject } from "@/lib/api";
import type { CreateProjectInput, ProjectStage, SiteStatus } from "@/contracts/project-full";

type ChatPhase = "chat" | "preparing" | "form" | "success";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type QuestionId =
  | "name"
  | "organization"
  | "sector"
  | "description"
  | "location"
  | "stage"
  | "investmentAmount"
  | "siteStatus";

type Question = {
  id: QuestionId;
  prompt: string;
  required: boolean;
  hint?: string;
};

const QUESTIONS: Question[] = [
  {
    id: "name",
    prompt: "What is the name of your industrial project?",
    required: true,
    hint: "e.g. Vasavi Food Processing Unit"
  },
  {
    id: "organization",
    prompt: "Which organization or company is leading this project?",
    required: true,
    hint: "e.g. Gujarat Industrial Growth Cell"
  },
  {
    id: "sector",
    prompt: "What industry sector does this project belong to?",
    required: false,
    hint: "Manufacturing, Food processing, Textiles, Metals, Electronics, or Automotive. You can also type Skip."
  },
  {
    id: "description",
    prompt: "Briefly describe the project (what you plan to build or expand).",
    required: false,
    hint: "A short paragraph is enough. Type Skip to leave this blank."
  },
  {
    id: "location",
    prompt: "Where will the project be located? (state, district, or city)",
    required: false,
    hint: "e.g. Vadodara, Gujarat. Type Skip if not decided yet."
  },
  {
    id: "stage",
    prompt: "What stage is the project currently in?",
    required: false,
    hint: "Planning, Land acquisition, Construction, Pre-operational, or Operational. Type Skip for Planning."
  },
  {
    id: "investmentAmount",
    prompt: "What is the approximate investment amount?",
    required: false,
    hint: "e.g. ₹12.5 Cr. Type Skip if unknown."
  },
  {
    id: "siteStatus",
    prompt: "What is the current site status?",
    required: false,
    hint: "Unallocated, Allocated, Possession taken, or Developed. Type Skip for Unallocated."
  }
];

const DEFAULT_FORM: CreateProjectInput = {
  name: "",
  organization: "",
  sector: "Manufacturing",
  description: "",
  location: "",
  stage: "planning",
  investmentAmount: "",
  siteStatus: "identified"
};

function normalizeStage(raw: string): ProjectStage {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (v.includes("land")) return "land_acquisition";
  if (v.includes("construct")) return "construction";
  if (v.includes("pre")) return "pre_operational";
  if (v.includes("operat")) return "operational";
  return "planning";
}

function normalizeSiteStatus(raw: string): SiteStatus {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (v.includes("lease")) return "leased";
  if (v.includes("own")) return "owned";
  if (v.includes("develop") || v.includes("under")) return "under_development";
  return "identified";
}

function normalizeSector(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (v.includes("food")) return "Food processing";
  if (v.includes("textile")) return "Textiles";
  if (v.includes("metal")) return "Metals";
  if (v.includes("electron")) return "Electronics";
  if (v.includes("auto")) return "Automotive";
  if (v.includes("manufact")) return "Manufacturing";
  return raw.trim() || "Manufacturing";
}

function isSkip(text: string) {
  return /^(skip|na|n\/a|none|-)$/i.test(text.trim());
}

export default function NewProjectPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<ChatPhase>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [draftAnswers, setDraftAnswers] = useState<Partial<CreateProjectInput>>({});
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState<CreateProjectInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProjectInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message + first question
  useEffect(() => {
    if (messages.length > 0) return;
    const welcome: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content:
        "Hi — I’ll help you set up a new project profile for IndusAI. I’ll ask a few short questions one at a time. You can type Skip for optional fields. Ready?"
    };
    const first: ChatMessage = {
      id: `q-${QUESTIONS[0].id}`,
      role: "assistant",
      content: QUESTIONS[0].prompt + (QUESTIONS[0].hint ? `\n\n${QUESTIONS[0].hint}` : "")
    };
    setMessages([welcome, first]);
  }, [messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  useEffect(() => {
    if (phase === "chat") {
      inputRef.current?.focus();
    }
  }, [phase, questionIndex]);

  const progress = Math.min(questionIndex, QUESTIONS.length);
  const progressPct = Math.round((progress / QUESTIONS.length) * 100);

  const applyAnswer = (qid: QuestionId, raw: string) => {
    const skipped = isSkip(raw);
    setDraftAnswers((prev) => {
      const next = { ...prev };
      switch (qid) {
        case "name":
          next.name = skipped ? prev.name ?? "" : raw.trim();
          break;
        case "organization":
          next.organization = skipped ? prev.organization ?? "" : raw.trim();
          break;
        case "sector":
          next.sector = skipped ? "Manufacturing" : normalizeSector(raw);
          break;
        case "description":
          next.description = skipped ? "" : raw.trim();
          break;
        case "location":
          next.location = skipped ? "" : raw.trim();
          break;
        case "stage":
          next.stage = skipped ? "planning" : normalizeStage(raw);
          break;
        case "investmentAmount":
          next.investmentAmount = skipped ? "" : raw.trim();
          break;
        case "siteStatus":
          next.siteStatus = skipped ? "identified" : normalizeSiteStatus(raw);
          break;
      }
      return next;
    });
  };

  const finishChatAndShowForm = (finalAnswers: Partial<CreateProjectInput>) => {
    setPhase("preparing");
    const merged: CreateProjectInput = {
      ...DEFAULT_FORM,
      ...finalAnswers,
      name: (finalAnswers.name ?? "").trim(),
      organization: (finalAnswers.organization ?? "").trim()
    };
    // Brief “preparing” state, then show the same form prefilled
    window.setTimeout(() => {
      setFormData(merged);
      setPhase("form");
    }, 900);
  };

  const handleSend = () => {
    const text = chatInput.trim();
    if (!text || isSending || phase !== "chat") return;

    const current = QUESTIONS[questionIndex];
    if (!current) return;

    // Required fields cannot be skipped empty
    if (current.required && isSkip(text)) {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: text },
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `This field is required. Please enter a ${current.id === "name" ? "project name" : "organization name"}.`
        }
      ]);
      setChatInput("");
      return;
    }
    if (current.required && !text.trim()) return;

    setIsSending(true);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    applyAnswer(current.id, text);

    const nextIndex = questionIndex + 1;

    // Build answers including this turn (state update is async)
    const tentative: Partial<CreateProjectInput> = { ...draftAnswers };
    if (current.id === "name") tentative.name = isSkip(text) ? tentative.name ?? "" : text.trim();
    if (current.id === "organization")
      tentative.organization = isSkip(text) ? tentative.organization ?? "" : text.trim();
    if (current.id === "sector") tentative.sector = isSkip(text) ? "Manufacturing" : normalizeSector(text);
    if (current.id === "description") tentative.description = isSkip(text) ? "" : text.trim();
    if (current.id === "location") tentative.location = isSkip(text) ? "" : text.trim();
    if (current.id === "stage") tentative.stage = isSkip(text) ? "planning" : normalizeStage(text);
    if (current.id === "investmentAmount")
      tentative.investmentAmount = isSkip(text) ? "" : text.trim();
    if (current.id === "siteStatus")
      tentative.siteStatus = isSkip(text) ? "identified" : normalizeSiteStatus(text);

    window.setTimeout(() => {
      if (nextIndex >= QUESTIONS.length) {
        setMessages((prev) => [
          ...prev,
          {
            id: `done-${Date.now()}`,
            role: "assistant",
            content:
              "Thanks — I have everything I need. Preparing your project profile so you can review and edit it before creating."
          }
        ]);
        setQuestionIndex(QUESTIONS.length);
        setIsSending(false);
        finishChatAndShowForm(tentative);
        return;
      }

      setQuestionIndex(nextIndex);
      const nextQ = QUESTIONS[nextIndex];
      setMessages((prev) => [
        ...prev,
        {
          id: `q-${nextQ.id}-${Date.now()}`,
          role: "assistant",
          content: nextQ.prompt + (nextQ.hint ? `\n\n${nextQ.hint}` : "")
        }
      ]);
      setIsSending(false);
    }, 350);
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof CreateProjectInput, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.organization.trim()) newErrors.organization = "Organization name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createProject(formData);
      setCreatedProjectId(created.id);
      setIsSuccess(true);
      setPhase("success");
      // Navigate to the real project detail page using the API-returned id
      window.setTimeout(() => {
        router.push(`/projects/${encodeURIComponent(created.id)}`);
      }, 1200);
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to create project. Your answers are still here — you can try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateProjectInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const backToChat = () => {
    setPhase("chat");
    setSubmitError(null);
    // Resume from last unanswered question if needed; otherwise stay at end
    if (questionIndex >= QUESTIONS.length) {
      setQuestionIndex(QUESTIONS.length - 1);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#172b3a] focus:border-[#27628a] focus:outline-none focus:ring-2 focus:ring-[#27628a]/20";
  const labelClass = "block text-sm font-medium text-[#172b3a] mb-1.5";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <AppShell>
      <PageHeader
        title="New Project"
        description={
          phase === "chat" || phase === "preparing"
            ? "Answer a few questions and we’ll prepare your project profile."
            : "Review and edit the details before creating the project."
        }
      />

      <div className="mx-auto max-w-3xl p-6">
        {/* ——— Chat phase ——— */}
        {(phase === "chat" || phase === "preparing") && (
          <Panel className="flex flex-col overflow-hidden p-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#172b3a]">Project setup assistant</p>
                <p className="text-xs text-slate-500">
                  {Math.min(questionIndex + (phase === "preparing" ? 1 : 0), QUESTIONS.length)} of{" "}
                  {QUESTIONS.length}
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#27628a] transition-all duration-300"
                  style={{ width: `${phase === "preparing" ? 100 : progressPct}%` }}
                />
              </div>
            </div>

            <div className="flex max-h-[420px] min-h-[320px] flex-col gap-3 overflow-y-auto bg-[#f8fafc] px-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={[
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "assistant"
                      ? "self-start bg-white text-[#172b3a] shadow-sm ring-1 ring-slate-200"
                      : "self-end bg-[#27628a] text-white"
                  ].join(" ")}
                >
                  {msg.content}
                </div>
              ))}
              {phase === "preparing" && (
                <div className="self-start rounded-2xl bg-white px-3.5 py-2.5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#27628a]" />
                    Preparing your project profile…
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {phase === "chat" && (
              <div className="flex gap-2 border-t border-slate-100 bg-white p-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your answer…"
                  disabled={isSending}
                  className={inputClass}
                  aria-label="Chat message"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSend}
                  disabled={isSending || !chatInput.trim()}
                >
                  Send
                </Button>
              </div>
            )}
          </Panel>
        )}

        {/* ——— Success ——— */}
        {phase === "success" && isSuccess && (
          <Panel className="py-12 text-center">
            <h2 className="mb-2 text-2xl font-bold text-[#27628a]">Project Created Successfully!</h2>
            <p className="text-slate-500">
              {createdProjectId
                ? "Opening your project workspace…"
                : "Redirecting…"}
            </p>
          </Panel>
        )}

        {/* ——— Existing form (prefilled, fully editable) ——— */}
        {phase === "form" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-600">
                Review the details collected from the conversation. Everything is editable before you create the project.
              </p>
              <Button type="button" variant="secondary" onClick={backToChat}>
                Back to conversation
              </Button>
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <Panel>
              <h3 className="mb-4 border-b border-slate-100 pb-2 text-lg font-bold text-[#172b3a]">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Apex Textile Expansion"
                  />
                  {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>

                <div>
                  <label className={labelClass}>Organization Name *</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Apex Industries Ltd"
                  />
                  {errors.organization && <p className={errorClass}>{errors.organization}</p>}
                </div>

                <div>
                  <label className={labelClass}>Industry Sector</label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Food processing">Food processing</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Metals">Metals</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[80px] resize-y`}
                    placeholder="Brief description of the project"
                  />
                </div>
              </div>
            </Panel>

            <Panel>
              <h3 className="mb-4 border-b border-slate-100 pb-2 text-lg font-bold text-[#172b3a]">
                Location
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>State / District / City</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Vadodara, Gujarat"
                  />
                </div>
              </div>
            </Panel>

            <Panel>
              <h3 className="mb-4 border-b border-slate-100 pb-2 text-lg font-bold text-[#172b3a]">
                Project Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Project Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="planning">Planning</option>
                    <option value="land_acquisition">Land Acquisition</option>
                    <option value="construction">Construction</option>
                    <option value="pre_operational">Pre-operational</option>
                    <option value="operational">Operational</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Investment Amount</label>
                  <input
                    type="text"
                    name="investmentAmount"
                    value={formData.investmentAmount}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. ₹50 Cr, $10M"
                  />
                </div>

                <div>
                  <label className={labelClass}>Site Status</label>
                  <select
                    name="siteStatus"
                    value={formData.siteStatus}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="unallocated">Unallocated</option>
                    <option value="allocated">Allocated</option>
                    <option value="possession_taken">Possession Taken</option>
                    <option value="developed">Developed</option>
                  </select>
                </div>
              </div>
            </Panel>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => router.push("/projects")}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}