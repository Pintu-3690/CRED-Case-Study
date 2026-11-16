import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, RotateCcw, Sparkles, Square, AlertCircle } from "lucide-react";

const STARTER_QUERIES = [
  "What is CRED's live share price & implied market cap?",
  "Break down CRED's 132.04 Cr shares & cap table",
  "How did CRED cut FY25 operating losses by 51%?",
  "Explain CRED's CIBIL 750+ underwriting moat",
];

function renderFormattedLine(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={idx} className="chat-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function FormattedMessage({ content }) {
  const lines = String(content || "").split("\n");
  return (
    <div className="chat-msg-prose">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="chat-line-spacer" />;
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={i} className="chat-bullet-row">
              <span className="chat-bullet-dot" aria-hidden="true">•</span>
              <span>{renderFormattedLine(trimmed.slice(2))}</span>
            </div>
          );
        }
        return <p key={i}>{renderFormattedLine(line)}</p>;
      })}
    </div>
  );
}

export default function CredAssistantWidget({ credQuote }) {
  const livePrice = Number(credQuote?.price || 284.5).toFixed(2);
  const initialGreeting = {
    id: "welcome",
    role: "assistant",
    content: `Ask any question about CRED (Dreamplug Technologies) — from the live **CRED:UNLST** share price (₹${livePrice}), **132.04 Cr** share cap table, and **FY23–FY25 financials** to business model strategy or how to use this terminal.`,
  };

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("standard"); // "standard" (gemini-4-hydrogen) | "fast" (gemini-3.1-flash-lite)
  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const threadEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (isOpen && threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isStreaming]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleReset = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    setErrorMsg("");
    setMessages([
      {
        ...initialGreeting,
        id: `welcome-${Date.now()}`,
      },
    ]);
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setIsStreaming(false);
    }
  };

  const sendMessage = async (textOverride) => {
    const query = (typeof textOverride === "string" ? textOverride : input).trim();
    if (!query || isStreaming) return;

    setErrorMsg("");
    if (typeof textOverride !== "string") {
      setInput("");
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
    };

    const assistantId = `assistant-${Date.now() + 1}`;
    const placeholderAssistant = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, placeholderAssistant]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const evt of events) {
          const line = evt.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;

          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.error) {
              setErrorMsg(payload.error);
              break;
            }
            if (payload.text) {
              accumulated += payload.text;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
              );
            }
          } catch {
            // Skip malformed SSE fragment
          }
        }
      }

      if (!accumulated) {
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setErrorMsg(err.message || "Unable to reach CRED Research Desk.");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.trim().length > 0));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showQuickStarters = messages.length <= 1;

  return (
    <div className="cred-chat-root">
      {isOpen && (
        <aside className="cred-chat-panel" aria-label="CRED Research Query Assistant">
          <div className="chat-panel-header">
            <div className="chat-title-group">
              <div className="chat-avatar-badge">
                <Sparkles size={15} className="text-green" />
              </div>
              <div>
                <div className="chat-panel-title">CRED Research Desk</div>
                <div className="chat-panel-sub tabular-nums">
                  CRED:UNLST ₹{livePrice} · Multi-turn Analyst
                </div>
              </div>
            </div>

            <div className="chat-header-actions">
              <div className="chat-mode-switch" role="group" aria-label="Response mode">
                <button
                  type="button"
                  onClick={() => setMode("standard")}
                  className={`chat-mode-btn ${mode === "standard" ? "active" : ""}`}
                  title="Balanced analytical replies (gemini-4-hydrogen)"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setMode("fast")}
                  className={`chat-mode-btn ${mode === "fast" ? "active" : ""}`}
                  title="Low-latency quick replies (gemini-3.1-flash-lite)"
                >
                  Fast
                </button>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="chat-icon-btn"
                title="New conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="chat-icon-btn"
                title="Close assistant"
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="chat-thread" role="log" aria-live="polite">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isPlaceholder = !isUser && !msg.content && isStreaming;
              return (
                <div key={msg.id} className={`chat-turn ${isUser ? "turn-user" : "turn-assistant"}`}>
                  <div className="chat-turn-meta">
                    <span>{isUser ? "You" : "CRED Analyst"}</span>
                  </div>
                  <div className={`chat-bubble ${isUser ? "bubble-user" : "bubble-assistant"}`}>
                    {isPlaceholder ? (
                      <span className="chat-typing-dots" aria-label="Analyzing query">
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : isUser ? (
                      <p>{msg.content}</p>
                    ) : (
                      <FormattedMessage content={msg.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {showQuickStarters && (
              <div className="chat-starters-block">
                <span className="chat-starters-label">Suggested Queries</span>
                <div className="chat-starters-list">
                  {STARTER_QUERIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="chat-starter-btn"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="chat-error-banner" role="alert">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about CRED shares, financials, moat, or terminal..."
              rows={1}
              className="chat-textarea"
              aria-label="Ask a question about CRED"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStop}
                className="chat-send-btn stop"
                title="Stop generating"
                aria-label="Stop response"
              >
                <Square size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="chat-send-btn"
                title="Send message"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            )}
          </form>
        </aside>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`cred-chat-launcher ${isOpen ? "is-open" : ""}`}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close CRED Help Chatbot" : "Open CRED Help Chatbot"}
      >
        {isOpen ? <X size={18} /> : <MessageSquare size={18} />}
        <span>{isOpen ? "Close Desk" : "Ask CRED Analyst"}</span>
      </button>
    </div>
  );
}
