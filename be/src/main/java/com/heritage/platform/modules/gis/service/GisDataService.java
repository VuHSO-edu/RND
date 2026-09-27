package com.heritage.platform.modules.gis.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.common.response.PagedResponse;
import com.heritage.platform.modules.gis.dto.CreateOrgUnitRequest;
import com.heritage.platform.modules.gis.dto.CreatePowerAssetRequest;
import com.heritage.platform.modules.gis.dto.OrgUnitTreeNode;
import com.heritage.platform.modules.gis.entity.OrgUnit;
import com.heritage.platform.modules.gis.entity.PowerAsset;
import com.heritage.platform.modules.gis.repository.OrgUnitRepository;
import com.heritage.platform.modules.gis.repository.PowerAssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GisDataService {

    private final OrgUnitRepository orgUnitRepository;
    private final PowerAssetRepository powerAssetRepository;

    @Transactional(readOnly = true)
    public List<OrgUnitTreeNode> getOrgUnitTree() {
        List<OrgUnit> allUnits = orgUnitRepository.findByIsDeletedFalseOrderByLevelAscCodeAsc();
        Map<String, OrgUnitTreeNode> nodeMap = new LinkedHashMap<>();

        // 1. Tạo các node
        for (OrgUnit u : allUnits) {
            OrgUnitTreeNode node = OrgUnitTreeNode.builder()
                    .id(u.getId())
                    .code(u.getCode())
                    .name(u.getName())
                    .label(u.getCode() + " - " + u.getName())
                    .parentCode(u.getParentCode())
                    .level(u.getLevel())
                    .type(u.getType())
                    .latitude(u.getLatitude())
                    .longitude(u.getLongitude())
                    .address(u.getAddress())
                    .status(u.getStatus())
                    .children(new ArrayList<>())
                    .build();
            nodeMap.put(u.getCode(), node);
        }

        // 2. Ghép cây đa cấp
        List<OrgUnitTreeNode> roots = new ArrayList<>();
        for (OrgUnitTreeNode node : nodeMap.values()) {
            if (node.getParentCode() == null || node.getParentCode().isBlank() || !nodeMap.containsKey(node.getParentCode())) {
                roots.add(node);
            } else {
                OrgUnitTreeNode parent = nodeMap.get(node.getParentCode());
                parent.getChildren().add(node);
            }
        }

        return roots;
    }

    @Transactional(readOnly = true)
    public List<OrgUnit> getAllUnits() {
        return orgUnitRepository.findByIsDeletedFalseOrderByLevelAscCodeAsc();
    }

    @Transactional
    public OrgUnit createUnit(CreateOrgUnitRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();
        if (orgUnitRepository.existsByCode(cleanCode)) {
            throw new BusinessException("DUPLICATE_KEY", "Mã đơn vị '" + cleanCode + "' đã tồn tại trong hệ thống");
        }

        OrgUnit unit = OrgUnit.builder()
                .code(cleanCode)
                .name(request.getName().trim())
                .parentCode(request.getParentCode() != null ? request.getParentCode().trim().toUpperCase() : null)
                .level(request.getLevel() != null ? request.getLevel() : 1)
                .type(request.getType() != null ? request.getType() : "CONG_TY")
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .status("ACTIVE")
                .build();

        return orgUnitRepository.save(unit);
    }

    @Transactional
    public OrgUnit updateUnit(Long id, CreateOrgUnitRequest request) {
        OrgUnit unit = orgUnitRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy đơn vị"));

        unit.setName(request.getName().trim());
        unit.setParentCode(request.getParentCode());
        unit.setLevel(request.getLevel());
        unit.setType(request.getType());
        unit.setLatitude(request.getLatitude());
        unit.setLongitude(request.getLongitude());
        unit.setAddress(request.getAddress());
        unit.setPhone(request.getPhone());

        return orgUnitRepository.save(unit);
    }

    @Transactional
    public void deleteUnit(Long id) {
        OrgUnit unit = orgUnitRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy đơn vị"));
        unit.setDeleted(true);
        unit.setStatus("DELETED");
        orgUnitRepository.save(unit);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PowerAsset> getAssets(String assetType, String unitCode, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PowerAsset> assetPage = powerAssetRepository.findAll(pageable);

        List<PowerAsset> filtered = assetPage.getContent().stream()
                .filter(a -> !a.isDeleted())
                .filter(a -> assetType == null || assetType.isBlank() || assetType.equalsIgnoreCase("ALL") || a.getAssetType().equalsIgnoreCase(assetType.trim()))
                .filter(a -> unitCode == null || unitCode.isBlank() || (a.getUnitCode() != null && a.getUnitCode().equalsIgnoreCase(unitCode.trim())))
                .filter(a -> keyword == null || keyword.isBlank() ||
                        a.getName().toLowerCase().contains(keyword.toLowerCase().trim()) ||
                        a.getCode().toLowerCase().contains(keyword.toLowerCase().trim()))
                .toList();

        return PagedResponse.<PowerAsset>builder()
                .content(filtered)
                .page(assetPage.getNumber())
                .size(assetPage.getSize())
                .totalElements(assetPage.getTotalElements())
                .totalPages(assetPage.getTotalPages())
                .last(assetPage.isLast())
                .build();
    }

    @Transactional
    public PowerAsset createAsset(CreatePowerAssetRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();
        if (powerAssetRepository.existsByCode(cleanCode)) {
            throw new BusinessException("DUPLICATE_KEY", "Mã thiết bị/tài sản '" + cleanCode + "' đã tồn tại");
        }

        PowerAsset asset = PowerAsset.builder()
                .code(cleanCode)
                .name(request.getName().trim())
                .assetType(request.getAssetType().trim().toUpperCase())
                .unitCode(request.getUnitCode() != null ? request.getUnitCode().trim() : null)
                .unitName(request.getUnitName() != null ? request.getUnitName().trim() : null)
                .voltageLevel(request.getVoltageLevel() != null ? request.getVoltageLevel().trim() : null)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status("ACTIVE")
                .notes(request.getNotes())
                .build();

        return powerAssetRepository.save(asset);
    }

    @Transactional
    public PowerAsset updateAsset(Long id, CreatePowerAssetRequest request) {
        PowerAsset asset = powerAssetRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy thiết bị/tài sản"));

        asset.setName(request.getName().trim());
        asset.setAssetType(request.getAssetType().trim().toUpperCase());
        asset.setUnitCode(request.getUnitCode());
        asset.setUnitName(request.getUnitName());
        asset.setVoltageLevel(request.getVoltageLevel());
        asset.setLatitude(request.getLatitude());
        asset.setLongitude(request.getLongitude());
        asset.setNotes(request.getNotes());

        return powerAssetRepository.save(asset);
    }

    @Transactional
    public void deleteAsset(Long id) {
        PowerAsset asset = powerAssetRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy thiết bị/tài sản"));
        asset.setDeleted(true);
        asset.setStatus("DELETED");
        powerAssetRepository.save(asset);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getAssetCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("UNIT", powerAssetRepository.countByAssetTypeAndIsDeletedFalse("UNIT"));
        counts.put("LINE", powerAssetRepository.countByAssetTypeAndIsDeletedFalse("LINE"));
        counts.put("DEVICE", powerAssetRepository.countByAssetTypeAndIsDeletedFalse("DEVICE"));
        return counts;
    }
}
