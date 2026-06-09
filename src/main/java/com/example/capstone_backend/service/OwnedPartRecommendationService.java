package com.example.capstone_backend.service;

import com.example.capstone_backend.dto.OwnedPartUpgradeRequest;
import com.example.capstone_backend.dto.SimplePartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OwnedPartRecommendationService {

    private final JdbcTemplate jdbcTemplate; // 개별 부품 테이블 유연 대응을 위해 JdbcTemplate 활용

    /**
     * 개별 테이블 구조 분할 상태에 따른 드롭다운 데이터 동적 바인딩 SQL
     */
    public List<SimplePartResponse> getDropdownList(String category) {
        String tableName = category.toLowerCase(); // cpu, gpu, motherboard 등 테이블 매핑
        String sql = String.format("SELECT id, name, price FROM %s ORDER BY price DESC", tableName);

        List<SimplePartResponse> responses = new ArrayList<>();
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);

        for (Map<String, Object> row : rows) {
            SimplePartResponse res = new SimplePartResponse();
            res.setId(((Number) row.get("id")).longValue());
            res.setName((String) row.get("name"));
            res.setPrice(((Number) row.get("price")).longValue());
            responses.add(res);
        }
        return responses;
    }

    /**
     * 호환성 룰 엔진 가동 알고리즘 (예시: 메인보드 소켓 및 규격 일치 제약조건 체킹)
     */
    public Object generateCompatibleEstimates(OwnedPartUpgradeRequest request) {
        String ownedCategory = request.getOwnedCategory();
        Long ownedId = request.getOwnedPartId();

        String socketConstraint = "";

        // 룰 엔진 규격 1: 유저가 메인보드를 골랐다면, 해당 보드의 CPU 소켓 정보를 역추적하여 호환 CPU 검색
        if ("MOTHERBOARD".equals(ownedCategory)) {
            String getSocketSql = "SELECT cpu_socket FROM motherboard WHERE id = ?";
            String socket = jdbcTemplate.queryForObject(getSocketSql, String.class, ownedId);

            // 향후 추천 쿼리문 가동 시 조건절에 바인딩
            socketConstraint = " WHERE socket_type = '" + socket + "'";
        }

        // 룰 엔진 규격 2: 유저가 CPU를 골랐다면, CPU 제조사에 알맞은 메인보드 칩셋 규격으로만 락킹
        if ("CPU".equals(ownedCategory)) {
            String getCpuSeriesSql = "SELECT socket_type FROM cpu WHERE id = ?";
            String socket = jdbcTemplate.queryForObject(getCpuSeriesSql, String.class, ownedId);

            socketConstraint = " WHERE cpu_socket = '" + socket + "'";
        }

        // [알고리즘 연산부]: 도출된 제약 조건을 걸어 메인보드/CPU 테이블을 쿼리하고,
        // 나머지 부품(GPU, RAM, SSD, 파워, 케이스)의 가격 합산이 사용자가 제시한 추가 예산 금액 이하가 되도록 조합 빌딩

        // 데이터 구조 결과 랩핑 컴포넌트 호출부 구현생략...
        return null;
    }
}