import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { MainPage } from './components/MainPage'; // 새 컴포넌트
import { InputForm } from './components/InputForm';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultsPage } from './components/ResultsPage';
import { GuidePage } from './components/GuidePage'; // 새 컴포넌트

const App: React.FC = () => {
  // 화면 상태: 'start' | 'main' | 'input' | 'loading' | 'result' | 'guide'
  const [screen, setScreen] = useState<'start' | 'main' | 'input' | 'loading' | 'result' | 'guide'>('start');

  useEffect(() => {
    if (screen === 'start') {
      const timer = setTimeout(() => setScreen('main'), 2000); // 스플래시 후 메인으로
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // InputForm에서 완료되었을 때 호출할 함수
  const handleInputComplete = () => {
    setScreen('loading');
    setTimeout(() => {
      setScreen('result');
    }, 2000); // 로딩 2초 보여주기
  };

 return (
    <div className="app-container">
      {screen === 'start' && <SplashScreen />}
      
      {screen === 'main' && (
        <MainPage 
          onStart={() => setScreen('input')} 
          onGuide={() => setScreen('guide')} 
        />
      )}

      {screen === 'guide' && (
        <GuidePage onBack={() => setScreen('main')} />
      )}
      
      {screen === 'input' && (
        <InputForm 
          onComplete={() => {
            setScreen('loading');
            setTimeout(() => setScreen('result'), 2000);
          }} 
          onBack={() => setScreen('main')} // 이 부분을 추가하세요!
        />
      )}
      
      {screen === 'loading' && <LoadingScreen />}
      
      {screen === 'result' && (
        <ResultsPage onRestart={() => setScreen('main')} />
      )}
    </div>
  );
};
export default App;