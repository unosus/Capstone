import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingCart, Cpu, Check, Printer, RotateCcw, Info, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { fetchRecommendations } from '../utils/api';
import type { Recommendation } from '../utils/api';

export function ResultsPage() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState(0);
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    const data = sessionStorage.getItem('pcBuildData');
    if (!data) {
      navigate('/home');
      return;
    }

    const buildData = JSON.parse(data);
    setBudget(parseInt(buildData.budget));
    setPurpose(buildData.purpose);

    fetchRecommendations(buildData)
      .then((res) => {
        setRecommendations(res.recommendations);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">추천 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">연결 오류</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  const selected = recommendations[selectedIndex];
  if (!selected) return null;

  // selectedIndex 변경 시 정확히 재계산
  const totalPrice = selected.parts.reduce((sum, part) => sum + part.price, 0);
  const remaining = budget - totalPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">새로운 조합</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">PC Builder</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">

        {/* 요약 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-xl p-6 md:p-8 mb-6 text-white"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl mb-2">추천 PC 조합</h1>
              <p className="text-blue-100">{purpose} 용도 최적화</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-blue-100 mb-1">총 예산</p>
              <p className="text-2xl md:text-3xl">{budget.toLocaleString()}원</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-blue-100 mb-1">실제 총액</p>
              <p className="text-2xl md:text-3xl">{totalPrice.toLocaleString()}원</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm text-blue-100 mb-1">남은 예산</p>
              <p className={`text-2xl md:text-3xl ${remaining >= 0 ? '' : 'text-red-300'}`}>
                {remaining.toLocaleString()}원
              </p>
            </div>
          </div>
        </motion.div>

        {/* 조합 선택 탭 - 백엔드에서 여러 조합이 오는 경우 */}
        {recommendations.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 mb-6 overflow-x-auto pb-2"
          >
            {recommendations.map((rec, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`flex-shrink-0 px-5 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  selectedIndex === idx
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                {rec.rankName}
              </button>
            ))}
          </motion.div>
        )}

        {/* 조합 이름 표시 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-semibold text-gray-800">{selected.rankName}</h2>
        </motion.div>

        {/* 부품 목록 */}
        <div className="space-y-4 mb-6">
          {selected.parts.map((part, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* 부품 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm rounded-full">
                        {part.category}
                      </span>
                      {part.brand && (
                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {part.brand}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl mb-3 text-gray-900 leading-snug">
                      {part.name}
                    </h3>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{part.specSummary}</span>
                    </div>
                  </div>

                  {/* 가격 */}
                  <div className="lg:text-right flex-shrink-0">
                    <p className="text-3xl text-blue-600 mb-1">
                      {part.price.toLocaleString()}
                      <span className="text-lg text-gray-500 ml-1">원</span>
                    </p>
                    <a
                      href={`https://search.danawa.com/dsearch.php?query=${encodeURIComponent(part.name)}&tab=main`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg mt-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      다나와에서 검색
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 조합 특징 노트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl">조합 특징</h3>
          </div>
          <ul className="space-y-2.5">
            {recommendations.map((rec, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-start gap-3 text-gray-700"
              >
                <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span><strong>{rec.rankName}</strong> — 총 {rec.parts.reduce((sum, p) => sum + p.price, 0).toLocaleString()}원</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* 액션 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <button
            onClick={() => navigate('/home')}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            다른 조합 보기
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <Printer className="w-5 h-5" />
            조합 저장/인쇄
          </button>
        </motion.div>
      </div>

      <style>{`
        @media print {
          .sticky { position: relative !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
