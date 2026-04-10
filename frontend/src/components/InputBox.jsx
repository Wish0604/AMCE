import React, { useRef, useState } from "react";
import {
  analyzeAnswer,
  startChallengeQuiz,
  submitChallengeQuizAnswer
} from "../services/api";
import { LANGUAGES } from "../utils/languages";
import UploadSection from "./UploadSection";
import VoiceInput from "./VoiceInput";

const InputBox = ({ addHistory, addQuizHistory }) => {
  const [question, setQuestion] = useState("Why do objects fall?");
  const [answer, setAnswer] = useState("Because heavier objects fall faster");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [language, setLanguage] = useState("en-US");

  const [quizMode, setQuizMode] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState("");
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizSelectedOption, setQuizSelectedOption] = useState("");
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizSummary, setQuizSummary] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const answerRef = useRef(null);

  const handleSubmit = async () => {
    if (!question || !answer) {
      alert("Please enter both question and answer");
      return;
    }

    setLoading(true);
    try {
      const res = await analyzeAnswer({ question, answer, language });
      if (res.success) {
        setResult(res.data);
        setQuizMode(false);
        setQuizFeedback(null);
        setQuizCompleted(false);
        setQuizSummary(null);

        addHistory({
          question,
          type: res.data.misconception,
          isCorrect: res.data.isCorrect,
          attempt: attemptCount + 1,
          timestamp: res.data.timestamp
        });

        setAttemptCount((prev) => prev + 1);
      } else {
        alert(res.error || "Server failed to analyze answer.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the backend server.");
    }
    setLoading(false);
  };

  const handleRetry = () => {
    setAnswer("");
    setResult(null);
    setAttemptCount(0);
    setQuizMode(false);
    setQuizSessionId("");
    setQuizQuestion(null);
    setQuizSelectedOption("");
    setQuizFeedback(null);
    setQuizCompleted(false);
    setQuizSummary(null);
  };

  const handleFollowUp = async () => {
    if (!result?.misconception || !question) {
      return;
    }

    setQuizLoading(true);

    const startRes = await startChallengeQuiz({
      seedQuestion: question,
      misconceptionType: result.misconception,
      misconceptionExplanation: result.explanation
    });

    setQuizLoading(false);

    if (!startRes.success) {
      alert(startRes.error || "Failed to start challenge quiz");
      return;
    }

    setQuizMode(true);
    setQuizSessionId(startRes.data.sessionId);
    setQuizQuestion(startRes.data.currentQuestion);
    setQuizSelectedOption("");
    setQuizFeedback(null);
    setQuizCompleted(false);
    setQuizSummary(null);

    setTimeout(() => {
      if (answerRef.current) {
        answerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const handleQuizSubmit = async () => {
    if (!quizSessionId || !quizSelectedOption) {
      alert("Please choose one option before submitting.");
      return;
    }

    setQuizLoading(true);

    const submitRes = await submitChallengeQuizAnswer({
      sessionId: quizSessionId,
      selectedOptionId: quizSelectedOption
    });

    setQuizLoading(false);

    if (!submitRes.success) {
      alert(submitRes.error || "Failed to submit challenge answer");
      return;
    }

    const data = submitRes.data;

    addQuizHistory({
      sessionId: data.sessionId,
      questionNumber: data.questionNumber,
      totalQuestions: data.totalQuestions,
      questionText: quizQuestion?.question || "",
      misconceptionType: data.misconceptionType,
      selectedOptionId: data.selectedOptionId,
      isCorrect: data.isCorrect,
      misconceptionImproved: data.misconceptionImproved,
      completed: data.completed,
      timestamp: new Date().toISOString()
    });

    setQuizFeedback({
      isCorrect: data.isCorrect,
      explanation: data.explanation,
      correctOption: data.correctOption
    });

    if (data.completed) {
      setQuizCompleted(true);
      setQuizSummary(data.summary);
      setQuizQuestion(null);
      setQuizSelectedOption("");
      return;
    }

    setQuizQuestion(data.nextQuestion);
    setQuizSelectedOption("");
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl space-y-6 shadow-xl">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">❓ Question Context</label>
        <input
          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition"
          placeholder="Enter the question or concept..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={quizMode}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">💭 Student Answer</label>
        <textarea
          ref={answerRef}
          className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white h-24 focus:outline-none focus:border-purple-500 transition resize-none"
          placeholder="Type, speak, or upload your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={quizMode}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-400">🌐 Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={quizMode || loading}
            className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition"
          >
            {Object.entries(LANGUAGES).map(([key, { code, name, flag }]) => (
              <option key={code} value={code}>
                {flag} {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleSubmit}
            disabled={loading || !answer.trim() || quizMode}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            {loading ? "⏳ Analyzing..." : "⚡ Analyze"}
          </button>
          <VoiceInput setAnswer={setAnswer} language={language} inputType="answer" />
          <VoiceInput setAnswer={setQuestion} language={language} inputType="question" />
          <UploadSection setAnswer={setAnswer} language={language} />
        </div>
      </div>

      {quizMode && (
        <div className="mt-4 bg-indigo-900/20 border border-indigo-700 rounded-xl p-4 space-y-4">
          <h3 className="text-lg font-bold text-indigo-300">🧩 Challenge Quiz In Progress</h3>

          {quizQuestion && (
            <>
              <div className="text-xs text-indigo-200">
                Question {quizQuestion.questionNumber}/{quizQuestion.totalQuestions}
              </div>
              <p className="text-gray-100 font-medium">{quizQuestion.question}</p>

              <div className="space-y-2">
                {quizQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setQuizSelectedOption(option.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${
                      quizSelectedOption === option.id
                        ? "bg-indigo-700/40 border-indigo-400 text-indigo-100"
                        : "bg-gray-900/60 border-gray-700 text-gray-200 hover:border-indigo-500"
                    }`}
                    disabled={quizLoading}
                  >
                    <span className="font-semibold mr-2">{option.id}.</span>
                    {option.text}
                  </button>
                ))}
              </div>

              <button
                onClick={handleQuizSubmit}
                disabled={!quizSelectedOption || quizLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                {quizLoading ? "Checking..." : "Submit Answer"}
              </button>
            </>
          )}

          {quizFeedback && (
            <div
              className={`p-3 rounded-lg border text-sm ${
                quizFeedback.isCorrect
                  ? "bg-emerald-900/20 border-emerald-700 text-emerald-200"
                  : "bg-rose-900/20 border-rose-700 text-rose-200"
              }`}
            >
              <div className="font-semibold mb-1">
                {quizFeedback.isCorrect ? "✅ Correct" : "❌ Not quite"}
              </div>
              <p>{quizFeedback.explanation}</p>
              {!quizFeedback.isCorrect && quizFeedback.correctOption?.id && (
                <p className="mt-1 text-xs text-rose-200">
                  Correct option: {quizFeedback.correctOption.id}. {quizFeedback.correctOption.text}
                </p>
              )}
            </div>
          )}

          {quizCompleted && quizSummary && (
            <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-3 text-emerald-200 space-y-2">
              <h4 className="font-bold">🎉 Challenge Completed</h4>
              <p className="text-sm">Score: {quizSummary.score}/{quizSummary.totalQuestions}</p>
              <p className="text-sm">Accuracy: {quizSummary.accuracy}%</p>
              <button
                onClick={() => {
                  setQuizMode(false);
                  setQuizSessionId("");
                  setQuizQuestion(null);
                  setQuizSelectedOption("");
                  setQuizFeedback(null);
                  setQuizCompleted(false);
                  setQuizSummary(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1 rounded transition"
              >
                Exit Challenge
              </button>
            </div>
          )}
        </div>
      )}

      {result && (
        <div
          className={`mt-8 p-5 rounded-xl border-l-4 animate-fadeIn transition-all ${
            result.isCorrect ? "bg-green-900/20 border-green-500 " : "bg-gray-900 border-purple-500"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-bold text-white flex items-center gap-2">
              {result.isCorrect ? "✅ Correct Answer!" : `🧠 ${result.misconception}`}
            </div>
            <div className="text-xs text-gray-400">Confidence: {Math.round(result.confidence * 100)}%</div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-bold text-blue-400 mb-2">💡 Explanation</h3>
            <p className="text-gray-300 leading-relaxed">{result.explanation}</p>
          </div>

          <div className="text-xs text-gray-500 mb-4 flex gap-4">
            <span>
              ⚙️ Method: {result.processingMethod === "simple" ? "Pattern Match (Fast)" : "AI Analysis (Accurate)"}
            </span>
            <span>⏱️ {result.processingTimeMs}ms</span>
          </div>

          {!result.isCorrect && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
              <h4 className="text-sm font-bold text-amber-400 mb-2">🎯 Try This Follow-Up Challenge</h4>
              <p className="text-gray-300 mb-3 italic">{result.followUpQuestion}</p>
              <button
                onClick={handleFollowUp}
                disabled={quizLoading}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition"
              >
                {quizLoading ? "Starting Challenge..." : "→ Start 3-Question Challenge"}
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleRetry}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition text-sm"
            >
              🔄 Try Again
            </button>
          </div>

          {attemptCount > 1 && (
            <div className="text-xs text-gray-500 mt-3 text-center">Attempt #{attemptCount}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default InputBox;

