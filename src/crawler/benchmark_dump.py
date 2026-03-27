import os
import requests
import pandas as pd
from io import StringIO
import time

def dump_all_benchmarks(type_name):
    print(f"\n>>> {type_name} 벤치마크 전체 리스트 덤프 시작")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
    data_dir = os.path.join(project_root, "data")
    if not os.path.exists(data_dir): os.makedirs(data_dir)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    }

    # 부품별 URL 매핑 (RAM은 DDR4, DDR5 모두 순회)
    url_map = {
        "CPU": ["https://www.cpubenchmark.net/cpu-list/all"],
        "GPU": ["https://www.videocardbenchmark.net/gpu-list/all", "https://www.videocardbenchmark.net/gpu_list.php"],
        "SSD": [f"https://www.harddrivebenchmark.net/hdd-list/page{i}" for i in range(1, 21)],
        "RAM": ["https://www.memorybenchmark.net/ram_list.php", "https://www.memorybenchmark.net/ram_list-ddr4.php"]
    }

    all_dfs = []

    for url in url_map[type_name]:
        try:
            if type_name == "SSD":
                page_num = url.split('page')[-1]
                print(f"  - SSD 페이지 {page_num} 수집 중...", end="\r")

            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code != 200:
                continue

            tables = pd.read_html(StringIO(response.text))

            # 해당 페이지에서 유효한 테이블 찾기
            found_in_page = False
            for t in tables:
                if len(t) > 30: # RAM DDR4 등 작은 리스트도 수집하기 위해 기준 하향
                    df_tmp = t.copy()

                    # SSD/RAM은 3번째 열(Index 2), CPU/GPU는 2번째 열(Index 1) 값 크롤링
                    score_idx = 2 if type_name in ["SSD", "RAM"] else 1
                    if len(df_tmp.columns) <= score_idx:
                        score_idx = 1

                    res = df_tmp.iloc[:, [0, score_idx]].copy()
                    res.columns = ['Bench_Name', 'Score']
                    all_dfs.append(res)
                    found_in_page = True
                    break

            # CPU와 GPU는 첫 번째 URL에서 성공하면 즉시 종료
            if found_in_page and type_name in ["CPU", "GPU"]:
                break

            # SSD는 여러 URL(페이지)을 모두 돌아야 하므로 break하지 않음
            if type_name == "SSD":
                time.sleep(0.3)

        except Exception:
            continue

    if all_dfs:
        df_final = pd.concat(all_dfs).drop_duplicates(subset=['Bench_Name'])
        df_final['Score'] = pd.to_numeric(df_final['Score'].astype(str).str.replace(',', ''), errors='coerce')
        df_final = df_final.dropna(subset=['Score'])
        df_final = df_final[df_final['Score'] > 0]

        save_path = os.path.join(data_dir, f"total_bench_{type_name}.csv")
        df_final.to_csv(save_path, index=False, encoding="utf-8-sig")
        print(f"\n {type_name} 최종 덤프 성공: {len(df_final)}개")
    else:
        print(f"\n {type_name} 유효한 데이터를 찾지 못했습니다.")

if __name__ == "__main__":
    for part in ["CPU", "GPU", "SSD", "RAM"]:
        dump_all_benchmarks(part)