// src/components/OwnedPartInputForm.tsx
import React, { useState, useEffect } from 'react';
import { Cpu, DollarSign, Target, ChevronRight } from 'lucide-react';

interface SimplePart {
  id: number;
  name: string;
  price: number;
}

interface OwnedPartInputFormProps {
  onComplete: () => void;
}

// 🚀 백엔드가 안 켜져 있을 때 셀렉트 박스에 띄워줄 로컬 테스트용 부품 마스터 데이터
const mockHardwarePool: Record<'CPU' | 'GPU' | 'MOTHERBOARD', SimplePart[]> = {
  CPU: [
    { id: 101, name: '인텔 코어i5-13세대 13400F (랩터레이크)', price: 240000 },
    { id: 102, name: '인텔 코어i9-13세대 13900KF (랩터레이크)', price: 650000 },
    { id: 103, name: 'AMD 라이젠5-5세대 7500F (라파엘)', price: 210000 }
  ],
  GPU: [
    { id: 201, name: '갤럭시 GALAX 지포스 RTX 3070 Ti D6X 8GB', price: 670000 },
    { id: 202, name: 'MSI 지포스 RTX 4060 Ti 벤투스 2X 블랙 OC D6 8GB', price: 540000 },
    { id: 203, name: '이엠텍 지포스 RTX 4070 SUPER MIRACLE X3 D6X 12GB', price: 920000 }
  ],
  MOTHERBOARD: [
    { id: 301, name: 'GIGABYTE H610M K V2 제이씨현 (벌크)', price: 77000 },
    { id: 302, name: 'ASUS PRIME H610M-K D5 인텍앤컴퍼니', price: 75000 },
    { id: 303, name: 'MSI PRO B760M-A WIFI', price: 160000 }
  ]
};

const usageOptions = [
  { value: 'GAMING', label: '게이밍', emoji: '🎮' },
  { value: 'VIDEO_EDITING', label: '영상 편집', emoji: '🎬' },
  { value: 'OFFICE', label: '사무용', emoji: '💼' },
  { value: 'PROGRAMMING', label: '프로그래밍', emoji: '💻' },
];

export function OwnedPartInputForm({ onComplete }: OwnedPartInputFormProps) {
  const [budget, setBudget] = useState('');
  const [purpose, setPurpose] = useState('');
  const [ownedCategory, setOwnedCategory] = useState<'CPU' | 'GPU' | 'MOTHERBOARD'>('CPU');
  const [availableParts, setAvailableParts] = useState<SimplePart[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);

  // 카테고리가 바뀔 때마다 데이터에서 뽑아서 셀렉트 박스 동기화
  useEffect(() => {
    setSelectedPartId(null);
    setAvailableParts(mockHardwarePool[ownedCategory]);
  }, [ownedCategory]);

  // 🚀 입력된 숫자를 한국어 금액 표기법(예: 2500000 -> 250만원)으로 변환하는 함수
  const formatKoreanAmount = (numStr: string) => {
    if (!numStr) return '';
    const num = parseInt(numStr, 10);
    if (isNaN(num) || num === 0) return '';

    const uk = Math.floor(num / 100000000);
    const man = Math.floor((num % 100000000) / 10000);

    let result = '';
    if (uk > 0) result += `${uk}억 `;
    if (man > 0) result += `${man}만원`;
    else if (uk > 0) result += '원'; // 1억 딱 떨어질 때 처리
    else result += `${num}원`; // 만원 미만 단위 처리

    return result;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || !budget || !purpose) return;

    const currentPart = availableParts.find(p => p.id === selectedPartId);

    const requestData = {
      budget: parseInt(budget),
      usage: purpose,
      ownedCategory: ownedCategory,
      ownedPartId: selectedPartId,
      ownedPartName: currentPart ? currentPart.name : '',
      isOwnedMode: true
    };

    sessionStorage.setItem('pcBuildData', JSON.stringify(requestData));
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-950 mb-2">기존 부품 활용 맞춤 견적</h2>
        <p className="text-slate-500 text-sm">이미 보유 중인 하드웨어를 선택해 주세요. 데이터 기반으로 호환성을 맞춰 추천해드립니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. 보유 부품 선택 섹션 */}
        <div className="space-y-4">
          <label className="block text-slate-900 font-bold text-lg flex items-center gap-2">
            <Cpu className="text-blue-600 w-5 h-5" /> 1. 보유 중인 부품 카테고리
          </label>
          
          <div className="grid grid-cols-3 gap-3">
            {(['CPU', 'GPU', 'MOTHERBOARD'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setOwnedCategory(cat)}
                className={`py-3 rounded-xl font-bold border transition-all text-sm ${
                  ownedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'CPU' ? '메인 CPU' : cat === 'GPU' ? '그래픽카드' : '메인보드'}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <p className="text-xs text-slate-400 font-semibold mb-2">보유 부품 모델명 선택</p>
            <select
              value={selectedPartId || ''}
              onChange={(e) => setSelectedPartId(Number(e.target.value))}
              required
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium text-slate-800 bg-white"
            >
              <option value="" disabled>보유하고 계신 하드웨어 모델을 선택해 주세요</option>
              {availableParts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.name} ({part.price.toLocaleString()}원 상당)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. 추가 가용 예산 입력 섹션 */}
        <div className="space-y-3">
          <label className="block text-slate-900 font-bold text-lg flex items-center gap-2">
            <DollarSign className="text-blue-600 w-5 h-5" /> 2. 추가 조립 가용 예산
          </label>
          <div className="relative">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="예: 1500000"
              required
              className="w-full px-5 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg transition-all font-medium"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">원</span>
          </div>

          {/* 실시간 한글 금액 변환 출력 추가 */}
          {budget && (
            <div className="text-sm font-bold text-blue-600 px-1 animate-fade-in">
              💡 입력된 예산: <span className="text-base text-indigo-600">{formatKoreanAmount(budget)}</span>
            </div>
          )}
        </div>

        {/* 3. 사용 목적 선택 섹션 */}
        <div className="space-y-3">
          <label className="block text-slate-900 font-bold text-lg flex items-center gap-2">
            <Target className="text-blue-600 w-5 h-5" /> 3. 주요 사용 목적
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {usageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPurpose(option.value)}
                className={`p-4 rounded-xl border-2 transition-all text-center relative ${
                  purpose === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-slate-800'
                }`}
              >
                <span className="text-xl block mb-1">{option.emoji}</span>
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!selectedPartId || !budget || !purpose}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
            selectedPartId && budget && purpose
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          기존 부품 기반 호환성 추천 조합 찾기
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}