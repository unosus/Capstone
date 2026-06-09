package com.example.capstone_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SimplePartResponse {
    private Long id;
    private String name;
    private Long price;
}