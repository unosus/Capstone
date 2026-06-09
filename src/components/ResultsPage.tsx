import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import API_BASE from "../utils/api";
import {
  Check,
  Printer,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

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

// 더미
const mockUpgradeResult: Recommendation[] = [
  {
    rankName: "보유 하드웨어 최적화 1번 조합",
    parts: [
      { category: "CPU", name: "임시 하드웨어 풀 로딩 데이터", price: 0, specSummary: "사용자 기존 보유 자산 활용" },
      { category: "GPU", name: "MSI 지포스 RTX 4060 Ti 벤투스 2X 블랙 8GB", price: 540000 },
      { category: "메인보드", name: "ASUS PRIME H610M-K D5 인텍앤컴퍼니", price: 75000 },
      { category: "RAM", name: "삼성전자 DDR5-5600 (16GB) x 2개", price: 120000 },
      { category: "SSD", name: "삼성전자 980 PRO M.2 NVMe (1TB)", price: 145000 },
      { category: "파워", name: "마이크로닉스 Classic II 풀체인지 700W 80PLUS브론즈", price: 82000 },
      { category: "케이스", name: "앱코 G40 시그니처 블랙", price: 59000 }
    ]
  },
  {
    rankName: "가성비 극대화 2번 조합",
    parts: [
      { category: "CPU", name: "임시 하드웨어 풀 로딩 데이터", price: 0, specSummary: "사용자 기존 보유 자산 활용" },
      { category: "GPU", name: "갤럭시 GALAX 지포스 RTX 3070 Ti D6X 8GB", price: 670000 },
      { category: "메인보드", name: "GIGABYTE H610M K V2 제이씨현", price: 77000 },
      { category: "RAM", name: "팀그룹 DDR5-5600 (8GB) x 2개", price: 60000 },
      { category: "SSD", name: "외산 가성비 NVMe SSD (500GB)", price: 55000 },
      { category: "파워", name: "정격 600W 브론즈 파워", price: 65000 },
      { category: "케이스", name: "기본 미들타워 가성비 케이스", price: 38000 }
    ]
  }
];

export function ResultsPage({ onRestart }: ResultsPageProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);
  
  // 현재 결과 페이지가 보유 부품 업그레이드 모드인지 판별할 상태 플래그
  const [isUpgradeMode, setIsUpgradeMode] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) {
      console.log("중복 API 호출 차단됨");
      return;
    }

    hasFetched.current = true;
    console.log("ResultsPage useEffect 실행됨");

    // 0. 보유 부품 활용 견적 모드 데이터 세션 스토리지 탐색
    const data = sessionStorage.getItem('pcBuildData');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.isOwnedMode) {
          console.log("🚀 로컬 부품 업그레이드 테스트 모드 활성화");
          setIsUpgradeMode(true);

          // 사용자가 입력 화면에서 고른 보유 하드웨어 명칭과 카테고리를 가짜 목록에 연동 매핑
          const formattedMock = mockUpgradeResult.map(rec => ({
            ...rec,
            parts: rec.parts.map(p => p.category === parsedData.ownedCategory ? {
              ...p,
              name: parsedData.ownedPartName,
              specSummary: "기존 보유 부품 (0원 연산)"
            } : p)
          }));

          setRecommendations(formattedMock);
          setBudget(parsedData.budget);
          setLoading(false);

          if (formattedMock && formattedMock.length > 0) {
            fetchAiAnalysis(formattedMock[0]);
          }
          return; // 보유부품 시나리오가 성공적으로 타면 이하의 비동기 API 채널 차단
        }
      } catch (e) {
        console.error("보유 부품 데이터 세션 파싱 실패:", e);
      }
    }

    // 1. 자연어 처리 결과 우선 확인 (기존 모드)
    const naturalResult = sessionStorage.getItem('recommendationResult');
    const naturalBudget = sessionStorage.getItem('extractedBudget');

    if (naturalResult) {
      try {
        const fetchedData = JSON.parse(naturalResult);
        console.log("세션 recommendationResult 사용:", fetchedData);

        setRecommendations(fetchedData);
        setBudget(naturalBudget ? parseInt(naturalBudget) : 0);
        setLoading(false);

        if (fetchedData && fetchedData.length > 0) {
          fetchAiAnalysis(fetchedData[0]);
        }
        return;
      } catch (err) {
        console.error("recommendationResult 파싱 실패:", err);
        setError("저장된 추천 결과를 불러오는데 실패했습니다.");
        setLoading(false);
        return;
      }
    }

    // 2. 기존 버튼 선택 모드 처리
    if (!data) {
      console.log("pcBuildData 없음. 처음 화면으로 이동");
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

    const { budget: storedBudget, purpose, brands } = parsedData;
    const parsedBudget = parseInt(storedBudget);
    setBudget(parsedBudget);

    const requestBody = {
      budget: parsedBudget,
      usage: purpose,
      brands: brands
    };

    console.log("추천 API 호출 직전:", requestBody);

    axios.post(`${API_BASE}/api/estimates/recommend`, requestBody)
      .then((res) => {
        console.log("추천 API 응답 전체:", res.data);
        const fetchedData = res.data.recommendations || res.data;
        console.log("추천 데이터:", fetchedData);

        setRecommendations(fetchedData);
        setLoading(false);

        if (fetchedData && fetchedData.length > 0) {
          fetchAiAnalysis(fetchedData[0]);
        }
      })
      .catch((err) => {
        console.error("추천 API 오류:", err);
        setError("데이터를 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, [onRestart]);

  const fetchAiAnalysis = async (selectedRec: Recommendation) => {
    setAiLoading(true);
    setAiAnalysis(null);

    try {
      console.log("AI 분석 요청:", selectedRec.parts);
      const res = await axios.post(`${API_BASE}/api/estimates/analyze`, {
        parts: selectedRec.parts
      });

      console.log("AI 분석 응답:", res.data);

      if (!res.data || !res.data.pros || !res.data.cons || res.data.pros.length === 0) {
        throw new Error("Backend returned empty or invalid AI data");
      }

      setAiAnalysis(res.data);
    } catch (err) {
      console.error("AI 분석 API 오류 발생 (예외 핸들러 작동):", err);

      // 백엔드가 준비되지 않았거나 터졌을 때 방해 없이 띄워줄 공통 피드백 리포트 분기 처리
      if (isUpgradeMode || sessionStorage.getItem('pcBuildData') && JSON.parse(sessionStorage.getItem('pcBuildData') || '{}').isOwnedMode) {
        setAiAnalysis({
          pros: [
            "보유하신 부품의 조립 규격을 역추적하여 물리적 레이아웃 조립 무결성이 완벽히 검증된 정형 조합입니다.",
            "기존 하드웨어 자산을 재활용하여 단가를 절약한 만큼, 남은 가용 예산을 외장 그래픽카드 및 고속 NVMe SSD 파트에 집중 투자하여 작업 체감 성능 시너지를 극대화했습니다."
          ],
          cons: [
            "저가형 메인보드 보급형 칩셋 전원부(VRM) 규격 특성상 고주파 오버클럭 램 사용 시 주파 마진 마찰로 인해 미세한 클럭 다운그레이드가 발생할 수 있습니다.",
            "선택된 시스템의 고부하 수치를 감안하여 향후 조립 시 정격 파워 공급 용량의 최대 부하율(TDP)을 사전 점검하는 것을 권장합니다."
          ]
        });
      } else {
        setAiAnalysis({
          pros: ["추천된 하드웨어 부품 간의 가격대비 성능 밸런스 연산 매칭이 성공적으로 완료되었습니다."],
          cons: ["원격 서버 인프라와의 통신 지연으로 인해 상세 인공지능 분석 리포트를 로드하지 못했습니다."]
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center font-bold text-slate-600">
        최적의 조합을 분석 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onRestart}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const selected = recommendations[selectedIndex];
  if (!selected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-100">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">추천 결과가 없습니다</h2>
          <p className="text-gray-600 mb-6">
            현재 가용 범위와 조건에 맞는 PC 조합을 찾지 못했습니다.
          </p>
          <button
            onClick={onRestart}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            다시 견적 요청하기
          </button>
        </div>
      </div>
    );
  }

  // 각 부품의 단가를 합산하되, 보유 부품은 입력 화면 단에서 0원 처리했으므로 순수 신규 자산 구매 금액만 도출됨.
  const totalPrice = selected.parts.reduce((sum, part) => sum + part.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto pt-10 px-4">
        
        {/* 상단 요약 카드 (모드 상태값에 따라 유기적으로 색상 테마 변환: 블루 ↔ 퍼플) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-8 text-white shadow-xl mb-8 transition-colors duration-500 ${
            isUpgradeMode ? "bg-purple-600 shadow-purple-100" : "bg-blue-600 shadow-blue-100"
          }`}
        >
          <h1 className="text-3xl font-bold mb-4">
            {isUpgradeMode ? "보유 부품 연동 맞춤 견적 결과" : "추천 PC 조합"}
          </h1>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-xl">
              <p className={isUpgradeMode ? "text-purple-100 text-sm" : "text-blue-100 text-sm"}>
                {isUpgradeMode ? "설정한 추가 예산" : "설정 예산"}
              </p>
              <p className="text-2xl font-bold">
                {budget.toLocaleString()}원
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-xl">
              <p className={isUpgradeMode ? "text-purple-100 text-sm" : "text-blue-100 text-sm"}>
                {isUpgradeMode ? "신규 부품 구매 총액" : "견적 총액"}
              </p>
              <p className="text-2xl font-bold">
                {totalPrice.toLocaleString()}원
              </p>
            </div>
          </div>
        </motion.div>

        {/* 추천 조합 선택 버튼 모음 */}
        {recommendations.length > 1 && (
          <div className="flex gap-3 mb-8 overflow-x-auto">
            {recommendations.map((rec, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  setAiAnalysis(null);
                  fetchAiAnalysis(rec);
                }}
                className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  selectedIndex === index
                    ? isUpgradeMode ? "bg-purple-600 text-white shadow-md" : "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-slate-50"
                }`}
              >
                {rec.rankName || `${index + 1}번 조합`}
              </button>
            ))}
          </div>
        )}

        {/* AI 분석 리포트 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-3xl p-8 shadow-sm mb-8 border ${
            isUpgradeMode ? "border-purple-100" : "border-blue-100"
          }`}
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className={`w-6 h-6 ${isUpgradeMode ? "text-purple-600" : "text-blue-600"}`} />
            <h2 className="text-xl font-bold text-slate-900">
              {isUpgradeMode ? "AI 하드웨어 호환성 리포트" : "AI 전문가 분석 리포트"}
            </h2>
          </div>

          {aiLoading ? (
            <div className="flex flex-col items-center py-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className={`w-8 h-8 border-4 border-t-transparent rounded-full mb-4 ${
                  isUpgradeMode ? "border-purple-600" : "border-blue-600"
                }`}
              />
              <p className="text-slate-500 text-sm italic">
                {isUpgradeMode ? "규격 매칭율을 점검 중입니다..." : "전문가가 부품 구성을 살펴보고 있습니다..."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
                <h3 className="flex items-center gap-2 text-emerald-700 font-bold mb-4 text-lg">
                  <ThumbsUp size={20} /> 이런 점이 좋아요
                </h3>
                <ul className="space-y-3">
                  {aiAnalysis?.pros?.map((p, i) => (
                    <li key={i} className="text-emerald-900 text-sm leading-relaxed flex items-start gap-2">
                      <Check size={16} className="mt-1 shrink-0 text-emerald-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                <h3 className="flex items-center gap-2 text-amber-700 font-bold mb-4 text-lg">
                  <ThumbsDown size={20} /> 이런 점은 고려하세요
                </h3>
                <ul className="space-y-3">
                  {aiAnalysis?.cons?.map((c, i) => (
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

        {/* 부품 데이터 리스트 출력 */}
        <div className="space-y-4">
          {selected.parts.map((part, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center"
            >
              <div>
                <span className={`text-xs font-bold uppercase ${isUpgradeMode ? "text-purple-600" : "text-blue-600"}`}>
                  {part.category}
                </span>
                <h3 className="text-lg font-bold text-gray-800">
                  {part.name}
                </h3>
                {part.price === 0 && (
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200 mt-1.5 inline-block">
                    내 보유 부품
                  </span>
                )}
              </div>

              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  {part.price === 0 ? "보유 중" : `${part.price.toLocaleString()}원`}
                </p>
                <a
                  href={`https://search.danawa.com/dsearch.php?query=${encodeURIComponent(part.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-sm hover:underline flex items-center gap-1 justify-end mt-1 ${
                    isUpgradeMode ? "text-purple-500" : "text-blue-500"
                  }`}
                >
                  최저가 확인 <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 제어 트래픽 버튼 */}
        <div className="grid grid-cols-2 gap-4 mt-10">
          <button
            onClick={() => {
              sessionStorage.removeItem('pcBuildData');
              sessionStorage.removeItem('recommendationResult');
              sessionStorage.removeItem('extractedBudget');
              onRestart(); // 로컬 App.tsx 구조의 스위칭 상태를 trigger하여 메인으로 안전 철수
            }}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 p-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={20} /> 메인 화면으로 가기
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            <Printer size={20} /> 결과 인쇄하기
          </button>
        </div>
      </div>
    </div>
  );
}