import React, { useState, useEffect } from 'react';
import TodoListApp from './TodoListApp';
import './app.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <>
      <div className="theme-toggle" onClick={() => setDarkMode(prev => !prev)} title="Toggle Dark/Light mode" role="button" tabIndex={0} onKeyDown={(e) => { if(e.key==='Enter') setDarkMode(prev => !prev); }}>
        {darkMode ? '🌙' : '☀️'}
      </div>
      <TodoListApp />
    </>
  );
}

export default App;
