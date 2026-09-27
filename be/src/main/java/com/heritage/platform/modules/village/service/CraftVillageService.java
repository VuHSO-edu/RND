package com.heritage.platform.modules.village.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.village.dto.CreateVillageRequest;
import com.heritage.platform.modules.village.dto.VillageTreeNode;
import com.heritage.platform.modules.village.entity.CraftVillage;
import com.heritage.platform.modules.village.repository.CraftVillageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CraftVillageService {

    private final CraftVillageRepository craftVillageRepository;

    @Transactional(readOnly = true)
    public List<CraftVillage> getAllActiveVillages() {
        return craftVillageRepository.findByIsDeletedFalseAndIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public CraftVillage getVillageBySlug(String slug) {
        return craftVillageRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new BusinessException("VILLAGE_NOT_FOUND", "Không tìm thấy thông tin làng nghề yêu cầu"));
    }

    @Transactional(readOnly = true)
    public List<CraftVillage> getVillagesByRegion(String region) {
        return craftVillageRepository.findByRegionAndIsDeletedFalse(region);
    }

    /**
     * Tạo Cây phân cấp Di sản Làng nghề theo đúng format UI
     * Vùng Miền -> Tỉnh Thành -> Làng Nghề Di Sản
     */
    @Transactional(readOnly = true)
    public List<VillageTreeNode> getVillageTree() {
        List<CraftVillage> allVillages = craftVillageRepository.findByIsDeletedFalseAndIsActiveTrue();

        Map<String, String> regionNames = Map.of(
                "Bac_Bo", "Đồng Bằng Bắc Bộ & Sông Hồng",
                "Trung_Bo", "Duyên Hải Miền Trung & Cố Đô",
                "Tay_Nguyen", "Đại Ngàn Tây Nguyên",
                "Nam_Bo", "Vùng Đất Phương Nam & Miền Tây"
        );

        Map<String, Map<String, List<CraftVillage>>> grouped = new LinkedHashMap<>();

        for (CraftVillage v : allVillages) {
            String r = v.getRegion() != null ? v.getRegion() : "Bac_Bo";
            String p = v.getProvince() != null ? v.getProvince() : "Chưa rõ";

            grouped.computeIfAbsent(r, k -> new LinkedHashMap<>())
                   .computeIfAbsent(p, k -> new ArrayList<>())
                   .add(v);
        }

        List<VillageTreeNode> roots = new ArrayList<>();

        for (Map.Entry<String, Map<String, List<CraftVillage>>> rEntry : grouped.entrySet()) {
            String regionKey = rEntry.getKey();
            String regionTitle = regionNames.getOrDefault(regionKey, regionKey);

            VillageTreeNode regionNode = VillageTreeNode.builder()
                    .id("region_" + regionKey)
                    .code(regionKey)
                    .name(regionTitle)
                    .label(regionKey + " - " + regionTitle)
                    .type("REGION")
                    .children(new ArrayList<>())
                    .build();

            for (Map.Entry<String, List<CraftVillage>> pEntry : rEntry.getValue().entrySet()) {
                String provinceName = pEntry.getKey();
                List<CraftVillage> villageList = pEntry.getValue();

                Double provLat = villageList.get(0).getLatitude();
                Double provLng = villageList.get(0).getLongitude();

                VillageTreeNode provinceNode = VillageTreeNode.builder()
                        .id("prov_" + regionKey + "_" + provinceName)
                        .code(provinceName)
                        .name(provinceName)
                        .label(provinceName + " (" + villageList.size() + " làng nghề)")
                        .type("PROVINCE")
                        .latitude(provLat)
                        .longitude(provLng)
                        .children(new ArrayList<>())
                        .build();

                for (CraftVillage v : villageList) {
                    VillageTreeNode vNode = VillageTreeNode.builder()
                            .id("village_" + v.getId())
                            .code(v.getSlug())
                            .name(v.getName())
                            .label(v.getName())
                            .type("VILLAGE")
                            .latitude(v.getLatitude())
                            .longitude(v.getLongitude())
                            .province(v.getProvince())
                            .region(v.getRegion())
                            .children(new ArrayList<>())
                            .build();
                    provinceNode.getChildren().add(vNode);
                }

                regionNode.getChildren().add(provinceNode);
            }

            roots.add(regionNode);
        }

        return roots;
    }

    @Transactional
    public CraftVillage createVillage(CreateVillageRequest request) {
        String cleanSlug = request.getSlug().trim().toLowerCase();
        if (craftVillageRepository.findBySlugAndIsDeletedFalse(cleanSlug).isPresent()) {
            throw new BusinessException("DUPLICATE_KEY", "Mã làng nghề '" + cleanSlug + "' đã tồn tại");
        }

        CraftVillage village = CraftVillage.builder()
                .name(request.getName().trim())
                .slug(cleanSlug)
                .region(request.getRegion().trim())
                .province(request.getProvince().trim())
                .historicalSummary(request.getHistoricalSummary())
                .foundingYearEstimate(request.getFoundingYearEstimate())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .coverImageUrl(request.getCoverImageUrl())
                .build();

        return craftVillageRepository.save(village);
    }

    @Transactional
    public CraftVillage updateVillage(Long id, CreateVillageRequest request) {
        CraftVillage village = craftVillageRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy làng nghề"));

        village.setName(request.getName().trim());
        village.setRegion(request.getRegion().trim());
        village.setProvince(request.getProvince().trim());
        village.setHistoricalSummary(request.getHistoricalSummary());
        village.setFoundingYearEstimate(request.getFoundingYearEstimate());
        village.setLatitude(request.getLatitude());
        village.setLongitude(request.getLongitude());
        if (request.getCoverImageUrl() != null) {
            village.setCoverImageUrl(request.getCoverImageUrl());
        }

        return craftVillageRepository.save(village);
    }

    @Transactional
    public void deleteVillage(Long id) {
        CraftVillage village = craftVillageRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy làng nghề"));
        village.setDeleted(true);
        village.setIsActive(false);
        craftVillageRepository.save(village);
    }
}
