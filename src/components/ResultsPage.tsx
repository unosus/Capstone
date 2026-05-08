import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Cpu, Check, Printer, RotateCcw, Info, AlertCircle, ExternalLink } from 'lucide-react';

interface Part {
  category: string;
  name: string;
  price: number;
  brand?: string;
  specSummary?: string;
}

interface Recommendation {
  rankName: string;
  parts: Part[];
  message?: string;
}

interface ResultsPageProps {
  onRestart: () => void;
}

export function ResultsPage({ onRestart }: ResultsPageProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    const data = sessionStorage.getItem('pcBuildData');
    if (!data) {
      onRestart();
      return;
    }

    const { budget: storedBudget, purpose, brands } = JSON.parse(data);
    setBudget(parseInt(storedBudget));

    // 백엔드 통신 수행
    axios.post("http://localhost:8080/api/estimates/recommend", {
      budget: parseInt(storedBudget),
      usage: purpose, // InputForm의 value가 GAMING 등 대문자이므로 그대로 전달
      brands: brands
    })
    .then((res) => {
      // 백엔드 응답 구조에 따라 res.data 혹은 res.data.recommendations 조정
      const fetchedData = res.data.recommendations || res.data;
      setRecommendations(fetchedData);
      setLoading(false);
    })
    .catch((err) => {
      console.error("추천 실패:", err);
      setError("백엔드 서버와 통신할 수 없습니다.");
      setLoading(false);
    });
  }, [onRestart]);

  if (loading) return <div className="p-20 text-center">결과 분석 중...</div>;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={onRestart} className="bg-blue-600 text-white px-6 py-2 rounded-lg">다시 시도</button>
        </div>
      </div>
    );
  }

  const selected = recommendations[selectedIndex];
  if (!selected) return null;

  const totalPrice = selected.parts.reduce((sum, part) => sum + part.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 상단 결과 요약 카드 */}
      <div className="max-w-4xl mx-auto pt-10 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl mb-8">
          <h1 className="text-3xl font-bold mb-4">추천 PC 조합</h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-blue-100 text-sm">설정 예산</p>
              <p className="text-2xl font-bold">{budget.toLocaleString()}원</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-blue-100 text-sm">견적 총액</p>
              <p className="text-2xl font-bold">{totalPrice.toLocaleString()}원</p>
            </div>
          </div>
        </motion.div>

        {/* 부품 리스트 */}
        <div className="space-y-4">
          {selected.parts.map((part, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">{part.category}</span>
                <h3 className="text-lg font-bold text-gray-800">{part.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{part.price.toLocaleString()}원</p>
                <a 
                  href={`https://search.danawa.com/dsearch.php?query=${encodeURIComponent(part.name)}`}
                  target="_blank" rel="noreferrer"
                  className="text-sm text-blue-500 hover:underline flex items-center gap-1 justify-end"
                >
                  최저가 확인 <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div className="grid grid-cols-2 gap-4 mt-10">
          <button onClick={onRestart} className="flex items-center justify-center gap-2 bg-white border border-gray-300 p-4 rounded-xl font-bold text-gray-600">
            <RotateCcw size={20} /> 다른 조합 만들기
          </button>
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-gray-900 text-white p-4 rounded-xl font-bold">
            <Printer size={20} /> 결과 인쇄하기
          </button>
        </div>
      </div>
    </div>
  );
}