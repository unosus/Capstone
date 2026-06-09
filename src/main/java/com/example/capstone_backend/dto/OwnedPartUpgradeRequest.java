package com.example.capstone_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OwnedPartUpgradeRequest {
    private Long budget;          // 새로 구매할 부품들의 한도 금액
    private String usage;         // GAMING, OFFICE 등 용도 명세
    private String ownedCategory; // "CPU", "GPU", "MOTHERBOARD" 중 하나
    private Long ownedPartId;     // 선택한 고유 부품 ID 번호
}