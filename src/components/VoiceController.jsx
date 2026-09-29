import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';

export default function VoiceController({ 
  onVoiceCommand, 
  isSpeaking, 
  setIsSpeaking, 
  lastResponse,
  onSpeechText,
  onSpeechBoundary 
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(0.9);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const recognitionRef = useRef(null);

  // Initialize Synthesized Audio HUD Effects using Web Audio API
  const playHudSound = (type = 'beep') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'activate') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn('AudioContext not allowed or not supported', e);
    }
  };

  // Setup Voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        const jarvisVoice = voices.find(v => v.name.includes('UK English Male') || v.name.includes('Google UK English Male') || (v.lang.startsWith('en') && v.name.includes('Male')));
        if (jarvisVoice) {
          setSelectedVoice(jarvisVoice);
        } else if (voices.length > 0) {
          setSelectedVoice(voices[0]);
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const text = currentTranscript.trim();
          if (text) {
            playHudSound('activate');
            onVoiceCommand(text);
            setTranscript('');
          }
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech Recognition Error:', err.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }
  }, [isListening, onVoiceCommand]);

  // Handle Speech Output (TTS) & Closed Caption Synchronization
  useEffect(() => {
    if (lastResponse && ttsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const cleanText = lastResponse.replace(/```[\s\S]*?```/g, 'Code block output attached.').replace(/[#*`]/g, '');
      
      if (onSpeechText) {
        onSpeechText(cleanText);
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);

      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utterance.onboundary = (event) => {
        if (onSpeechBoundary && event.charIndex !== undefined) {
          onSpeechBoundary(event.charIndex, event.charLength || 0);
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  }, [lastResponse, ttsEnabled, voiceRate, voicePitch, selectedVoice, setIsSpeaking, onSpeechText, onSpeechBoundary]);


  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      playHudSound('beep');
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        playHudSound('activate');
      } catch (e) {
        console.error('Could not start microphone', e);
      }
    }
  };

  return (
    <div className="hud-card p-6 flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2.5">
          <Radio className={`w-5 h-5 ${isListening ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
          <h3 className="font-hud font-bold text-sm text-slate-100 tracking-wide">
            VOICE CONTROL & AUDIO MATRIX
          </h3>
        </div>
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          className={`p-2 rounded-lg transition ${ttsEnabled ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}
          title="Toggle Speech Output (TTS)"
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Trigger & Waveform */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
        <button
          onClick={toggleListening}
          className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider transition ${
            isListening 
              ? 'bg-amber-500/30 border border-amber-400 text-amber-200 shadow-md scale-105' 
              : 'btn-hud'
          }`}
        >
          {isListening ? (
            <>
              <Mic className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>LISTENING ACTIVE</span>
            </>
          ) : (
            <>
              <MicOff className="w-4 h-4" />
              <span>ENABLE VOICE</span>
            </>
          )}
        </button>

        {/* Live Audio Activity Bars */}
        <div className="flex items-center gap-1">
          {[40, 70, 30, 90, 60, 80, 50, 85].map((h, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListening || isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
              }`}
              style={{ height: (isListening || isSpeaking) ? `${Math.random() * 28 + 6}px` : '6px' }}
            />
          ))}
        </div>
      </div>

      {/* Subtitles & Live Transcript */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs font-mono-hud min-h-[54px] flex items-center">
        {transcript ? (
          <span className="text-amber-300">
            <span className="text-cyan-400 font-bold uppercase tracking-wider mr-2">[MIC INPUT]:</span>
            "{transcript}"
          </span>
        ) : isSpeaking ? (
          <span className="text-cyan-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="font-bold uppercase tracking-wider">[NOVA SPEAKING...]:</span>
            Audio synthesis active
          </span>
        ) : (
          <span className="text-slate-500 italic">
            Say "Nova run system check" or click mic to issue voice directives...
          </span>
        )}
      </div>
    </div>
  );
}
