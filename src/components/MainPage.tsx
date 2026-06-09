import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, BookOpen, Wrench, BarChart3, ChevronRight, Activity, ShieldCheck, Sparkles } from 'lucide-react';

interface MainPageProps {
  onStart: () => void;
  onOwnedStart: () => void;
  onDbStart: () => void;
  onGuide: () => void;
}

export function MainPage({ onStart, onOwnedStart, onDbStart, onGuide }: MainPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3, ease: "easeOut" } 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/70 text-slate-900 p-6 md:p-12 flex flex-col items-center justify-center overflow-x-hidden relative">
      
      {/* 1. 최상단 히어로 유닛 섹션 */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl w-full text-center mb-12 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/5 border border-blue-600/20 rounded-full text-blue-600 text-xs font-bold tracking-wider mb-6 shadow-sm backdrop-blur-md select-none">
          <Sparkles size={14} />
          GEMINI 1.5 PRO & COMPATIBILITY RULE ENGINE ACTIVE
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-none text-slate-900 select-none">
          <motion.span 
            className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 cursor-pointer drop-shadow-[0_2px_10px_rgba(37,99,235,0.15)]"
            whileHover={{ 
              scale: 1.05,
              rotate: [-0.5, 0.5, -0.5, 0],
              transition: { duration: 0.3 }
            }}
          >
            PickPC
          </motion.span>{' '}
        </h1>
        
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium break-keep leading-relaxed">
          몇 번의 클릭을 통해 여러분에게 맞는 조립 PC 견적을 생성해보세요!
        </p>
      </motion.div>

      {/* 2. 실시간 플랫폼 인프라 상태 매트릭스 대시보드 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl w-full mb-10 bg-white/70 border border-slate-200/80 backdrop-blur-md p-5 rounded-3xl z-10 shadow-sm select-none"
      >
        <div className="p-4 text-center md:text-left md:border-r border-slate-200/60">
          <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase flex items-center justify-center md:justify-start gap-1">
            <Activity size={12} className="text-blue-500" /> 분석 엔진 상태
          </p>
          <p className="text-xl md:text-2xl font-black text-blue-600 mt-1">OPTIMIZED</p>
        </div>

        <div className="p-4 text-center md:text-left md:border-r border-slate-200/60">
          <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase flex items-center justify-center md:justify-start gap-1">
            <ShieldCheck size={12} className="text-purple-500" /> 호환성 매칭 정합성
          </p>
          <p className="text-xl md:text-2xl font-black text-purple-600 mt-1">100% 무결성</p>
        </div>

        <div className="p-4 text-center md:text-left md:border-r border-slate-200/60">
          <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase flex items-center justify-center md:justify-start gap-1">
            <Cpu size={12} className="text-emerald-500" /> 크롤링 연동 DB 풀
          </p>
          <p className="text-xl md:text-2xl font-black text-emerald-600 mt-1">LIVE SYNC</p>
        </div>

        <div className="p-4 text-center md:text-left">
          <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase flex items-center justify-center md:justify-start gap-1">
            <Sparkles size={12} className="text-indigo-500" /> 맞춤형 피드백 세션
          </p>
          <p className="text-xl md:text-2xl font-black text-indigo-600 mt-1">PERSONALIZED</p>
        </div>
      </motion.div>

      {/* 3. 4열 아키텍처 대형 카드 버튼 섹션 */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl w-full z-10"
      >
        {/* 카드 1: 일반 견적 시작 */}
        <motion.button
          variants={itemVariants}
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.99 }}
          onClick={onStart}
          className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] text-left flex flex-col justify-between group h-full transition-all relative overflow-hidden shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5"
        >
          <div>
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:shadow-md group-hover:shadow-blue-500/20 transition-all duration-200">
              <Zap className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">새로운 PC 견적</h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium break-keep">
              가용 자산 예산 한도와 주 용도를 수신하여 파트별 밸런스가 균형을 이루는 청정 완본체 구성을 추천합니다.
            </p>
          </div>
          <div className="mt-8 flex items-center text-blue-600 font-bold text-xs md:text-sm tracking-wide">
            엔진 가동 <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        {/* 카드 2: 기존 부품 활용 견적 */}
        <motion.button
          variants={itemVariants}
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOwnedStart}
          className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] text-left flex flex-col justify-between group h-full transition-all relative overflow-hidden shadow-sm hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/5"
        >
          <div>
            <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:border-purple-500 group-hover:shadow-md group-hover:shadow-purple-500/20 transition-all duration-200">
              <Wrench className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">보유 부품 활용</h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium break-keep">
              기존 운용 중인 하드웨어(CPU, GPU, 메인보드) 스펙 조건을 유지한 상태에서 역조합 물리 호환 규격을 매칭합니다.
            </p>
          </div>
          <div className="mt-8 flex items-center text-purple-600 font-bold text-xs md:text-sm tracking-wide">
            업그레이드 연산 <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        {/* 카드 3: 하드웨어 DB & 벤치마크 조회 */}
        <motion.button
          variants={itemVariants}
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.99 }}
          onClick={onDbStart}
          className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] text-left flex flex-col justify-between group h-full transition-all relative overflow-hidden shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5"
        >
          <div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:shadow-md group-hover:shadow-emerald-500/20 transition-all duration-200">
              <BarChart3 className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">벤치마크 마스터</h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium break-keep">
              마스터 데이터베이스에 동기화 축적된 개별 하드웨어의 다나와 평균가 및 공인 성능 지표 스케일을 조회합니다.
            </p>
          </div>
          <div className="mt-8 flex items-center text-emerald-400 font-bold text-xs md:text-sm tracking-wide">
            스펙트럼 로드 <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        {/* 카드 4: 부품 가이드 */}
        <motion.button
          variants={itemVariants}
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.99 }}
          onClick={onGuide}
          className="bg-white border border-slate-200 p-6 md:p-8 rounded-[2rem] text-left flex flex-col justify-between group h-full transition-all relative overflow-hidden shadow-sm hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5"
        >
          <div>
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:shadow-md group-hover:shadow-indigo-500/20 transition-all duration-200">
              <BookOpen className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">부품 기초 가이드</h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium break-keep">
              하드웨어 초심자를 위해 CPU(두뇌), GPU(눈), RAM(책상) 등 고유 부품의 물리적 개념과 역할을 가이드합니다.
            </p>
          </div>
          <div className="mt-8 flex items-center text-indigo-600 font-bold text-xs md:text-sm tracking-wide">
            지식 베이스 개방 <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

      </motion.div>
    </div>
  );
}