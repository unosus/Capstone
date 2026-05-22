import React, { useState } from 'react';
import axios from 'axios';
import { Send, Sparkles } from 'lucide-react';
import API_BASE from "../utils/api";

interface NaturalInputFormProps {
  onComplete: () => void;
}

export function NaturalInputForm({ onComplete }: NaturalInputFormProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      // 백엔드 호출
      const res = await axios.post(`${API_BASE}/api/estimates/natural-language`, {
        userInput: input
      });
      
      // 1. 전체 추천 결과 리스트 저장
      sessionStorage.setItem('recommendationResult', JSON.stringify(res.data.recommendations));
      
      // 2. AI가 추출한 사용자의 '목표 예산' 저장 (견적 합계가 아님)
      if (res.data.userBudget) {
          sessionStorage.setItem('extractedBudget', res.data.userBudget.toString());
      }
      
      onComplete();
    } catch (err) {
      console.error(err);
      alert("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-blue-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-blue-600" />
        <h3 className="font-bold text-slate-800">AI 전문가에게 견적 요청</h3>
      </div>
      
      <div className="relative">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예) 배틀그라운드 원활하게 돌아가는 150만원 정도의 본체 견적 짜줘."
          className="w-full p-5 pr-16 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all min-h-[120px] resize-none"
        />
        <button 
          onClick={handleSearch}
          disabled={loading || !input.trim()}
          className="absolute right-4 bottom-4 bg-blue-600 p-3 rounded-xl text-white hover:bg-blue-700 disabled:bg-slate-300 transition-colors shadow-lg"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
      
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {["사무용 50만원대", "롤/오버워치용 100만원", "영상편집용 250만원"].map((hint) => (
          <button 
            key={hint}
            onClick={() => setInput(hint)}
            className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-slate-200"
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
}