// src/components/GuidePage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Cpu, Layout, HardDrive, Zap, Speaker, Monitor, Box } from 'lucide-react';

const guides = [
  {
    title: "CPU",
    subtitle: "컴퓨터의 '두뇌'",
    desc: "모든 연산을 담당하는 핵심 부품입니다. 성능이 좋을수록 복잡한 작업을 훨씬 빠르게 처리합니다.",
    icon: <Cpu className="w-8 h-8" />,
    color: "bg-blue-500",
    shadow: "shadow-blue-100"
  },
  {
    title: "메인보드",
    subtitle: "컴퓨터의 '신체'",
    desc: "모든 부품이 장착되는 판입니다. 부품 간의 연결과 안정성을 책임지는 신경계 역할을 합니다.",
    icon: <Layout className="w-8 h-8" />,
    color: "bg-slate-700",
    shadow: "shadow-slate-200"
  },
  {
    title: "GPU",
    subtitle: "컴퓨터의 '눈'",
    desc: "화면을 그려내는 화가입니다. 고사양 게임이나 영상 편집 시 가장 중요한 역할을 수행합니다.",
    icon: <Monitor className="w-8 h-8" />,
    color: "bg-indigo-500",
    shadow: "shadow-indigo-100"
  },
  {
    title: "RAM",
    subtitle: "컴퓨터의 '책상'",
    desc: "임시 작업 공간입니다. 용량이 클수록 여러 프로그램을 동시에 띄워도 버벅임이 없습니다.",
    icon: <Speaker className="w-8 h-8" />,
    color: "bg-purple-500",
    shadow: "shadow-purple-100"
  },
  {
    title: "SSD/HDD",
    subtitle: "컴퓨터의 '창고'",
    desc: "데이터를 영구 저장합니다. SSD는 속도가 매우 빨라 부팅과 게임 로딩 시간을 줄여줍니다.",
    icon: <HardDrive className="w-8 h-8" />,
    color: "bg-rose-500",
    shadow: "shadow-rose-100"
  },
  {
    title: "파워",
    subtitle: "컴퓨터의 '심장'",
    desc: "부품들에 전기를 공급합니다. 안정적인 전력 공급은 컴퓨터 전체의 수명을 결정합니다.",
    icon: <Zap className="w-8 h-8" />,
    color: "bg-amber-500",
    shadow: "shadow-amber-100"
  },
  {
    title: "케이스",
    subtitle: "컴퓨터의 '집'",
    desc: "부품을 보호하고 열기를 배출합니다. 디자인과 쿨링 성능을 결정하는 껍데기 역할을 합니다.",
    icon: <Box className="w-8 h-8" />,
    color: "bg-zinc-500",
    shadow: "shadow-zinc-200"
  }
];

export function GuidePage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 rounded-full transition-all active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">부품 기초 가이드</h1>
            <p className="text-xs text-slate-500">초보자를 위해 부품 설명을 준비했어요!</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl ${guide.shadow} flex flex-col items-center text-center h-full`}
            >
              <div className={`w-16 h-16 rounded-2xl ${guide.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20`}>
                {guide.icon}
              </div>
              
              <div className="mb-4">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">
                  {guide.subtitle}
                </span>
                <h2 className="text-2xl font-bold text-slate-900">{guide.title}</h2>
              </div>
              
              <p className="text-slate-600 text-sm leading-relaxed break-keep">
                {guide.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}