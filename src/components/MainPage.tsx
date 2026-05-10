// src/components/MainPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, BookOpen, ChevronRight } from 'lucide-react';

interface MainPageProps {
  onStart: () => void;
  onGuide: () => void;
}

export function MainPage({ onStart, onGuide }: MainPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-200">
          <Cpu className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">BuildMate</h1>
        <p className="text-slate-600 text-lg">나에게 딱 맞는 PC, 이제 어렵지 않게 찾으세요.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* 견적 시작 카드 */}
        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-100 border border-white text-left flex flex-col justify-between group"
        >
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <Zap className="w-6 h-6 text-blue-600 group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">AI 맞춤 견적 시작</h2>
            <p className="text-slate-500">예산과 용도만 입력하면 최적의 부품 조합을 추천해드려요.</p>
          </div>
          <div className="mt-8 flex items-center text-blue-600 font-bold">
            시작하기 <ChevronRight className="w-5 h-5 ml-1" />
          </div>
        </motion.button>

        {/* 부품 가이드 카드 */}
        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGuide}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-white text-left flex flex-col justify-between group"
        >
          <div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
              <BookOpen className="w-6 h-6 text-indigo-600 group-hover:text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">부품 기초 가이드</h2>
            <p className="text-slate-500">CPU, 그래픽카드... 뭐가 뭔지 모르겠다면? 쉽게 설명해드려요.</p>
          </div>
          <div className="mt-8 flex items-center text-indigo-600 font-bold">
            알아보기 <ChevronRight className="w-5 h-5 ml-1" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}