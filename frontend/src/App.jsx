import React, { useState, useEffect, useRef } from "react";
import "./styles.scss";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem("sid"));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      fetch(`${API}/api/session`, { method: "POST" })
        .then(r => r.json())
        .then(d => {
          setSessionId(d.sessionId);
          localStorage.setItem("sid", d.sessionId);
        });
    } else {
      fetch(`${API}/api/session/${sessionId}/history`)
        .then(r => r.json())
        .then(d => setMessages(d.messages || []));
    }
  }, [sessionId]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const res = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: userMsg.text })
    });
    const data = await res.json();

    setMessages(prev => [
      ...prev,
      { role: "assistant", text: data.answer, ts: Date.now() }
    ]);
  };

  const reset = async () => {
    await fetch(`${API}/api/session/${sessionId}/reset`, { method: "POST" });
    setMessages([]);
    localStorage.removeItem("sid");
    setSessionId(null);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-app">
      <header className="chat-header">
        <h2>RAG Chatbot</h2>
        <button className="reset-btn" onClick={reset}>Reset</button>
      </header>

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <span>{m.text}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="input-box">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about the news..."
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}

export default App;
