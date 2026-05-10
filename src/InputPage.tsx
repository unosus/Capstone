import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputForm } from '../components/InputForm'; // 기존 컴포넌트
import { NaturalInputForm } from '../components/NaturalInputForm'; // 신규 컴포넌트

export function InputPage() {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const navigate = useNavigate();

  const handleComplete = () => {
    // 분석이 완료되면 결과 페이지로 이동
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">나만의 맞춤 PC 견적</h2>
          <p className="text-slate-500">원하는 방식을 선택하여 견적을 시작해보세요.</p>
        </div>

        {/* 모드 전환 탭 */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setMode('manual')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            직접 선택하기
          </button>
          <button
            onClick={() => setMode('ai')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            AI에게 말하기 (신규)
          </button>
        </div>

        {/* 선택된 모드에 따라 컴포넌트 렌더링 */}
        <div className="transition-all duration-500">
          {mode === 'manual' ? (
            <InputForm onComplete={handleComplete} />
          ) : (
            <NaturalInputForm onComplete={handleComplete} />
          )}
        </div>
      </div>
    </div>
  );
}