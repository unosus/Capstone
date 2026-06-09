package com.example.capstone_backend.controller;

import com.example.capstone_backend.dto.OwnedPartUpgradeRequest;
import com.example.capstone_backend.dto.SimplePartResponse;
import com.example.capstone_backend.service.OwnedPartRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OwnedPartController {

    private final OwnedPartRecommendationService ownedPartRecommendationService;

    /**
     * 프론트엔드 셀렉트박스용: 카테고리별 마스터 부품 리스트 반환
     */
    @GetMapping("/list")
    public ResponseEntity<List<SimplePartResponse>> getPartsListByCategory(@RequestParam String category) {
        List<SimplePartResponse> partsList = ownedPartRecommendationService.getDropdownList(category);
        return ResponseEntity.ok(partsList);
    }

    /**
     * 기존 보유 부품 호환성 체킹 및 최종 나머지 부품 조합 추천 알고리즘 가동
     */
    @PostMapping("/upgrade-recommend")
    public ResponseEntity<?> recommendWithOwnedPart(@RequestBody OwnedPartUpgradeRequest request) {
        // 기존 ResultsPage가 처리하는 응답 포맷 규격 데이터 반환
        Object recommendationResult = ownedPartRecommendationService.generateCompatibleEstimates(request);
        return ResponseEntity.ok(recommendationResult);
    }
}