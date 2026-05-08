import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, DollarSign, Target, ChevronRight, Check, ArrowLeft } from 'lucide-react';

// ✅ 백엔드 RequestDTO의 usage 값과 일치하도록 대문자로 수정
const usageOptions = [
  { value: 'GAMING', label: '게이밍', emoji: '🎮', desc: '고사양 게임 플레이' },
  { value: 'VIDEO_EDITING', label: '영상 편집', emoji: '🎬', desc: '4K 영상 작업' },
  { value: 'MACHINE_LEARNING', label: '머신 러닝', emoji: '🤖', desc: 'AI 모델 학습' },
  { value: 'OFFICE', label: '사무용', emoji: '💼', desc: '문서 작업 중심' },
  { value: 'CONTENT_CREATION', label: '콘텐츠 제작', emoji: '🎨', desc: '디자인 작업' },
  { value: 'PROGRAMMING', label: '프로그래밍', emoji: '💻', desc: '개발 환경' },
];

const brandOptions = [
  { id: 'intel', name: 'Intel' },
  { id: 'amd', name: 'AMD' },
  { id: 'nvidia', name: 'NVIDIA' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'corsair', name: 'Corsair' },
  { id: 'asus', name: 'ASUS' },
  { id: 'msi', name: 'MSI' },
  { id: 'gigabyte', name: 'Gigabyte' },
];

// 숫자를 한국식 단위(만원/백만원/천만원)로 변환
function formatKoreanBudget(value: number): string {
  if (value === 0) return '';
  const 억 = Math.floor(value / 100000000);
  const 만 = Math.floor((value % 100000000) / 10000);
  const 나머지 = value % 10000;

  const parts: string[] = [];
  if (억 > 0) parts.push(`${억}억`);
  if (만 > 0) parts.push(`${만}만`);
  if (나머지 > 0) parts.push(`${나머지}`);

  return parts.join(' ') + '원';
}

// onBack 프롭스 추가
export function InputForm({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [budget, setBudget] = useState('');
  const [purpose, setPurpose] = useState('');
  const [brands, setBrands] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 데이터를 저장하고 App.tsx의 상태를 변경하도록 알림
    sessionStorage.setItem('pcBuildData', JSON.stringify({
      budget,
      purpose,
      brands: Object.keys(brands).filter(key => brands[key])
    }));

    onComplete(); // App.tsx의 handleInputComplete 실행
  };

  const toggleBrand = (brandId: string) => {
    setBrands(prev => ({ ...prev, [brandId]: !prev[brandId] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-95"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">BuildMate</h1>
                <p className="text-xs text-gray-500">맞춤형 PC 조합 추천</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            어떤 PC를 찾고 계신가요?
          </h2>
          <p className="text-gray-600 text-lg">
            몇 가지 정보만 입력하시면 최적의 부품을 추천해드립니다
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Budget Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <label className="block">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">예산</h3>
                  <p className="text-sm text-gray-600">총 예산을 입력해주세요</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="1000000"
                  required
                  className="w-full px-5 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg transition-all font-medium"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">원</span>
              </div>
              {budget && parseInt(budget) > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-gray-600"
                >
                  약 <span className="text-blue-600 font-bold">{formatKoreanBudget(parseInt(budget))}</span> 예산으로 추천해드립니다
                </motion.p>
              )}
            </label>
          </div>

          {/* Purpose Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">사용 목적</h3>
                <p className="text-sm text-gray-600">주요 사용 용도를 선택해주세요</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {usageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPurpose(option.value)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    purpose === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-bold mb-1 ${purpose === option.value ? 'text-blue-600' : 'text-gray-900'}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-600 leading-tight">{option.desc}</p>
                    </div>
                  </div>
                  {purpose === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Preferences Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">선호 브랜드</h3>
              <p className="text-sm text-gray-600">선호하는 브랜드를 선택해주세요 (선택사항)</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {brandOptions.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => toggleBrand(brand.id)}
                  className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                    brands[brand.id]
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!budget || !purpose}
            whileHover={{ scale: !budget || !purpose ? 1 : 1.02 }}
            whileTap={{ scale: !budget || !purpose ? 1 : 0.98 }}
            className={`w-full py-5 rounded-xl text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              budget && purpose
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            최적의 조합 찾기
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.form>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600 font-medium">매일 최신 가격 업데이트</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}