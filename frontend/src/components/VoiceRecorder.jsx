import { useState, useRef } from "react";

function VoiceRecorder({ onTranscribed }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // stop all mic tracks to release microphone
        stream.getTracks().forEach(t => t.stop());
        await sendAudio(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert("Microphone access denied. Please allow microphone access in your browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const sendAudio = async (blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", blob, "answer.webm");

    try {
      const res = await fetch("http://localhost:5000/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) onTranscribed(data.text);
    } catch (err) {
      console.error("Transcription failed:", err);
      alert("Transcription failed. Please try again.");
    }
    setLoading(false);
  };

  if (loading) return (
    <button disabled
      className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
      Transcribing...
    </button>
  );

  if (recording) return (
    <button onClick={stopRecording}
      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
      <span className="w-2 h-2 bg-white rounded-full animate-ping" />
      Stop
    </button>
  );

  return (
    <button onClick={startRecording}
      className="flex items-center gap-2 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-gray-200 hover:border-indigo-200">
      🎤 Speak
    </button>
  );
}

export default VoiceRecorder;