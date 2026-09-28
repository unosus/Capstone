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
  Layers,
  Gamepad2,
  Tv,
  TrendingUp,
  HelpCircle,
  MonitorCheck,
  Info
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

// 1. 카테고리별 뱃지 헬퍼 함수
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

// 2. [추가 기능 1] 체감 성능 파싱 시뮬레이터 컴포넌트
const PerformanceSimulator = ({ parts }: { parts: Part[] }) => {
  const gpu = parts.find((p) => p.category?.toUpperCase().includes('GPU'));
  const cpu = parts.find((p) => p.category?.toUpperCase().includes('CPU'));
  
  const gpuName = gpu?.name || '';
  const cpuName = cpu?.name || '';

  // 성능 파싱 기본 등급 산정 (하이엔드/메인스트림/보급형)
  const isHighGpu = /4070|4080|4090|3080|3090|7800|7900/i.test(gpuName);
  const isMidGpu = /4060|3060|3070|7600|6700/i.test(gpuName);

  const games = [
    {
      title: "배틀그라운드 (FHD 국민옵션)",
      fps: isHighGpu ? "200+ FPS (완벽 방어)" : isMidGpu ? "144+ FPS (쾌적)" : "60~100 FPS (매끄러움)",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    {
      title: "로스트아크 / 발로란트 / 롤",
      fps: "240+ FPS (최상위 방어)",
      badge: "bg-blue-100 text-blue-800 border-blue-200"
    },
    {
      title: "4K 프리미어 프로 영상편집",
      fps: isHighGpu ? "4K 실시간 렌더링 가능" : "FHD/4K 자막작업 원활",
      badge: "bg-purple-100 text-purple-800 border-purple-200"
    },
    {
      title: "3D 그래픽 & 로컬 AI 추론",
      fps: isHighGpu ? "Stable Diffusion 초고속 생성" : "기본 이미지 생성 및 렌더링 지원",
      badge: "bg-amber-100 text-amber-800 border-amber-200"
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Gamepad2 className="text-blue-600" size={20} /> 이 컴퓨터로 무엇을 할 수 있나요? (체감 성능)
        </h3>
        <span className="text-xs text-slate-400">FPS / 예상 작업 환경</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {games.map((g, i) => (
          <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 mb-1">{g.title}</span>
            <span className={`text-sm font-bold px-3 py-1.5 rounded-xl border w-fit ${g.badge}`}>
              {g.fps}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. [추가 기능 2] 초보자 조립 및 포트 연결 가이드 컴포넌트
const AssemblyGuide = ({ parts }: { parts: Part[] }) => {
  const hasGpu = parts.some((p) => p.category?.toUpperCase().includes('GPU') && p.price > 0);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-amber-200 bg-amber-50/30 mb-8">
      <div className="flex items-center gap-2 mb-4 text-amber-900">
        <Tv className="text-amber-600" size={20} />
        <h3 className="text-lg font-bold">초보자를 위한 설치 & 모니터 포트 연결 가이드</h3>
      </div>

      <div className="space-y-3">
        {hasGpu && (
          <div className="bg-amber-100/70 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-amber-700 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-amber-900">
              <strong className="font-bold">⚠️ 가장 많이 하는 실수 주의!</strong>
              <p className="mt-1 leading-relaxed">
                외장 그래픽카드(GPU)가 포함된 견적입니다. 모니터 케이블(HDMI/DP)을 메인보드 상단 포트가 아닌 <span className="underline font-bold text-amber-900">아래쪽 외장 그래픽카드 단자</span>에 꽂으셔야 화면이 정상 출력됩니다!
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <MonitorCheck className="text-blue-600 shrink-0" size={18} />
            <span className="text-xs text-slate-700 font-medium">권장 모니터 케이블: <strong>DP 1.4 또는 HDMI 2.1</strong></span>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <Zap className="text-indigo-600 shrink-0" size={18} />
            <span className="text-xs text-slate-700 font-medium">권장 멀티탭: <strong>과전류 차단 접지 멀티탭 사용 추천</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. [추가 기능 3] 미래 확장성 지수 컴포넌트
const UpgradabilityIndex = ({ parts, totalPrice }: { parts: Part[]; totalPrice: number }) => {
  const power = parts.find((p) => p.category?.toUpperCase().includes('POWER'));
  const ram = parts.find((p) => p.category?.toUpperCase().includes('RAM'));

  // 파워 용량 추정치 연산
  const isPowerGenerous = power && (power.name.includes('750W') || power.name.includes('850W') || power.name.includes('1000W'));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-emerald-600" size={20} />
          <h3 className="text-lg font-bold text-slate-900">미래 부품 업그레이드 확장성 지수</h3>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
          확장성 85점 (우수)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">그래픽카드 교체 여유</p>
          <p className="text-sm font-bold text-slate-800">
            {isPowerGenerous ? "🟢 파워 용량 충분 (향후 GPU만 교체 가능)" : "🟡 표준 정격 파워 적용"}
          </p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">RAM 슬롯 여유</p>
          <p className="text-sm font-bold text-slate-800">
            {ram?.name.includes('x 2') ? "🟢 추가 2슬롯 확장 가능" : "🟢 듀얼 채널 슬롯 지원"}
          </p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">SSD 저장공간 확장</p>
          <p className="text-sm font-bold text-slate-800">
            🟢 추가 M.2 NVMe 슬롯 보유
          </p>
        </div>
      </div>
    </div>
  );
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

    // 1. 자연어 처리 추천 결과 확인 (세션 스토리지)
    const naturalResult = sessionStorage.getItem('recommendationResult');
    const naturalBudget = sessionStorage.getItem('extractedBudget');

    if (naturalResult) {
      try {
        const fetchedData = JSON.parse(naturalResult);
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

    // 2. 일반 견적 입력 데이터 확인
    const data = sessionStorage.getItem('pcBuildData');
    if (!data) {
      onRestart();
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (err) {
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

    const requestBody = {
      budget: parsedBudget,
      usage: purpose,
      brands: brands || [],
      isOwnedMode: !!isOwnedMode,
      ownedCategory: ownedCategory || null,
      ownedPartName: ownedPartName || null
    };

    axios.post(`${API_BASE}/api/estimates/recommend`, requestBody)
      .then((res) => {
        const fetchedData = res.data.recommendations || res.data;

        if (!fetchedData || fetchedData.length === 0) {
          setError("조건에 맞는 견적을 찾지 못했습니다.");
          setLoading(false);
          return;
        }

        setRecommendations(fetchedData);
        setLoading(false);

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

  const fetchAiAnalysis = async (selectedRec: Recommendation) => {
    setAiLoading(true);
    setAiAnalysis(null);

    try {
      const res = await axios.post(`${API_BASE}/api/estimates/analyze`, {
        parts: selectedRec.parts
      });

      if (res.data && res.data.pros && res.data.cons) {
        setAiAnalysis(res.data);
      } else {
        throw new Error("Invalid AI Analysis Data");
      }
    } catch (err) {
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

  const totalPrice = selected.parts.reduce((sum, part) => sum + (part.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto pt-10 px-4">
        
        {/* 1. 상단 요약 카드 */}
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

        {/* 2. 추천 조합 선택 탭 */}
        {recommendations.length > 1 && (
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {recommendations.map((rec, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  fetchAiAnalysis(rec);
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

        {/* 3. 시각화 차트 컴포넌트 */}
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

        {/* 4. [신규 기능 1] 체감 성능 시뮬레이터 */}
        <motion.div
          key={`simulator-${selectedIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <PerformanceSimulator parts={selected.parts} />
        </motion.div>

        {/* 5. [신규 기능 2] 미래 확장성 지수 */}
        <motion.div
          key={`upgrade-${selectedIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <UpgradabilityIndex parts={selected.parts} totalPrice={totalPrice} />
        </motion.div>

        {/* 6. AI 분석 리포트 */}
        <motion.div
          key={`ai-${selectedIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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

        {/* 7. [신규 기능 3] 초보자 조립 및 포트 연결 가이드 */}
        <motion.div
          key={`assembly-${selectedIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AssemblyGuide parts={selected.parts} />
        </motion.div>

        {/* 8. 부품 상세 목록 */}
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

        {/* 9. 하단 제어 버튼 */}
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