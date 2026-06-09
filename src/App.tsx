import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { MainPage } from './components/MainPage';
import { InputForm } from './components/InputForm';
import { NaturalInputForm } from './components/NaturalInputForm'; 
import { OwnedPartInputForm } from './components/OwnedPartInputForm';
import { PartsListPage } from './components/PartsListPage'; 
import { LoadingScreen } from './components/LoadingScreen';
import { ResultsPage } from './components/ResultsPage';
import { GuidePage } from './components/GuidePage';
import { Footer } from './components/Footer';
import { ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'start' | 'main' | 'input' | 'owned-input' | 'db-list' | 'loading' | 'result' | 'guide'>('start');
  const [inputMode, setInputMode] = useState<'manual' | 'ai'>('manual');

  useEffect(() => {
    if (screen === 'start') {
      const timer = setTimeout(() => setScreen('main'), 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const handleComplete = () => {
    setScreen('loading');
    setTimeout(() => setScreen('result'), 2000);
  };

  return (
    // 🚀 푸터가 항상 하단에 고정되도록 세로 정렬 및 최소 높이 스타일 레이아웃 반영
    <div className="app-container flex flex-col min-h-screen justify-between">
      
      {/* 메인 콘텐츠 영역 (상단 공간을 가득 채우도록 flex-1 설정) */}
      <div className="flex-1">
        {screen === 'start' && <SplashScreen />}
        
        {screen === 'main' && (
          <MainPage 
            onStart={() => setScreen('input')} 
            onOwnedStart={() => setScreen('owned-input')} 
            onDbStart={() => setScreen('db-list')} 
            onGuide={() => setScreen('guide')} 
          />
        )}

        {screen === 'guide' && (
          <GuidePage onBack={() => setScreen('main')} />
        )}
        
        {/* 화면 1: 새로운 PC 맞춤 견적 화면 */}
        {screen === 'input' && (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm">
              <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                <button 
                  onClick={() => setScreen('main')} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-95"
                >
                  <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">나만의 맞춤 PC 견적</h1>
                  <p className="text-xs text-slate-500">원하는 방식을 선택하여 최적의 부품 조합을 매칭해보세요.</p>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-10 w-full">
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setInputMode('manual')}
                  className={`px-6 py-2.5 rounded-full font-bold transition-all ${
                    inputMode === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  직접 선택하기
                </button>
                <button
                  onClick={() => setInputMode('ai')}
                  className={`px-6 py-2.5 rounded-full font-bold transition-all ${
                    inputMode === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  AI에게 말하기
                </button>
              </div>

              {inputMode === 'manual' ? (
                <InputForm onComplete={handleComplete} onBack={() => setScreen('main')} />
              ) : (
                <NaturalInputForm onComplete={handleComplete} />
              )}
            </div>
          </div>
        )}

        {/* 화면 2: 신규 기존 부품 활용 업그레이드 견적 화면 */}
        {screen === 'owned-input' && (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm">
              <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                <button 
                  onClick={() => setScreen('main')} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-95"
                >
                  <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">기존 부품 활용 맞춤 견적</h1>
                  <p className="text-xs text-slate-500">이미 보유 중인 하드웨어 자산과 결합할 무결성 스펙을 추천합니다.</p>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12 w-full">
              <OwnedPartInputForm onComplete={handleComplete} />
            </div>
          </div>
        )}

        {/* 화면 3: 신규 하드웨어 데이터베이스 & 벤치마크 인덱스 목록 화면 */}
        {screen === 'db-list' && (
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm">
              <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                <button 
                  onClick={() => setScreen('main')} 
                  className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-95"
                >
                  <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">하드웨어 데이터베이스 & 벤치마크</h1>
                  <p className="text-xs text-slate-500">현재 PickPC 아키텍처 허브에 구축된 정밀 하드웨어 세부 제원 마스터 정보입니다.</p>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10 w-full">
              <PartsListPage />
            </div>
          </div>
        )}
        
        {screen === 'loading' && <LoadingScreen />}
        
        {screen === 'result' && (
          <ResultsPage onRestart={() => {
            sessionStorage.removeItem('pcBuildData');
            sessionStorage.removeItem('recommendationResult');
            sessionStorage.removeItem('extractedBudget');
            setScreen('main');
          }} />
        )}
      </div>

      {/*전역 공통 푸터 배치 (진입 스플래시 및 로딩 연산 스크린 단계에서는 가독성을 위해 차단) */}
      {screen !== 'start' && screen !== 'loading' && <Footer />}
      
    </div>
  );
};

export default App;