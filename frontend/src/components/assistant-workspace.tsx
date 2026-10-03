"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, EmptyState, PageHeader, Panel, StatusBadge } from "@/components/ui";
import type {
  ActivityEvent,
  ApprovalRequest,
  AssistantConversation,
  AssistantMessage,
  AssistantTool,
  NotificationItem
} from "@/contracts/workflows";
import {
  getActivity,
  getApprovalRequests,
  getAssistantTools,
  getConversations,
  getNotifications,
  markNotificationsRead,
  respondToApprovalRequest,
  retryAssistantTurn,
  sendAssistantPrompt,
  createConversation
} from "@/lib/api";

const PROJECT_ID = "proj-vasavi-food-processing";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function AssistantWorkspace() {
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [tools, setTools] = useState<AssistantTool[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [conversationData, toolData, notificationData, activityData, requestData] = await Promise.all([
          getConversations(PROJECT_ID),
          getAssistantTools(),
          getNotifications(PROJECT_ID),
          getActivity(PROJECT_ID),
          getApprovalRequests(PROJECT_ID)
        ]);

        if (!active) return;

        setConversations(conversationData);
        setSelectedConversationId((current) => current ?? conversationData[0]?.id ?? null);
        setTools(toolData);
        setNotifications(notificationData);
        setActivity(activityData);
        setRequests(requestData);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "The assistant could not be loaded.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0] ?? null,
    [conversations, selectedConversationId]
  );

  async function refreshAll() {
    const [conversationData, notificationData, activityData, requestData] = await Promise.all([
      getConversations(PROJECT_ID),
      getNotifications(PROJECT_ID),
      getActivity(PROJECT_ID),
      getApprovalRequests(PROJECT_ID)
    ]);
    setConversations(conversationData);
    setNotifications(notificationData);
    setActivity(activityData);
    setRequests(requestData);
  }

  async function handleNewConversation() {
    const next = await createConversation(PROJECT_ID);
    setConversations((current) => [next, ...current]);
    setSelectedConversationId(next.id);
  }

  async function handleSend() {
    if (!prompt.trim() || !selectedConversation) return;
    setSending(true);
    setError(null);
    try {
      const next = await sendAssistantPrompt(PROJECT_ID, selectedConversation.id, prompt.trim());
      setConversations((current) => current.map((conversation) => (conversation.id === next.id ? next : conversation)));
      setSelectedConversationId(next.id);
      setPrompt("");
      await refreshAll();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "The assistant prompt could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function handleRetry() {
    if (!selectedConversation) return;
    try {
      const next = await retryAssistantTurn(PROJECT_ID, selectedConversation.id);
      setConversations((current) => current.map((conversation) => (conversation.id === next.id ? next : conversation)));
      setSelectedConversationId(next.id);
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "The assistant could not regenerate its answer.");
    }
  }

  async function handleApprovalDecision(requestId: string, decision: "approved" | "rejected") {
    const confirmed = window.confirm(
      decision === "approved"
        ? "Confirm that you want to approve this mock action? This is a simulated approval step."
        : "Reject this mock action? This requires explicit confirmation in the demo workflow."
    );

    if (!confirmed) return;

    try {
      const next = await respondToApprovalRequest(PROJECT_ID, requestId, decision);
      setRequests(next);
      await refreshAll();
      await markNotificationsRead(PROJECT_ID);
      setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The approval action could not be completed.");
    }
  }

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map((index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project AI"
        title="AI assistant"
        description="Ask contextual questions about the project roadmap, documents, regulatory dependencies, and likely next actions."
        actions={<StatusBadge tone="info">Mock guidance</StatusBadge>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr_0.7fr]">
        <Panel title="Conversations">
          <div className="mb-4 flex justify-between gap-2">
            <p className="text-sm text-slate-600">{conversations.length} active threads</p>
            <Button type="button" variant="secondary" onClick={handleNewConversation}>New</Button>
          </div>
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <EmptyState title="No conversations" description="Start a new context review for this project." />
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={[
                    "w-full rounded-xl border p-3 text-left",
                    selectedConversation?.id === conversation.id ? "border-[#27628a] bg-[#edf5fa]" : "border-slate-200 bg-slate-50"
                  ].join(" ")}
                >
                  <p className="text-sm font-medium text-[#172b3a]">{conversation.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(conversation.updatedAt)}</p>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel title={selectedConversation?.title ?? "Assistant"}>
          {selectedConversation ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedConversation.suggestedFollowUps.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setPrompt(question)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                  >
                    {question}
                  </button>
                ))}
              </div>

              <div className="max-h-[480px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                {selectedConversation.messages.map((message: AssistantMessage) => (
                  <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[85%] rounded-2xl bg-[#27628a] p-3 text-sm text-white" : "mr-auto max-w-[85%] rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700"}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] opacity-80">
                      <span>{formatDate(message.timestamp)}</span>
                      {message.sourceTitle ? <span>{message.sourceTitle}</span> : null}
                    </div>
                    {message.toolName ? <div className="mt-2 text-[10px] uppercase tracking-[0.12em] opacity-80">Tool: {message.toolName}</div> : null}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#27628a]"
                  placeholder="Ask about project status, documents, dependencies, or the next approval steps."
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" disabled={sending || !prompt.trim()} onClick={handleSend}>{sending ? "Sending…" : "Send"}</Button>
                  <Button type="button" variant="secondary" onClick={handleRetry}>Retry</Button>
                </div>
              </div>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            </div>
          ) : (
            <EmptyState title="No conversation selected" description="Start a new review to begin a mock assistant thread." />
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Tool menu">
            <div className="space-y-2">
              {tools.map((tool) => (
                <div key={tool.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#172b3a]">{tool.label}</p>
                    <span className={[
                      "rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
                      tool.state === "available" ? "bg-emerald-50 text-emerald-700" : tool.state === "disabled" ? "bg-amber-50 text-amber-700" : "bg-slate-200 text-slate-600"
                    ].join(" ")}>{tool.state}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{tool.detail}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Notifications" action={<Button type="button" variant="ghost" onClick={() => markNotificationsRead(PROJECT_ID)}>Mark all read</Button>}>
            <div className="space-y-2">
              {notifications.length === 0 ? <p className="text-sm text-slate-500">No notifications</p> : notifications.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[#172b3a]">{item.title}</p>
                    {item.unread ? <span className="h-2.5 w-2.5 rounded-full bg-[#27628a]" /> : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-slate-500">{formatDate(item.timestamp)}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Approval requests">
            <div className="space-y-2">
              {requests.length === 0 ? <p className="text-sm text-slate-500">No pending approval requests.</p> : requests.map((request) => (
                <div key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-[#172b3a]">{request.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{request.reason}</p>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => handleApprovalDecision(request.id, "approved")}>Approve</Button>
                    <Button type="button" variant="secondary" onClick={() => handleApprovalDecision(request.id, "rejected")}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
