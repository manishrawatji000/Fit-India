// frontend/src/components/VoiceAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// VoiceAssistant — powered by Gemini 2.5 Flash via backend proxy
// Props:
//   workoutContext: { exercise: string, reps: number, formScore: number } | null
//   When provided, Gemini receives live workout data with every query
// ─────────────────────────────────────────────────────────────────────────────
const VoiceAssistant = ({ workoutContext = null }) => {
  const [isListening, setIsListening]   = useState(false);
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript]     = useState('');
  const [textInput, setTextInput]       = useState('');
  const [error, setError]               = useState('');
  const [messages, setMessages]         = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your FitAI Coach powered by Gemini 2.5 Flash ⚡ Ask me anything about your workout, form, nutrition, or fitness goals — I give real answers!"
    }
  ]);

  const recognitionRef        = useRef(null);
  const synthRef              = useRef(window.speechSynthesis);
  const messagesEndRef        = useRef(null);
  const conversationHistory   = useRef([]); // stores full chat for multi-turn memory

  // ── Setup speech recognition ──────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous      = false;
      recognitionRef.current.interimResults  = false;
      recognitionRef.current.lang            = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleQuery(text);
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow mic access in browser settings.');
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else {
          setError('Microphone error: ' + event.error);
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }

    // Load voices (some browsers need a delay)
    if (synthRef.current) {
      synthRef.current.getVoices();
    }

    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, []);

  // ── Auto scroll to latest message ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  // ── Toggle mic ────────────────────────────────────────────────────────────
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Voice recognition not supported. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError('');
      setTranscript('');
      synthRef.current?.cancel(); // stop AI speaking if user interrupts
      setIsSpeaking(false);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setError('Could not start microphone. Refresh and try again.');
      }
    }
  };

  // ── Text-to-speech ────────────────────────────────────────────────────────
  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    // Clean markdown formatting for cleaner speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')   // remove bold
      .replace(/\*(.*?)\*/g, '$1')       // remove italic
      .replace(/#{1,6}\s/g, '')          // remove headings
      .replace(/\n+/g, ' ')             // collapse newlines
      .trim();

    const utterance       = new SpeechSynthesisUtterance(cleanText);
    utterance.rate        = 1.0;
    utterance.pitch       = 1.0;
    utterance.volume      = 1.0;
    utterance.lang        = 'en-US';

    // Try to pick a natural-sounding voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang === 'en-US' &&
        (v.name.includes('Google') ||
         v.name.includes('Natural') ||
         v.name.includes('Samantha') ||
         v.name.includes('Alex'))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  // ── Stop speaking ─────────────────────────────────────────────────────────
  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  // ── Main query handler — calls Gemini via backend ─────────────────────────
  const handleQuery = async (query) => {
    if (!query || !query.trim()) return;

    setError('');
    setIsProcessing(true);
    setTranscript('');

    // Add user message to UI immediately
    setMessages((prev) => [...prev, { role: 'user', text: query }]);

    // Build context-aware message if workout session is active
    // Gemini will know exactly what exercise, how many reps, and form score
    let enrichedMessage = query;
    if (workoutContext) {
      enrichedMessage =
        `[Live Workout Context - ${workoutContext.exercise}: ` +
        `${workoutContext.reps} reps completed, ` +
        `form score ${workoutContext.formScore}%] ` +
        `User question: ${query}`;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: enrichedMessage,
          // Send full conversation history so Gemini remembers context
          history: conversationHistory.current,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server error ${response.status}`);
      }

      const data       = await response.json();
      const replyText  = data.reply;

      if (!replyText) throw new Error('Empty response from AI');

      // Update conversation history for next turn
      // Store original query (not enriched) so history stays readable
      conversationHistory.current = [
        ...conversationHistory.current,
        { role: 'user',      text: query     },
        { role: 'assistant', text: replyText },
      ];

      // Keep last 20 messages (10 exchanges) to stay within token limits
      if (conversationHistory.current.length > 20) {
        conversationHistory.current = conversationHistory.current.slice(-20);
      }

      // Show AI response in chat
      setMessages((prev) => [...prev, { role: 'assistant', text: replyText }]);

      // Speak the response
      speak(replyText);

    } catch (err) {
      console.error('Chat error:', err.message);

      let userFriendlyError = '';
      if (err.message.includes('fetch') || err.message.includes('network')) {
        userFriendlyError = 'Cannot connect to server. Make sure your backend is running on port 5000.';
      } else if (err.message.includes('API key') || err.message.includes('401')) {
        userFriendlyError = 'Invalid API key. Check GEMINI_API_KEY in your backend .env file.';
      } else if (err.message.includes('quota') || err.message.includes('429')) {
        userFriendlyError = 'API quota exceeded. Wait a moment and try again.';
      } else {
        userFriendlyError = `Error: ${err.message}`;
      }

      setError(userFriendlyError);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '⚠️ ' + userFriendlyError }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Text input submit ─────────────────────────────────────────────────────
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim() && !isProcessing && !isListening) {
      handleQuery(textInput.trim());
      setTextInput('');
    }
  };

  // ── Clear chat ────────────────────────────────────────────────────────────
  const clearChat = () => {
    conversationHistory.current = [];
    stopSpeaking();
    setMessages([{
      role: 'assistant',
      text: "Chat cleared! Fresh start 💪 Ask me anything about your fitness journey."
    }]);
    setError('');
  };

  // ── Status label ──────────────────────────────────────────────────────────
  const statusLabel = isListening   ? '🎤 Listening...'
                    : isProcessing  ? '🧠 Gemini is thinking...'
                    : isSpeaking    ? '🔊 Speaking...'
                    : workoutContext ? `🏋️ ${workoutContext.exercise} · ${workoutContext.reps} reps · ${workoutContext.formScore}% form`
                    : 'Ask me anything about fitness';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(66,133,244,0.08), rgba(15,23,42,0.97))',
      borderRadius: 24,
      padding: 24,
      border: '1px solid rgba(66,133,244,0.25)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4285f4, #34a853)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          boxShadow: '0 6px 20px rgba(66,133,244,0.45)',
          flexShrink: 0,
        }}>
          🤖
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>
              FitAI Coach
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: '2px 8px', borderRadius: 6,
              background: 'rgba(66,133,244,0.15)',
              border: '1px solid rgba(66,133,244,0.35)',
              color: '#4285f4',
              letterSpacing: '0.04em',
            }}>
              GEMINI 2.5 FLASH
            </span>
          </div>
          <p style={{
            margin: '3px 0 0', fontSize: 12, color: '#64748b',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {statusLabel}
          </p>
        </div>

        <button
          onClick={clearChat}
          title="Clear chat history"
          style={{
            padding: '5px 10px', borderRadius: 8,
            border: '1px solid rgba(148,163,184,0.2)',
            background: 'transparent', color: '#64748b',
            fontSize: 11, cursor: 'pointer', flexShrink: 0,
          }}
        >
          Clear
        </button>
      </div>

      {/* ── Workout Context Badge ── */}
      {workoutContext && (
        <div style={{
          marginBottom: 14,
          padding: '8px 12px',
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 10,
          display: 'flex', gap: 16, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, color: '#86efac', fontWeight: 600 }}>
            🏋️ {workoutContext.exercise}
          </span>
          <span style={{ fontSize: 12, color: '#86efac', fontWeight: 600 }}>
            🔄 {workoutContext.reps} reps
          </span>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: workoutContext.formScore > 80 ? '#86efac'
                 : workoutContext.formScore > 50 ? '#fde68a'
                 : '#fca5a5',
          }}>
            💪 {workoutContext.formScore}% form
          </span>
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{
        maxHeight: 320, overflowY: 'auto',
        marginBottom: 14, padding: 12,
        background: 'rgba(2,6,23,0.5)',
        borderRadius: 14,
        border: '1px solid rgba(148,163,184,0.08)',
        scrollbarWidth: 'thin',
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: '#475569', marginBottom: 4,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {msg.role === 'user' ? 'You' : '🤖 FitAI Coach'}
            </div>
            <div style={{
              maxWidth: '88%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user'
                ? '14px 14px 4px 14px'
                : '14px 14px 14px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(66,133,244,0.25), rgba(52,168,83,0.15))'
                : 'rgba(30,41,59,0.9)',
              border: msg.role === 'user'
                ? '1px solid rgba(66,133,244,0.3)'
                : '1px solid rgba(148,163,184,0.1)',
              fontSize: 13,
              lineHeight: 1.7,
              color: '#e2e8f0',
              wordBreak: 'break-word',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isProcessing && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 14,
            background: 'rgba(66,133,244,0.08)',
            border: '1px solid rgba(66,133,244,0.2)',
          }}>
            <div style={{
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#4285f4',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Gemini 2.5 Flash is thinking...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Transcript Preview ── */}
      {transcript && (
        <div style={{
          marginBottom: 10, padding: '9px 13px',
          background: 'rgba(66,133,244,0.1)',
          borderRadius: 10,
          border: '1px solid rgba(66,133,244,0.25)',
          fontSize: 12, color: '#93c5fd',
        }}>
          🎤 Heard: "<em>{transcript}</em>"
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          marginBottom: 10, padding: '9px 13px',
          background: 'rgba(239,68,68,0.1)', borderRadius: 10,
          border: '1px solid rgba(239,68,68,0.25)',
          fontSize: 12, color: '#fca5a5',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Text Input ── */}
      <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type your question or use voice..."
          disabled={isProcessing || isListening}
          style={{
            flex: 1, padding: '11px 14px', borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.2)',
            background: 'rgba(15,23,42,0.7)', color: '#f1f5f9',
            fontSize: 13, outline: 'none',
            opacity: (isProcessing || isListening) ? 0.6 : 1,
          }}
        />
        <button
          type="submit"
          disabled={isProcessing || isListening || !textInput.trim()}
          style={{
            padding: '11px 16px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #4285f4, #34a853)',
            color: 'white', fontWeight: 700, fontSize: 13,
            cursor: (!textInput.trim() || isProcessing || isListening) ? 'not-allowed' : 'pointer',
            opacity: (!textInput.trim() || isProcessing || isListening) ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          Send
        </button>
      </form>

      {/* ── Voice Button + Stop Button ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          style={{
            flex: 1, padding: '13px 18px', borderRadius: 14, border: 'none',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #4285f4, #34a853)',
            color: 'white', fontSize: 14, fontWeight: 700,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.6 : 1,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            boxShadow: isListening
              ? '0 6px 20px rgba(239,68,68,0.4)'
              : '0 6px 20px rgba(66,133,244,0.4)',
            transition: 'all 0.2s',
          }}
        >
          {isListening ? '⏹ Stop Listening' : '🎤 Ask with Voice'}
        </button>

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            style={{
              padding: '13px 14px', borderRadius: 14, border: 'none',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontWeight: 700, fontSize: 13,
              cursor: 'pointer',
            }}
            title="Stop speaking"
          >
            🔇
          </button>
        )}
      </div>

      {/* ── Hint text ── */}
      <p style={{
        marginTop: 10, fontSize: 11,
        color: '#374151', textAlign: 'center', lineHeight: 1.5,
      }}>
        Powered by Gemini 2.5 Flash · Full conversation memory · Workout-aware coaching
      </p>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;