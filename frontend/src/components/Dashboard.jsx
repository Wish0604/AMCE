import React, { useMemo } from "react";

const Dashboard = ({ history, quizHistory = [] }) => {
  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        total: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
        topMisconceptions: {},
        averageAttempts: 0
      };
    }

    const total = history.length;
    const correct = history.filter((h) => h.isCorrect).length;
    const incorrect = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    const topMisconceptions = {};
    history.forEach((item) => {
      if (item.type && item.type !== "Correct") {
        topMisconceptions[item.type] = (topMisconceptions[item.type] || 0) + 1;
      }
    });

    const attemptGroups = {};
    history.forEach((item) => {
      if (item.question) {
        if (!attemptGroups[item.question]) {
          attemptGroups[item.question] = [];
        }
        attemptGroups[item.question].push(item.attempt || 1);
      }
    });

    const averageAttempts = Object.keys(attemptGroups).length > 0
      ? Math.round(
          Object.values(attemptGroups).reduce(
            (sum, attempts) => sum + (attempts[attempts.length - 1] || 1),
            0
          ) / Object.keys(attemptGroups).length
        )
      : 0;

    return {
      total,
      correct,
      incorrect,
      accuracy,
      topMisconceptions,
      averageAttempts
    };
  }, [history]);

  const quizStats = useMemo(() => {
    if (quizHistory.length === 0) {
      return {
        attempts: 0,
        correct: 0,
        accuracy: 0,
        sessionsStarted: 0,
        sessionsCompleted: 0,
        misconceptionImproved: 0
      };
    }

    const attempts = quizHistory.length;
    const correct = quizHistory.filter((item) => item.isCorrect).length;
    const accuracy = Math.round((correct / attempts) * 100);

    const sessionIds = new Set(quizHistory.map((item) => item.sessionId).filter(Boolean));
    const completedSessionIds = new Set(
      quizHistory.filter((item) => item.completed).map((item) => item.sessionId).filter(Boolean)
    );

    const misconceptionImproved = quizHistory.filter((item) => item.misconceptionImproved).length;

    return {
      attempts,
      correct,
      accuracy,
      sessionsStarted: sessionIds.size,
      sessionsCompleted: completedSessionIds.size,
      misconceptionImproved
    };
  }, [quizHistory]);

  const getMisconceptionColor = (type) => {
    const colors = {
      Conceptual: "bg-red-900/30 text-red-400 border-red-700",
      Procedural: "bg-orange-900/30 text-orange-400 border-orange-700",
      Overgeneralization: "bg-yellow-900/30 text-yellow-400 border-yellow-700",
      Partial: "bg-blue-900/30 text-blue-400 border-blue-700",
      Correct: "bg-green-900/30 text-green-400 border-green-700"
    };
    return colors[type] || "bg-gray-900/30 text-gray-400 border-gray-700";
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl h-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">📊 Progress Dashboard</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400">Total Attempts</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-900/20 p-3 rounded-lg border border-green-700">
          <p className="text-xs text-green-400">Correct</p>
          <p className="text-2xl font-bold text-green-400">{stats.correct}</p>
        </div>
        <div className="bg-red-900/20 p-3 rounded-lg border border-red-700">
          <p className="text-xs text-red-400">Need Help</p>
          <p className="text-2xl font-bold text-red-400">{stats.incorrect}</p>
        </div>
        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-700">
          <p className="text-xs text-blue-400">Accuracy</p>
          <p className="text-2xl font-bold text-blue-400">{stats.accuracy}%</p>
        </div>
      </div>

      {Object.keys(stats.topMisconceptions).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-300 mb-3">🎯 Weak Areas</h3>
          <div className="space-y-2">
            {Object.entries(stats.topMisconceptions)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${getMisconceptionColor(type)}`}>
                    {type}
                  </span>
                  <span className="text-xs text-gray-400">{count}x</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-bold text-purple-300 mb-3">🧩 Challenge Quiz Progress</h3>
        {quizHistory.length === 0 ? (
          <p className="text-gray-500 text-xs">No challenge quiz attempts yet.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>Attempts</span>
              <span>{quizStats.attempts}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>Quiz Accuracy</span>
              <span>{quizStats.accuracy}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>Sessions Started</span>
              <span>{quizStats.sessionsStarted}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>Sessions Completed</span>
              <span>{quizStats.sessionsCompleted}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span>Misconception Improved</span>
              <span>{quizStats.misconceptionImproved}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-300 mb-3">📜 Recent Attempts</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-gray-500 text-xs">No history yet. Start analyzing answers!</p>
          ) : (
            history.slice(0, 6).map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition ${
                  item.isCorrect
                    ? "bg-green-900/10 border-green-700/50"
                    : "bg-gray-900/50 border-gray-700/50"
                }`}
              >
                <p className="text-xs text-gray-400 truncate mb-1">
                  <b>Q:</b> {item.question.substring(0, 35)}...
                </p>
                <div className="flex gap-1 flex-wrap items-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${getMisconceptionColor(item.type)}`}>
                    {item.isCorrect ? "✅ Correct" : item.type}
                  </span>
                  {item.attempt && <span className="text-xs text-gray-500">Attempt #{item.attempt}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-gray-300 mb-3">🧪 Recent Quiz Attempts</h3>
        <div className="space-y-3 max-h-52 overflow-y-auto">
          {quizHistory.length === 0 ? (
            <p className="text-gray-500 text-xs">No quiz attempts yet. Click Try Challenge.</p>
          ) : (
            quizHistory.slice(0, 6).map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  item.isCorrect
                    ? "bg-emerald-900/10 border-emerald-700/50"
                    : "bg-purple-900/10 border-purple-700/50"
                }`}
              >
                <p className="text-xs text-gray-300 mb-1 truncate">
                  Quiz Q{item.questionNumber}/{item.totalQuestions}: {item.questionText}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${item.isCorrect ? "text-emerald-300" : "text-red-300"}`}>
                    {item.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                  </span>
                  <span className="text-xs text-gray-400">{item.misconceptionType}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {stats.total > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            ⏱️ Average {stats.averageAttempts} attempts per question
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

