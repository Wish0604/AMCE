import React, { useState, useEffect } from 'react';
import InputBox from './components/InputBox';
import Dashboard from './components/Dashboard';

const STORAGE_KEY = 'amce_analysis_history';
const QUIZ_STORAGE_KEY = 'amce_quiz_history';
const UI_LANGUAGE_KEY = 'amce_ui_language';

function App() {
  const [history, setHistory] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [uiLanguage, setUiLanguage] = useState('en-US');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load history and UI language from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      const savedQuizHistory = localStorage.getItem(QUIZ_STORAGE_KEY);
      const savedUiLanguage = localStorage.getItem(UI_LANGUAGE_KEY);

      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }

      if (savedQuizHistory) {
        const parsedQuiz = JSON.parse(savedQuizHistory);
        setQuizHistory(Array.isArray(parsedQuiz) ? parsedQuiz : []);
      }

      if (savedUiLanguage) {
        setUiLanguage(savedUiLanguage);
      }
    } catch (err) {
      console.error("Failed to load from storage:", err);
    }
    setIsInitialized(true);
  }, []);

  // Save histories and UI language to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizHistory));
        localStorage.setItem(UI_LANGUAGE_KEY, uiLanguage);
      } catch (err) {
        console.error("Failed to save to storage:", err);
      }
    }
  }, [history, quizHistory, uiLanguage, isInitialized]);

  const addHistory = (item) => {
    setHistory((prev) => [item, ...prev]);
  };

  const addQuizHistory = (item) => {
    setQuizHistory((prev) => [item, ...prev]);
  };

  const clearHistory = () => {
    if (window.confirm("Clear all analysis and quiz history? This cannot be undone.")) {
      setHistory([]);
      setQuizHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(QUIZ_STORAGE_KEY);
    }
  };

  const hasAnyHistory = history.length > 0 || quizHistory.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
              🧠 AMCE Analyzer
            </h1>
            <p className="text-gray-400 text-lg">AI-Powered Misconception Detection System</p>
            <p className="text-gray-500 text-sm mt-2">Understand your mistakes, improve your learning</p>
          </header>

          {/* Analysis Component */}
          <InputBox addHistory={addHistory} addQuizHistory={addQuizHistory} uiLanguage={uiLanguage} setUiLanguage={setUiLanguage} />
        </div>

        {/* Sidebar Dashboard */}
        <div className="md:col-span-1">
          <div className="relative">
            <Dashboard history={history} quizHistory={quizHistory} uiLanguage={uiLanguage} />
            {hasAnyHistory && (
              <button
                onClick={clearHistory}
                className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-2 rounded-lg transition"
              >
                🗑️ Clear History
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
        <p>© 2026 AMCE Analyzer. Built for educators and learners worldwide.</p>
      </footer>
    </div>
  );
}

export default App;
