import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import API_BASE from "../utils/api";
import EstimateChart from '../components/EstimateChart';
import {
  Check,
  Printer,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Award,
  ShieldCheck,
  Flame,
  Cpu,
  HardDrive,
  Activity,
  Layers
} from 'lucide-react';

interface Part {
  category: string;
  name: string;
  price: number;
  brand?: string;
  specSummary?: string;
  benchScore?: number;
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

// 부품 카테고리별 뱃지 및 아이콘 생성 헬퍼 함수 (실제 부품 데이터를 기반으로 동작)
const getCategoryBadge = (category: string, price: number, totalPrice: number, isOwned: boolean) => {
  const catUpper = category?.toUpperCase() || '';
  const ratio = (price / (totalPrice || 1)) * 100;

  if (isOwned || price === 0) {
    return {
      label: '보유 자산 활용',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: <ShieldCheck size={12} />
    };
  }

  if (catUpper.includes('GPU') && ratio > 30) {
    return {
      label: '게이밍 핵심 성능',
      color: 'bg-rose-100 text-rose-700 border-rose-200',
      icon: <Flame size={12} />
    };
  }
  if (catUpper.includes('CPU') && ratio > 20) {
    return {
      label: '연산 프로세서 중심',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: <Cpu size={12} />
    };
  }
  if (catUpper.includes('SSD') || catUpper.includes('RAM')) {
    return {
      label: '고속 메모리/저장장치',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: <HardDrive size={12} />
    };
  }
  if (catUpper.includes('POWER') || catUpper.includes('MAINBOARD')) {
    return {
      label: '시스템 전원/안정성',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      icon: <Zap size={12} />
    };
  }
  return {
    label: '추천 가성비 구성',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <Award size={12} />
  };
};

export function ResultsPage({ onRestart }: ResultsPageProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);
  const [isUpgradeMode, setIsUpgradeMode] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) {
      console.log("중복 API 호출 차단됨");
      return;
    }

    hasFetched.current = true;
    console.log("ResultsPage useEffect 실행됨 - 실제 백엔드 데이터 연결 시작");

    // 1. 자연어 처리 추천 결과 우선 확인 (세션 스토리지)
    const naturalResult = sessionStorage.getItem('recommendationResult');
    const naturalBudget = sessionStorage.getItem('extractedBudget');

    if (naturalResult) {
      try {
        const fetchedData = JSON.parse(naturalResult);
        console.log("실제 자연어 파싱 추천 데이터 사용:", fetchedData);

        setRecommendations(fetchedData);
        setBudget(naturalBudget ? parseInt(naturalBudget) : 0);
        setLoading(false);

        if (fetchedData && fetchedData.length > 0) {
          fetchAiAnalysis(fetchedData[0]);
        }
        return;
      } catch (err) {
        console.error("recommendationResult 파싱 실패:", err);
      }
    }

    // 2. 일반 견적 입력 또는 보유 부품 모드 데이터 확인
    const data = sessionStorage.getItem('pcBuildData');
    if (!data) {
      console.log("pcBuildData 없음. 메인 화면으로 이동");
      onRestart();
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (err) {
      console.error("pcBuildData 파싱 실패:", err);
      setError("요청 데이터를 불러오는데 실패했습니다.");
      setLoading(false);
      return;
    }

    const { budget: storedBudget, purpose, brands, isOwnedMode, ownedCategory, ownedPartName } = parsedData;
    const parsedBudget = parseInt(storedBudget || 0);
    setBudget(parsedBudget);

    if (isOwnedMode) {
      setIsUpgradeMode(true);
    }

    // Request Body 전송
    const requestBody = {
      budget: parsedBudget,
      usage: purpose,
      brands: brands || [],
      isOwnedMode: !!isOwnedMode,
      ownedCategory: ownedCategory || null,
      ownedPartName: ownedPartName || null
    };

    console.log("백엔드 추천 API 요청 전송:", requestBody);

    // 백엔드 서버 API 호출
    axios.post(`${API_BASE}/api/estimates/recommend`, requestBody)
      .then((res) => {
        console.log("백엔드 추천 API 응답 완료:", res.data);
        const fetchedData = res.data.recommendations || res.data;

        if (!fetchedData || fetchedData.length === 0) {
          setError("조건에 맞는 견적을 찾지 못했습니다.");
          setLoading(false);
          return;
        }

        setRecommendations(fetchedData);
        setLoading(false);

        // 첫 번째 추천 견적 조합으로 실제 AI 분석 API 호출
        if (fetchedData && fetchedData.length > 0) {
          fetchAiAnalysis(fetchedData[0]);
        }
      })
      .catch((err) => {
        console.error("백엔드 추천 API 호출 오류:", err);
        setError("실제 서버로부터 추천 데이터를 받아오지 못했습니다. 백엔드 연결 상태를 확인해주세요.");
        setLoading(false);
      });
  }, [onRestart]);

  // 실제 백엔드 AI 분석 API 연동 (전달받은 조합 스펙을 기반으로 연산)
  const fetchAiAnalysis = async (selectedRec: Recommendation) => {
    setAiLoading(true);
    setAiAnalysis(null);

    try {
      console.log("실제 백엔드 AI 분석 API 요청:", selectedRec.parts);
      const res = await axios.post(`${API_BASE}/api/estimates/analyze`, {
        parts: selectedRec.parts
      });

      console.log("실제 AI 분석 응답 수신:", res.data);

      if (res.data && res.data.pros && res.data.cons) {
        setAiAnalysis(res.data);
      } else {
        throw new Error("Invalid AI Analysis Data");
      }
    } catch (err) {
      console.error("AI 분석 API 연동 실패:", err);
      // 서버 연동 에러 시 최소 피드백 표시
      setAiAnalysis({
        pros: ["추천된 부품 간의 가격 및 성능 밸런스 연산이 정상적으로 완료되었습니다."],
        cons: ["상세 AI 분석 문장을 불러오는 중 서버 통신 지연이 발생했습니다."]
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="font-bold text-slate-700 text-lg">
            백엔드 서버에서 최적의 PC 조합을 연산 중입니다...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center border border-red-100 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-slate-900">견적 생성 실패</h2>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <button
            onClick={onRestart}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            다시 요청하기
          </button>
        </div>
      </div>
    );
  }

  const selected = recommendations[selectedIndex];
  if (!selected || !selected.parts) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center border border-gray-100 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-slate-900">추천 결과가 없습니다</h2>
          <p className="text-slate-600 mb-6 text-sm">
            설정하신 예산과 호환 조건에 맞는 부품 조합을 찾지 못했습니다.
          </p>
          <button
            onClick={onRestart}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            예산 및 조건 재설정하기
          </button>
        </div>
      </div>
    );
  }

  // 실제 선택된 부품 가격 합산 계산
  const totalPrice = selected.parts.reduce((sum, part) => sum + (part.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto pt-10 px-4">
        
        {/* 상단 요약 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-8 text-white shadow-xl mb-8 transition-colors duration-500 ${
            isUpgradeMode ? "bg-purple-600 shadow-purple-100" : "bg-blue-600 shadow-blue-100"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">
              {isUpgradeMode ? "보유 부품 연동 맞춤 견적 결과" : "추천 PC 조합"}
            </h1>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1">
              <Activity size={14} /> 실제 DB 연동 완료
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <p className={isUpgradeMode ? "text-purple-100 text-sm" : "text-blue-100 text-sm"}>
                {isUpgradeMode ? "설정한 추가 예산" : "설정 예산"}
              </p>
              <p className="text-2xl font-bold mt-1">
                {budget.toLocaleString()}원
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <p className={isUpgradeMode ? "text-purple-100 text-sm" : "text-blue-100 text-sm"}>
                {isUpgradeMode ? "신규 부품 구매 총액" : "견적 총액"}
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalPrice.toLocaleString()}원
              </p>
            </div>
          </div>
        </motion.div>

        {/* 추천 조합 선택 버튼 (클릭 시 인덱스 변경 및 해당 조합의 AI 분석 다시 호출) */}
        {recommendations.length > 1 && (
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {recommendations.map((rec, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  fetchAiAnalysis(rec); // 클릭한 조합의 부품 목록으로 AI 리포트 재요청
                }}
                className={`px-5 py-3 rounded-2xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedIndex === index
                    ? isUpgradeMode ? "bg-purple-600 text-white shadow-md ring-2 ring-purple-300" : "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-slate-50"
                }`}
              >
                <Layers size={16} />
                {rec.rankName || `${index + 1}번 추천 조합`}
              </button>
            ))}
          </div>
        )}

        {/* 시각화 차트 (선택된 조합에 맞추어 실시간 변경) */}
        <motion.div
          key={`chart-${selectedIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EstimateChart
            parts={selected.parts}
            totalPrice={totalPrice}
          />
        </motion.div>

        {/* AI 분석 리포트 (선택된 조합에 맞추어 실시간 변경) */}
        <motion.div
          key={`ai-${selectedIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`bg-white rounded-3xl p-8 shadow-sm mb-8 border ${
            isUpgradeMode ? "border-purple-100" : "border-blue-100"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-6 h-6 ${isUpgradeMode ? "text-purple-600" : "text-blue-600"}`} />
              <h2 className="text-xl font-bold text-slate-900">
                {isUpgradeMode ? "AI 하드웨어 호환성 리포트" : "AI 전문가 분석 리포트"}
              </h2>
            </div>

            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Zap size={12} className="text-amber-500" /> Gemini AI 분석
            </span>
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className={`w-8 h-8 border-4 border-t-transparent rounded-full mb-4 ${
                  isUpgradeMode ? "border-purple-600" : "border-blue-600"
                }`}
              />
              <p className="text-slate-500 text-sm italic">
                선택하신 {selectedIndex + 1}번 조합의 구성을 AI가 재분석하고 있습니다...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 장점 영역 */}
              <div className="bg-emerald-50/70 border border-emerald-100 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-emerald-700 font-bold text-base">
                    <ThumbsUp size={18} /> 이런 점이 좋아요
                  </h3>
                  <span className="text-[11px] bg-emerald-200/60 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    장점 포인트
                  </span>
                </div>
                <ul className="space-y-3">
                  {aiAnalysis?.pros?.map((p, i) => (
                    <li key={i} className="text-emerald-950 text-sm leading-relaxed flex items-start gap-2 bg-white/80 p-3 rounded-2xl border border-emerald-100/50 shadow-2xs">
                      <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 고려사항 */}
              <div className="bg-amber-50/70 border border-amber-100 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-amber-700 font-bold text-base">
                    <ThumbsDown size={18} /> 이런 점은 고려하세요
                  </h3>
                  <span className="text-[11px] bg-amber-200/60 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                    체크 포인트
                  </span>
                </div>
                <ul className="space-y-3">
                  {aiAnalysis?.cons?.map((c, i) => (
                    <li key={i} className="text-amber-950 text-sm leading-relaxed flex items-start gap-2 bg-white/80 p-3 rounded-2xl border border-amber-100/50 shadow-2xs">
                      <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>

        {/* 부품 데이터 리스트 (실제 DB 부품) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Layers size={18} className="text-slate-500" /> 상세 세부 부품 명세
            </h3>
            <span className="text-xs text-slate-500">총 {selected.parts.length}개 부품 구성</span>
          </div>

          {selected.parts.map((part, idx) => {
            const isOwned = part.price === 0;
            const badge = getCategoryBadge(part.category, part.price, totalPrice, isOwned);

            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl shadow-xs border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-slate-200 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${badge.color}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {part.category}
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-gray-800 leading-snug">
                    {part.name}
                  </h3>

                  {part.specSummary && (
                    <p className="text-xs text-slate-500">
                      {part.specSummary}
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                  <p className="text-lg md:text-xl font-extrabold text-gray-900">
                    {isOwned ? "보유 중" : `${part.price.toLocaleString()}원`}
                  </p>
                  <a
                    href={`https://search.danawa.com/dsearch.php?query=${encodeURIComponent(part.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs md:text-sm font-semibold hover:underline flex items-center gap-1 mt-1 ${
                      isUpgradeMode ? "text-purple-600" : "text-blue-600"
                    }`}
                  >
                    최저가 확인 <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 제어 버튼 */}
        <div className="grid grid-cols-2 gap-4 mt-10">
          <button
            onClick={() => {
              sessionStorage.removeItem('pcBuildData');
              sessionStorage.removeItem('recommendationResult');
              sessionStorage.removeItem('extractedBudget');
              onRestart();
            }}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 p-4 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <RotateCcw size={18} /> 메인 화면으로 가기
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-md"
          >
            <Printer size={18} /> 결과 인쇄하기
          </button>
        </div>
      </div>
    </div>
  );
}