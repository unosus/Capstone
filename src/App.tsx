import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { MainPage } from './components/MainPage';
import { InputForm } from './components/InputForm';
import { NaturalInputForm } from './components/NaturalInputForm'; // 추가됨
import { LoadingScreen } from './components/LoadingScreen';
import { ResultsPage } from './components/ResultsPage';
import { GuidePage } from './components/GuidePage';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'start' | 'main' | 'input' | 'loading' | 'result' | 'guide'>('start');
  // 입력 방식을 결정하는 상태 추가
  const [inputMode, setInputMode] = useState<'manual' | 'ai'>('manual');

  useEffect(() => {
    if (screen === 'start') {
      const timer = setTimeout(() => setScreen('main'), 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // 견적 생성 완료 시 공통 처리 함수
  const handleComplete = () => {
    setScreen('loading');
    setTimeout(() => setScreen('result'), 2000);
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
        <div className="min-h-screen bg-slate-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">나만의 맞춤 PC 견적</h2>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => setInputMode('manual')}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    inputMode === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600'
                  }`}
                >
                  직접 선택하기
                </button>
                <button
                  onClick={() => setInputMode('ai')}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    inputMode === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600'
                  }`}
                >
                  AI에게 말하기
                </button>
              </div>
            </div>

            {inputMode === 'manual' ? (
              <InputForm 
                onComplete={handleComplete} 
                onBack={() => setScreen('main')} 
              />
            ) : (
              <NaturalInputForm 
                onComplete={handleComplete} 
              />
            )}
            
            {/* 하단 돌아가기 버튼 (AI 모드일 때도 메인으로 갈 수 있게 배치) */}
            <div className="text-center mt-8">
                <button 
                  onClick={() => setScreen('main')}
                  className="text-slate-400 hover:text-slate-600 text-sm underline"
                >
                    메인 화면으로 돌아가기
                </button>
            </div>
          </div>
        </div>
      )}
      
      {screen === 'loading' && <LoadingScreen />}
      
      {screen === 'result' && (
        <ResultsPage onRestart={() => {
          sessionStorage.removeItem('recommendationResult');
          sessionStorage.removeItem('extractedBudget');
          setScreen('input');
        }} />
      )}
    </div>
  );
};

export default App;