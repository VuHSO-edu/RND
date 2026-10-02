package com.heritage.platform.modules.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeoJsonFeatureCollection {

    @Builder.Default
    private String type = "FeatureCollection";
    private List<GeoJsonFeature> features;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeoJsonFeature {
        @Builder.Default
        private String type = "Feature";
        private GeoJsonGeometry geometry;
        private Map<String, Object> properties;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeoJsonGeometry {
        @Builder.Default
        private String type = "Point";
        private double[] coordinates; // [lng, lat]
    }
}
