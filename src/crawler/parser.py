import re

def parse_cpu_info(spec_string):
    """CPU 스펙에서 소켓과 지원 메모리 규격 추출 (비어있는 값 처리)"""
    # 문자열이 아니거나(NaN 등) 비어있으면 기본값 반환
    if not isinstance(spec_string, str):
        return {"socket": "Unknown", "ram_type": "Unknown"}

    socket = re.search(r'소켓([a-zA-Z0-9]+)', spec_string)
    ram_type = "DDR5" if "DDR5" in spec_string else ("DDR4" if "DDR4" in spec_string else "Unknown")

    return {
        "socket": socket.group(1) if socket else "Unknown",
        "ram_type": ram_type
    }

# extract_model_keyword 함수도 마찬가지로 보완
def extract_model_keyword(name):
    if not isinstance(name, str):
        return "Unknown"

    name = name.upper()
    name = re.sub(r'\(.*\)', '', name)
    match = re.search(r'([0-9]{4,5}[A-Z]*|RTX\s*[0-9]{4})', name)
    if match:
        return match.group(0).replace(" ", "")
    return name.strip()