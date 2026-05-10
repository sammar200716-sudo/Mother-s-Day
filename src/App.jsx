import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import Username, { USERNAME_STORAGE } from './pages/Username';
import Questions from './pages/Questions';
import Result from './pages/Result';
import Ranking from './pages/Ranking';
import { Sparkles } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

function readStoredUsername() {
  try {
    return sessionStorage.getItem(USERNAME_STORAGE) || '';
  } catch {
    return '';
  }
}

function BackgroundParticles() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Sparkles count={150} scale={10} size={4} speed={0.4} color="#ffffff" opacity={0.5} />
      </Canvas>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState(
    () => (readStoredUsername() ? 'home' : 'username')
  );
  const [userName, setUserName] = useState(readStoredUsername);
  const [result, setResult] = useState(null);

  return (
    <div className="relative min-h-screen font-body text-gray-800 overflow-hidden">
      <div className="noise-overlay"></div>
      <BackgroundParticles />
      <Analytics />
      
      <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
        {currentPage === 'username' && (
          <Username
            initialValue={userName}
            onContinue={(name) => {
              setUserName(name);
              setCurrentPage('home');
            }}
          />
        )}
        {currentPage === 'home' && (
          <Home
            displayName={userName}
            onNext={() => setCurrentPage('questions')}
            onChangeName={() => {
              try {
                sessionStorage.removeItem(USERNAME_STORAGE);
              } catch {
                /* ignore */
              }
              setUserName('');
              setCurrentPage('username');
            }}
          />
        )}
        {currentPage === 'questions' && (
          <Questions 
            onNext={(_selectedKeywords, matchedResult) => {
              setResult(matchedResult);
              setCurrentPage('result');
            }} 
          />
        )}
        {currentPage === 'result' && (
          <Result 
            result={result} 
            userName={userName}
            onViewRankings={() => setCurrentPage('ranking')} 
            onRestart={() => {
              setResult(null);
              setCurrentPage('home');
            }}
          />
        )}
        {currentPage === 'ranking' && (
          <Ranking
            onBack={() =>
              result ? setCurrentPage('result') : setCurrentPage('home')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
