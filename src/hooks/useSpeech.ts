import { useCallback, useEffect, useRef, useState } from "react";

type SpeechErrorKind = "unsupported" | "denied" | "no-speech" | "generic" | null;

/* eslint-disable @typescript-eslint/no-explicit-any */
function getRecognitionCtor(): any | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<SpeechErrorKind>(null);
  const recognitionRef = useRef<any>(null);
  const finalRef = useRef("");

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      setError("unsupported");
      return;
    }
    setError(null);
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let live = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalRef.current = `${finalRef.current} ${result[0].transcript}`.trim();
        else live += result[0].transcript;
      }
      setTranscript(finalRef.current);
      setInterim(live);
    };
    recognition.onerror = (event: any) => {
      const code = event?.error;
      if (code === "not-allowed" || code === "service-not-allowed") setError("denied");
      else if (code === "no-speech") setError("no-speech");
      else if (code !== "aborted") setError("generic");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("generic");
    }
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  const setManual = useCallback((value: string) => {
    finalRef.current = value;
    setTranscript(value);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { supported, listening, transcript, interim, error, start, stop, reset, setManual };
}

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  } catch {
    /* noop */
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}