import React from 'react';
import FileExplorer from './components/FileExplorer.jsx';

function App() {
    return (
        <div className="bg-gray-800 min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-green-400 mb-6 font-mono">Laravel + React File Explorer</h1>
                <FileExplorer />
            </div>
        </div>
    );
}

export default App;