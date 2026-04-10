import React, { useState } from 'react';
import InputBox from './components/InputBox';
import Dashboard from './components/Dashboard';

function App() {
  const [history, setHistory] = useState([]);

  const addHistory = (item) => {
    setHistory([item, ...history]);
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            AMCE Analyzer
          </h1>
          <p className="text-gray-400 mt-2">AI-Powered Misconception Detection System</p>
        </header>
        <InputBox addHistory={addHistory} />
      </div>
      <div className="md:col-span-1">
        <Dashboard history={history} />
      </div>
    </div>
  );
}

export default App;
