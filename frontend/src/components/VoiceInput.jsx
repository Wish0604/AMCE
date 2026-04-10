import React, { useState } from "react";
import { LANGUAGES, getLanguageFlag } from "../utils/languages";

const VoiceInput = ({ setAnswer, language = "en-US", inputType = "answer" }) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [recognitionRef, setRecognitionRef] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState("");

  const getInputLabel = () => {
    return inputType === "question" ? "Question" : "Answer";
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      "not-allowed": "Microphone permission denied. Please enable microphone access in browser settings.",
      "network": "Network error. Check your connection.",
      "no-speech": "No speech detected. Please try again.",
      "audio-capture": "No microphone found. Please check your device.",
      "service-not-allowed": "Voice service not available.",
      "bad-grammar": "Voice recognition grammar error.",
      "aborted": "Voice recognition was cancelled."
    };
    return errorMessages[errorCode] || `Voice error: ${errorCode}`;
  };

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone permission granted");
      return true;
    } catch (err) {
      setError("Microphone access required. Please allow microphone in your browser.");
      console.error("Microphone permission denied:", err);
      return false;
    }
  };

  const startListening = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("😞 Voice not supported in this browser. Use Chrome, Firefox, or Safari.");
      return;
    }

    // Request microphone permission first
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    setError("");
    setInterimTranscript("");
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language; // Use selected language
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      // Update interim display in real-time
      setInterimTranscript(interim);

      // Only update answer when final transcript is done
      if (finalTranscript) {
        setAnswer(finalTranscript.trim());
        setInterimTranscript("");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      const friendlyError = getErrorMessage(event.error);
      setError(friendlyError);
      setListening(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };

    recognition.start();
    setRecognitionRef(recognition);
  };

  const stopListening = () => {
    if (recognitionRef) {
      recognitionRef.stop();
      setListening(false);
      setInterimTranscript("");
    }
  };

  const languageFlag = getLanguageFlag(language);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={listening ? stopListening : startListening}
        className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition ${
          listening
            ? "bg-red-600 hover:bg-red-700 animate-pulse"
            : "bg-purple-600 hover:bg-purple-700"
        }`}
        title={`Click to speak ${getInputLabel().toLowerCase()} (${language})`}
      >
        🎤 {listening ? "Stop Listening..." : `Speak (${getInputLabel()})`}
        <span className="ml-1">{languageFlag}</span>
      </button>
      
      {interimTranscript && (
        <div className="text-xs bg-purple-900/30 border border-purple-700 rounded px-2 py-1 text-purple-200 italic">
          <span className="font-semibold">Listening:</span> {interimTranscript}
        </div>
      )}
      
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
};

export default VoiceInput;

