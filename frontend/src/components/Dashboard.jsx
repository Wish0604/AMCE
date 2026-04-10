import React from "react";

const Dashboard = ({ history }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">📊 Progress Tracker</h2>
      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No history yet.</p>
        ) : (
          history.map((item, index) => (
            <div key={index} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
              <p className="text-sm text-gray-400 mb-1"><b>Q:</b> {item.question}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold px-2 py-1 bg-red-900/30 text-red-400 rounded">
                  {item.type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
