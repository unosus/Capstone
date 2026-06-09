import React, { useState } from 'react';
import { Search, BarChart3, ExternalLink, Cpu, HardDrive, Layout, Monitor, ShieldAlert, Zap, Box } from 'lucide-react';

interface PartItem {
  id: number;
  category: 'CPU' | 'GPU' | 'MOTHERBOARD' | 'RAM' | 'SSD' | 'POWER' | 'CASE';
  name: string;
  brand: string;
  price: number;
  benchmarkScore: number; 
  specSummary: string;     
}

// 더미
const localHardwareDatabase: PartItem[] = [
  // --- CPU 파트 ---
  { id: 11, category: 'CPU', brand: 'Intel', name: '인텔 코어i9-14세대 14900K (랩터레이크 리프레시)', price: 785000, benchmarkScore: 61000, specSummary: '소켓1700 / 24코어(8P+16E) / 32스레드 / 기본 클럭: 3.2GHz / 터보 클럭: 6.0GHz / DDR5, DDR4 지원 / PCIe5.0' },
  { id: 12, category: 'CPU', brand: 'AMD', name: 'AMD 라이젠7-5세대 7800X3D (라파엘)', price: 532000, benchmarkScore: 34500, specSummary: '소켓AM5 / 8코어 / 16스레드 / 기본 클럭: 4.2GHz / 3D V-Cache 기술 적용 (게임 성능 특화) / L3 캐시: 96MB / TDP 120W' },
  { id: 13, category: 'CPU', brand: 'Intel', name: '인텔 코어i5-14세대 14400F (랩터레이크 리프레시)', price: 245000, benchmarkScore: 26000, specSummary: '소켓1700 / 10코어(6P+4E) / 16스레드 / 기본 클럭: 2.5GHz / 내장그래픽 미포함 (가성비 조립용)' },
  { id: 14, category: 'CPU', brand: 'AMD', name: 'AMD 라이젠5-5세대 7500F (라파엘)', price: 198000, benchmarkScore: 27000, specSummary: '소켓AM5 / 6코어 / 12스레드 / 기본 클럭: 3.7GHz / 가성비 게이밍 PC 구성 선호도 1위 부품' },

  // --- GPU (그래픽카드) 파트 ---
  { id: 21, category: 'GPU', brand: 'NVIDIA', name: 'MSI 지포스 RTX 4090 슈프림 X D6X 24GB', price: 2980000, benchmarkScore: 39500, specSummary: '부스트클럭: 2625MHz / 스트림 프로세서: 16384개 / 이엠텍 설계 보드 / 3중 트라이프로져3 쿨링팬 / 두께: 78mm' },
  { id: 22, category: 'GPU', brand: 'NVIDIA', name: '이엠텍 지포스 RTX 4070 SUPER MIRACLE X3 D6X 12GB', price: 945000, benchmarkScore: 31800, specSummary: '부스트클럭: 2475MHz / 스트림 프로세서: 7168개 / 정격파워 650W 이상 권장 / 고해상도 QHD 게이밍 최적화' },
  { id: 23, category: 'GPU', brand: 'NVIDIA', name: 'ZOTAC GAMING 지포스 RTX 4060 Ti Twin Edge 빌보드 D6 8GB', price: 558000, benchmarkScore: 22500, specSummary: '부스트클럭: 2460MHz / 스트림 프로세서: 4352개 / 컴팩트 2팬 구조 / 미들타워 케이스 높은 장착 호환성' },

  // --- MOTHERBOARD (메인보드) 파트 ---
  { id: 31, category: 'MOTHERBOARD', brand: 'ASUS', name: 'ASUS ROG MAXIMUS Z790 HERO', price: 890000, benchmarkScore: 9800, specSummary: '인텔(소켓1700) / Z790 칩셋 / ATX 규격 / 전원부: 20+1페이즈 / DDR5 최대 192GB / PCIe5.0 / WiFi 6E 장착' },
  { id: 32, category: 'MOTHERBOARD', brand: 'MSI', name: 'MSI MAG B760M 박격포 맥스 WIFI', price: 215000, benchmarkScore: 8500, specSummary: '인텔(소켓1700) / B760 칩셋 / M-ATX 규격 / 전원부: 12+1+1페이즈 / 실버 방열판 장착 / 국민 메인보드' },
  { id: 33, category: 'MOTHERBOARD', brand: 'GIGABYTE', name: 'GIGABYTE B650M AORUS ELITE AX', price: 230000, benchmarkScore: 8800, specSummary: 'AMD(소켓AM5) / B650 칩셋 / M-ATX 규격 / 라이젠 7000/8000시리즈 완벽 대응 / 풀커버 방열판 / WiFi 통합형' },

  // --- RAM (메모리) 파트 ---
  { id: 41, category: 'RAM', brand: '삼성전자', name: '삼성전자 DDR5-5600 (16GB)', price: 62000, benchmarkScore: 7500, specSummary: '데스크탑용 / DDR5 / 5600MHz (PC5-44800) / 램타이밍: CL46 / 기본 순정 컴포넌트 데이터 무결성 보장' },
  { id: 42, category: 'RAM', brand: 'SK하이닉스', name: 'SK하이닉스 DDR5-5600 기본형 (16GB)', price: 68000, benchmarkScore: 7900, specSummary: '데스크탑용 / DDR5 / 수율 및 오버클럭 잠재력 우수 / 안정적인 전력 관리 PMIC 칩셋 탑재' },
  { id: 43, category: 'RAM', brand: 'G.SKILL', name: 'G.SKILL DDR5-6000 CL30 TRIDENT Z5 RGB J (32GB 패키지)', price: 215000, benchmarkScore: 9500, specSummary: '튜닝용 램 / 16GB x 2개 세트 / XMP 3.0 자동 오버클럭 지원 / 화려한 RGB 인프라 감성 연출' },

  // --- SSD (저장장치) 파트 ---
  { id: 51, category: 'SSD', brand: '삼성전자', name: '삼성전자 990 PRO M.2 NVMe (1TB)', price: 158000, benchmarkScore: 15400, specSummary: '내장형 SSD / M.2(2280) / PCIe4.0x4 (64GT/s) / 순차읽기: 7,450MB/s / 순차쓰기: 6,900MB/s / 디바이스 제어 컨트롤러 탑재' },
  { id: 52, category: 'SSD', brand: 'SK하이닉스', name: 'SK하이닉스 Platinum P41 M.2 NVMe (1TB)', price: 162000, benchmarkScore: 15200, specSummary: '내장형 SSD / PCIe4.0x4 / 읽기 속도: 7,000MB/s / 쓰기 속도: 6,500MB/s / 최고 수준의 발열 통제 및 내구성 설계' },

  // --- POWER (파워서플라이) 파트 ---
  { id: 61, category: 'POWER', brand: '시소닉', name: '시소닉 FOCUS GOLD GX-850 Full Modular', price: 175000, benchmarkScore: 8900, specSummary: 'ATX 파워 / 정격 출력: 850W / 80 PLUS Gold 인증 / 풀모듈러 구조 (원하는 케이블만 선택 연결) / AS 10년 보증' },
  { id: 62, category: 'POWER', brand: '마이크로닉스', name: '마이크로닉스 Classic II 풀체인지 700W 80PLUS브론즈', price: 83000, benchmarkScore: 7100, specSummary: 'ATX 파워 / 정격 출력: 700W / 80 PLUS Bronze 등급 / 가성비 빌드의 표준 파워 고유 컴포넌트' },

  // --- CASE (컴퓨터케이스) 파트 ---
  { id: 71, category: 'CASE', brand: '앱코', name: '앱코 G40 시그니처 (블랙)', price: 59500, benchmarkScore: 6500, specSummary: '미들타워 케이스 / 전면 메쉬 구조 / 고성능 140mm 고정 RGB 쿨링팬 4개 기본 장착 / 측면 도어형 강화유리' },
  { id: 72, category: 'CASE', brand: 'darkFlash', name: 'darkFlash DS900 ARGB 유리창형 (화이트)', price: 64000, benchmarkScore: 6800, specSummary: '미들타워 케이스 / 전면 및 측면 파노라마 글래스 배치 (어항형 디자인 감성) / ARGB 팬 제어 가능' }
];

