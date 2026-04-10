import React, { useState } from "react";
import { analyzeAnswer } from "../services/api";
import UploadSection from "./UploadSection";
import VoiceInput from "./VoiceInput";

const InputBox = ({ addHistory }) => {
  const [question, setQuestion] = useState("Why do objects fall?");
  const [answer, setAnswer] = useState("Because heavier objects fall faster");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question || !answer) return;
    setLoading(true);
    try {
      const res = await analyzeAnswer({ question, answer });
      if (res.success) {
        setResult(res.data);
        addHistory({ question, type: res.data.misconception });
      } else {
        alert("Server failed to analyze answer.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the backend server.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl space-y-6 shadow-xl">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Question Context</label>
        <input
          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Student Answer</label>
        <textarea
          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white h-24 focus:outline-none focus:border-purple-500 transition"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : '⚡ Analyze'}
        </button>
        <VoiceInput setAnswer={setAnswer} />
        <UploadSection setAnswer={setAnswer} />
      </div>

      {result && (
        <div className="mt-8 bg-gray-900 p-5 rounded-xl border-l-4 border-purple-500 animate-[fadeIn_0.5s_ease-out]">
          <div className="text-xl font-bold text-white flex items-center gap-2">
            🧠 {result.misconception}
          </div>
          <p className="text-gray-300 mt-3 whitespace-pre-wrap">{result.explanation}</p>
          <div className="mt-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-sm font-bold text-blue-400">🔁 Follow-up Challenge</h4>
            <p className="text-gray-300 mt-1">{result.followUpQuestion}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputBox;
