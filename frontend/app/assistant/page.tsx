"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, PageHeader, StatusBadge, EmptyState } from "@/components/ui";
import { getConversations, createConversation, sendAssistantPrompt } from "@/lib/api";
import type { AssistantConversation, AssistantMessage } from "@/contracts/workflows";

export default function AssistantPage() {
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const projectId = "proj-vasavi-food-processing";

  useEffect(() => {
    async function loadData() {
      try {
        const convos = await getConversations(projectId);
        setConversations(convos);
        if (convos.length > 0) {
          setActiveConversationId(convos[0].id);
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages, isSending]);

  const handleNewConversation = async () => {
    try {
      const newConvo = await createConversation(projectId);
      setConversations((prev) => [newConvo, ...prev]);
      setActiveConversationId(newConvo.id);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !activeConversationId) return;
    setPrompt("");
    setIsSending(true);

    try {
      const tempMessage: AssistantMessage = {
        id: "temp-" + Date.now(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };
      
      setConversations(prev => prev.map(c => 
        c.id === activeConversationId 
          ? { ...c, messages: [...c.messages, tempMessage] }
          : c
      ));

      const updated = await sendAssistantPrompt(projectId, activeConversationId, text);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? updated : c))
      );
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(prompt);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Assistant"
        description="Ask contextual questions about project approvals, dependency sequencing, and likely next actions."
        actions={
          <Button
            variant="secondary"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Hide History" : "Show History"}
          </Button>
        }
      />

      <div className="flex h-[calc(100vh-220px)] min-h-[500px] gap-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
        {/* Sidebar */}
        <div 
          className={`absolute inset-y-0 left-0 z-10 w-72 flex-col border-r border-slate-200 bg-slate-50 transition-transform md:relative md:flex md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-slate-200 bg-white">
            <Button onClick={handleNewConversation} className="w-full">
              + New conversation
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-12 rounded-lg bg-slate-200"></div>
                <div className="h-12 rounded-lg bg-slate-200"></div>
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center mt-4">No conversations yet.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveConversationId(c.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    c.id === activeConversationId
                      ? "bg-[#edf5fa] border-[#dfeaf3] text-[#27628a]"
                      : "bg-white border-transparent hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <p className="font-medium text-sm truncate">{c.title || "New Conversation"}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs opacity-70">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs opacity-70 bg-black/5 px-1.5 py-0.5 rounded">
                      {c.messages?.length || 0} msgs
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-slate-900/20 z-0 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center">
               <div className="animate-pulse flex flex-col items-center gap-4">
                 <div className="h-8 w-8 bg-[#edf5fa] rounded-full"></div>
                 <div className="h-4 w-32 bg-slate-200 rounded"></div>
               </div>
             </div>
          ) : !activeConversation ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                title="No active conversation"
                description="Select a conversation from the sidebar or start a new one."
                action={<Button onClick={handleNewConversation}>Start Chat</Button>}
              />
            </div>
          ) : (
            <>
              {/* Banner */}
              <div className="bg-amber-50 text-amber-800 text-xs px-4 py-2 text-center border-b border-amber-100 shrink-0 z-0">
                AI responses are illustrative and based on demo project data. They do not constitute official advice.
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {activeConversation.messages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isUser ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isUser
                            ? "bg-[#27628a] text-white rounded-br-sm"
                            : "bg-white border border-slate-200 text-[#172b3a] shadow-sm rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      </div>

                      {/* Meta information for assistant messages */}
                      {!isUser && (msg.sourceTitle || msg.verificationStatus || msg.toolName) && (
                        <div className="flex flex-wrap items-center gap-2 mt-2 ml-1">
                          {msg.sourceTitle && (
                            <span className="text-xs text-slate-500 font-medium">
                              Source: {msg.sourceTitle}
                            </span>
                          )}
                          {msg.toolName && (
                            <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {msg.toolName}
                            </span>
                          )}
                          {msg.verificationStatus && (
                            <StatusBadge
                              tone={
                                msg.verificationStatus === "verified"
                                  ? "positive"
                                  : msg.verificationStatus === "illustrative"
                                  ? "info"
                                  : msg.verificationStatus === "needs_review"
                                  ? "warning"
                                  : "neutral"
                              }
                            >
                              {msg.verificationStatus}
                            </StatusBadge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Suggested follow-ups (only at the bottom if not sending and last msg is assistant) */}
                {!isSending && 
                 activeConversation.messages.length > 0 && 
                 activeConversation.messages[activeConversation.messages.length - 1].role === "assistant" && 
                 activeConversation.suggestedFollowUps && 
                 activeConversation.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                    {activeConversation.suggestedFollowUps.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(suggestion)}
                        className="text-xs text-[#27628a] bg-[#edf5fa] hover:bg-[#dfeaf3] border border-[#dfeaf3] px-3 py-1.5 rounded-full transition-colors text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {isSending && (
                  <div className="flex flex-col mr-auto items-start max-w-[85%]">
                    <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl rounded-bl-sm px-4 py-3 text-sm italic flex items-center gap-2">
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-px w-full" />
              </div>

              {/* Composer */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
                  <textarea
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-[#172b3a] focus:outline-none focus:ring-2 focus:ring-[#27628a] focus:border-transparent resize-none disabled:opacity-50"
                    placeholder="Ask a question..."
                    rows={Math.min(prompt.split("\n").length || 1, 5)}
                    style={{ minHeight: "48px" }}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                  />
                  <Button
                    onClick={() => handleSend(prompt)}
                    disabled={isSending || !prompt.trim()}
                    className="shrink-0 h-[48px] px-5"
                  >
                    Send
                  </Button>
                </div>
                <div className="text-center mt-2 text-[10px] text-slate-400">
                  Press Enter to send, Shift + Enter for new line
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