const categories = [
  { id: 'ALL', label: '전체 보기', icon: <Box size={16} /> },
  { id: 'CPU', label: 'CPU (프로세서)', icon: <Cpu size={16} /> },
  { id: 'GPU', label: '그래픽카드', icon: <Monitor size={16} /> },
  { id: 'MOTHERBOARD', label: '메인보드', icon: <Layout size={16} /> },
  { id: 'RAM', label: '메모리 (RAM)', icon: <Zap size={16} /> },
  { id: 'SSD', label: '스토리지 (SSD)', icon: <HardDrive size={16} /> },
];

export function PartsListPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 카테고리별 최대 성능 점수를 구해서 스케일바 비율 연산에 활용
  const getFilteredMaxScore = () => {
    const currentCategoryParts = localHardwareDatabase.filter(p => selectedCategory === 'ALL' || p.category === selectedCategory);
    return Math.max(...currentCategoryParts.map(p => p.benchmarkScore), 1);
  };

  const currentMaxScore = getFilteredMaxScore();

  // 실시간 하이브리드 필터링 (탭 선택 조건 + 타이핑 검색 조건)
  const filteredParts = localHardwareDatabase.filter(part => {
    const matchesCategory = selectedCategory === 'ALL' || part.category === selectedCategory;
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          part.specSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full">
      {/*서브 대시보드 요약 정보 레이어 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-2xl border border-blue-100">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">총 하드웨어 수산</p>
          <p className="text-3xl font-black text-slate-900">{localHardwareDatabase.length}<span className="text-lg font-bold text-slate-500 ml-1">개 모델</span></p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-2xl border border-indigo-100">
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">표준 카테고리 풀</p>
          <p className="text-3xl font-black text-slate-900">7<span className="text-lg font-bold text-slate-500 ml-1">개 대역</span></p>
        </div>
        <div className="bg-gradient-to-br from-slate-100/70 to-slate-200/40 p-5 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">데이터 동기화 규격</p>
          <p className="text-lg font-bold text-slate-800 flex items-center gap-1.5 mt-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> 로컬 가상 샌드박스 활성
          </p>
        </div>
      </div>

      {/* 실시간 필터 및 검색 바 콘트롤 허브 */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* 카테고리 스크롤 탭 바 */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 select-none no-scrollbar max-w-full md:max-w-[70%]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* 검색 인풋 유닛 */}
        <div className="relative flex-1 md:max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="부품명, 제조사, 상세 스펙 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 메인 뷰 컴포넌트 마스터 리스트 리포트 */}
      {filteredParts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 font-bold shadow-sm">
          검색 조건 및 카테고리에 부합하는 하드웨어 데이터가 풀에 존재하지 않습니다.
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredParts.map((part) => {
              // 해당 카테고리 내부 최고점수 대비 상대적 성능 게이지 스케일 바 연산
              const barPercentage = ((part.benchmarkScore / currentMaxScore) * 100).toFixed(0);
              
              return (
                <div key={part.id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-slate-50/30 transition-colors">
                  
                  {/* 왼쪽 파트: 카테고리 뱃지 및 디바이스 명칭 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-wide border border-blue-100">
                        {part.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-extrabold tracking-tight uppercase">{part.brand}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 truncate tracking-tight">{part.name}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100/70 font-medium">
                      {part.specSummary}
                    </p>
                  </div>

                  {/* 중간 파트: 객체 벤치마크 퍼포먼스 게이지 바 */}
                  <div className="w-full md:w-56 shrink-0 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1"><BarChart3 size={12} className="text-slate-400" /> 상대적 성능 인덱스</span>
                      <span className="text-blue-600 font-black">{part.benchmarkScore.toLocaleString()} 점</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${barPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* 오른쪽 파트: 수집 단가 명세 및 다나와 링크 허브 */}
                  <div className="text-left md:text-right md:w-36 shrink-0 flex md:flex-col justify-between md:justify-center items-center md:items-end gap-1 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="md:text-right">
                      <p className="text-[10px] text-slate-400 font-medium">다나와 실시간 평균가</p>
                      <p className="text-lg font-black text-slate-900 tracking-tight">{part.price.toLocaleString()}<span className="text-sm font-bold text-slate-600 ml-0.5">원</span></p>
                    </div>
                    <a
                      href={`https://search.danawa.com/dsearch.php?query=${encodeURIComponent(part.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-500 hover:text-blue-600 font-bold inline-flex items-center gap-0.5 hover:underline bg-blue-50/50 md:bg-transparent px-2.5 py-1.5 md:p-0 rounded-lg border border-blue-100/50 md:border-0"
                    >
                      다나와 링크 <ExternalLink size={10} />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}