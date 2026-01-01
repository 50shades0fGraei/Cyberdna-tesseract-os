import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    console.log('CodemapOS initialized');
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>CodemapOS</h1>
        <p>Function-driven Operating System Layer</p>
      </header>

      <div className="app-container">
        <nav className="sidebar">
          <ul className="nav-list">
            <li>
              <button
                onClick={() => setActiveTab('home')}
                className={activeTab === 'home' ? 'active' : ''}
              >
                Home
              </button>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          {activeTab === 'home' && (
            <div>
              <h2>Welcome to CodemapOS</h2>
              <p>Function-driven Operating System Layer - Ready to manage functions and resources.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
