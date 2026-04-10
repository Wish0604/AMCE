import React, { useState } from "react";

const VoiceInput = ({ setAnswer }) => {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
      alert("Voice not supported in this browser.");
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setAnswer(text);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  return (
    <button 
      onClick={startListening}
      className={`px-4 py-2 rounded-lg text-white transition ${listening ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
    >
      🎤 {listening ? 'Listening...' : 'Speak'}
    </button>
  );
};

export default VoiceInput;
