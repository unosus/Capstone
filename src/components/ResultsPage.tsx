import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Check, Printer, RotateCcw, AlertCircle, ExternalLink, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';

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

interface AiAnalysis {
  pros: string[];
  cons: string[];
}

interface ResultsPageProps {
  onRestart: () => void;
}

export function ResultsPage({ onRestart }: ResultsPageProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    // 1. 자연어 처리 결과 우선 확인
    const naturalResult = sessionStorage.getItem('recommendationResult');
    const naturalBudget = sessionStorage.getItem('extractedBudget');
    
    if (naturalResult) {
      const fetchedData = JSON.parse(naturalResult);
      setRecommendations(fetchedData);
      
      // AI가 추출한 사용자의 원래 목표 예산을 설정
      setBudget(naturalBudget ? parseInt(naturalBudget) : 0);
      setLoading(false);

      if (fetchedData && fetchedData.length > 0) {
        fetchAiAnalysis(fetchedData[0]);
      }
      return;
    }

    // 2. 기존 버튼 선택 모드 처리
    const data = sessionStorage.getItem('pcBuildData');
    if (!data) {
      onRestart();
      return;
    }

    const { budget: storedBudget, purpose, brands } = JSON.parse(data);
    setBudget(parseInt(storedBudget));

    axios.post("http://localhost:8080/api/estimates/recommend", {
      budget: parseInt(storedBudget),
      usage: purpose,
      brands: brands
    })
    .then((res) => {
      const fetchedData = res.data.recommendations || res.data;
      setRecommendations(fetchedData);
      setLoading(false);
      if (fetchedData && fetchedData.length > 0) {
        fetchAiAnalysis(fetchedData[0]);
      }
    })
    .catch(() => {
      setError("데이터를 불러오는데 실패했습니다.");
      setLoading(false);
    });
  }, [onRestart]);

  const fetchAiAnalysis = async (selectedRec: Recommendation) => {
    setAiLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/estimates/analyze", {
        parts: selectedRec.parts
      });
      setAiAnalysis(res.data);
    } catch (err) {
      setAiAnalysis({
        pros: ["성능 밸런스가 좋은 조합입니다."],
        cons: ["AI 분석 리포트를 불러오는 중 오류가 발생했습니다."]
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-600">최적의 조합을 분석 중입니다...</div>;

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
      <div className="max-w-4xl mx-auto pt-10 px-4">
        {/* 상단 요약 카드: budget은 사용자가 입력한 예산, totalPrice는 실제 부품 합계 */}
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

        {/* AI 분석 리포트 섹션 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">AI 전문가 분석 리포트</h2>
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center py-6">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
              <p className="text-slate-500 text-sm italic">전문가가 부품 구성을 살펴보고 있습니다...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
                <h3 className="flex items-center gap-2 text-emerald-700 font-bold mb-4 text-lg">
                  <ThumbsUp size={20}/> 이런 점이 좋아요
                </h3>
                <ul className="space-y-3">
                  {aiAnalysis?.pros.map((p, i) => (
                    <li key={i} className="text-emerald-900 text-sm leading-relaxed flex items-start gap-2">
                      <Check size={16} className="mt-1 shrink-0 text-emerald-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                <h3 className="flex items-center gap-2 text-amber-700 font-bold mb-4 text-lg">
                  <ThumbsDown size={20}/> 이런 점은 고민해보세요
                </h3>
                <ul className="space-y-3">
                  {aiAnalysis?.cons.map((c, i) => (
                    <li key={i} className="text-amber-900 text-sm leading-relaxed flex items-start gap-2">
                      <AlertCircle size={16} className="mt-1 shrink-0 text-amber-500" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>      
          )}
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
          <button onClick={onRestart} className="flex items-center justify-center gap-2 bg-white border border-gray-300 p-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <RotateCcw size={20} /> 다른 조합 만들기
          </button>
          <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">
            <Printer size={20} /> 결과 인쇄하기
          </button>
        </div>
      </div>
    </div>
  );
}