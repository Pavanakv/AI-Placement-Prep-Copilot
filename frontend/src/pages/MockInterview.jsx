import { useState, useRef } from "react";
import { API_BASE } from "../config";
import VoiceRecorder from "../components/VoiceRecorder";

// Fix #10 — safe auth fetch helper
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "/login"; return null; }
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return null;
  }
  return res;
};

function MockInterview() {
  const [role, setRole] = useState("Frontend");
  const [level, setLevel] = useState("Beginner");
  const [focus, setFocus] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [scores, setScores] = useState([]);
  const maxQuestions = 5;
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1; u.volume = 1;
    window.speechSynthesis.speak(u);
  };

  const saveInterviewToDB = async (finalScores) => {
    try {
      await authFetch(`${API_BASE}/api/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, level, focus, scores: finalScores })
      });
    } catch (err) { console.error("Failed to save interview:", err); }
  };

  const startInterview = async () => {
    setLoading(true);
    setStarted(true);
    const res = await authFetch(`${API_BASE}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "interview",
        input: `Role: ${role}, Level: ${level}, Focus: ${focus || "General"}`,
        messages: []
      }),
    });
    if (!res) return;
    const data = await res.json();
    setMessages([{ role: "assistant", content: data.result }]);
    speakText(data.result);
    setLoading(false);
    scrollToBottom();
  };

  const sendAnswer = async () => {
    if (!input.trim() || questionCount >= maxQuestions) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    scrollToBottom();

    const res = await authFetch(`${API_BASE}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "interview",
        input: `Role: ${role}, Level: ${level}, Focus: ${focus || "General"}`,
        messages: newMessages.map(m => ({ role: m.role, content: m.content }))
      }),
    });
    if (!res) return;

    const data = await res.json();
    const match = data.result.match(/Score:\s*(\d+)/i);
    const score = match ? parseInt(match[1]) : 0;
    const newScores = [...scores, score];
    setScores(newScores);
    setMessages([...newMessages, { role: "assistant", content: data.result }]);

    // Fix #1 — only increment ONCE here, never call setQuestionCount twice
    const newCount = questionCount + 1;
    setQuestionCount(newCount);

    if (newCount >= maxQuestions) {
      saveInterviewToDB(newScores);
      speakText("Interview completed! Check your feedback below.");
    } else {
      const qMatch = data.result.match(/Next Question:\s*([\s\S]*?)$/);
      if (qMatch) speakText(qMatch[1].trim());
    }

    setLoading(false);
    scrollToBottom();
  };

  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const scoreColor = avgScore >= 7 ? "text-emerald-600" : avgScore >= 5 ? "text-amber-500" : "text-red-500";
  const scoreBg = avgScore >= 7 ? "bg-emerald-50 border-emerald-100" : avgScore >= 5 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100";
  const scoreLabel = avgScore >= 7 ? "Excellent! You're ready! 🌟" : avgScore >= 5 ? "Good! Keep practicing! 👍" : "Keep going! Practice more! 💪";
  const roles = ["Frontend", "Backend", "Full Stack", "DSA", "Data Analyst", "Data Scientist", "DevOps", "System Design"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mock Interview</h1>
          <p className="text-gray-400 text-sm mt-0.5">AI-powered voice interview simulator with real-time scoring</p>
        </div>

        {/* Setup */}
        {!started && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Configure your interview</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {roles.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Focus Topic</label>
                <input placeholder="e.g. React, Arrays" value={focus} onChange={(e) => setFocus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: "🎤", title: "Voice Answers", desc: "Speak or type" },
                { icon: "⚡", title: "AI Scoring", desc: "Scored every answer" },
                { icon: "📊", title: "Feedback", desc: "Improvement tips" }
              ].map(f => (
                <div key={f.title} className="bg-indigo-50 rounded-xl p-3 text-center">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <p className="text-xs font-semibold text-indigo-700">{f.title}</p>
                  <p className="text-xs text-indigo-400 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>

            <button onClick={startInterview} disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-60">
              {loading ? "Starting..." : "Start Interview →"}
            </button>
          </div>
        )}

        {/* Progress */}
        {started && questionCount < maxQuestions && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">Progress</span>
              <span className="text-xs font-bold text-indigo-600">{questionCount}/{maxQuestions}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(questionCount / maxQuestions) * 100}%` }} />
            </div>
            <div className="flex gap-3 mt-2 flex-wrap">
              <span className="text-xs text-gray-400">Role: <span className="font-medium text-gray-600">{role}</span></span>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-400">Level: <span className="font-medium text-gray-600">{level}</span></span>
              {focus && <><span className="text-gray-200">·</span><span className="text-xs text-gray-400">Focus: <span className="font-medium text-gray-600">{focus}</span></span></>}
            </div>
          </div>
        )}

        {/* Chat */}
        {started && (
          <div ref={chatRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 overflow-y-auto"
            style={{ maxHeight: "420px", minHeight: "200px" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">AI</div>
                )}
                <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold ml-2 flex-shrink-0 mt-1">You</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">AI</div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 150, 300].map(d => (
                      <div key={d} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        {started && questionCount < maxQuestions && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendAnswer()}
                disabled={loading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" />
              <VoiceRecorder onTranscribed={(text) => setInput(text)} />
              <button onClick={sendAnswer} disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40">
                Send
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {questionCount >= maxQuestions && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-xl font-bold text-gray-900">Interview Complete!</h2>
              <p className="text-gray-400 text-sm mt-1">Here's how you performed</p>
            </div>

            <div className={`rounded-2xl p-5 text-center mb-5 border ${scoreBg}`}>
              <p className="text-sm font-medium text-gray-500 mb-1">Overall Score</p>
              <p className={`text-5xl font-black ${scoreColor}`}>
                {avgScore.toFixed(1)}<span className="text-2xl text-gray-300">/10</span>
              </p>
              <p className={`text-sm font-semibold mt-2 ${scoreColor}`}>{scoreLabel}</p>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Score Breakdown</p>
            <div className="space-y-2 mb-6">
              {scores.map((score, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">Question {i + 1}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${score >= 7 ? "bg-emerald-500" : score >= 5 ? "bg-amber-400" : "bg-red-400"}`}
                      style={{ width: `${score * 10}%` }} />
                  </div>
                  <span className={`text-xs font-bold w-10 text-right ${score >= 7 ? "text-emerald-600" : score >= 5 ? "text-amber-500" : "text-red-500"}`}>
                    {score}/10
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setMessages([]); setScores([]); setQuestionCount(0);
                setStarted(false); setInput("");
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-200">
              Start New Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MockInterview;