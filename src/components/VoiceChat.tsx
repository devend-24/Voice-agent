"use client";

import { useState, useEffect } from "react";

type VoiceChatProps = {
  onSendMessage: (text: string) => void;
};

export default function VoiceChat({ onSendMessage }: VoiceChatProps) {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition");
      return;
    }

    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onSendMessage(transcript); // send transcript to chatbot
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    rec.onend = () => setListening(false);

    setRecognition(rec);
  }, [onSendMessage]);

  const startListening = () => {
    if (recognition && !listening) {
      recognition.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    recognition?.stop();
    setListening(false);
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={listening ? stopListening : startListening}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {listening ? "Stop 🎙️" : "Speak 🎤"}
      </button>

      <button
        onClick={() => speak("Hello! This is a test response.")}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Test TTS 🗣️
      </button>
    </div>
  );
}
