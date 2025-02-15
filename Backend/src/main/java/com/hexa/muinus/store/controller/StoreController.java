package com.hexa.muinus.store.controller;

import com.hexa.muinus.common.security.Authorization;
import com.hexa.muinus.store.dto.information.AnnouncementDTO;
import com.hexa.muinus.store.dto.information.AnnouncementModifyDTO;
import com.hexa.muinus.store.dto.information.AnnouncementWriteDTO;
import com.hexa.muinus.store.dto.store.*;
import com.hexa.muinus.store.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("api/store")
@RequiredArgsConstructor
@Slf4j
public class StoreController {

    private final StoreService storeService;

    /**
     * 매장 등록
     *
     * @param storeRegisterDTO 등록할 매장 정보
     * @return
     * - 성공 : 200(OK)
     * - 실패 : Exception
     */
    @PostMapping("/register")
    public ResponseEntity<Void> registerStore(@Authorization String userEmail, @Valid @RequestBody StoreRegisterDTO storeRegisterDTO){
        log.info("Registering store {} of userEmail : {}", storeRegisterDTO, userEmail);
        storeService.registerStore(userEmail, storeRegisterDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * 매장 비활성화 (폐업 / 삭제)
     * @param storeNo 매장 번호
     * @return
     * - 성공 : 200(OK)
     * - 실패 : Exception
     */
    @PutMapping("/delete")
    public ResponseEntity<Void> closeStore(@RequestParam("storeNo") int storeNo){
        log.info("StoreController > closeStore: {}", storeNo);
        storeService.closeStore(storeNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 매장 정보 수정
     * @param storeModifyDTO 매장 수정할 정보
     * @return
     * - 성공 : 200(OK)
     * - 실패 : Exception
     */
    @PutMapping("/update")
    public ResponseEntity<Void> modifyStore(@Authorization String userEmail, @Valid @RequestBody StoreModifyDTO storeModifyDTO){
        log.info("Modifying store {} of userEmail : {}", storeModifyDTO, userEmail);
        storeService.modifyStore(userEmail, storeModifyDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * 제품으로 매장리스트 조회
     * @param itemId 제품 번호
     * @return List<StoreSearchDTO>
     * - 해당 제품이 등록이 된 매장 정보s 반환
     */
    @GetMapping("/list")
    public ResponseEntity<List<StoreSearchDTO>> searchStores(
            @RequestParam("itemId") int itemId,
            @RequestParam("x") BigDecimal x,
            @RequestParam("y") BigDecimal y,
            @RequestParam(required = false, defaultValue = "1000") int radius){
        log.info("StoreController > searchStores itemId:{}, x:{}, y:{}, radius:{}", itemId, x, y, radius);
        List<StoreSearchDTO> stores = storeService.searchStore(itemId, x, y, radius);
        return ResponseEntity.ok().body(stores);
    }

    /**
     * 내 주변 매장 리스트
     * @param x 경도
     * @param y 위도
     * @return List<StoreMapDTO>
     *
     */
    @GetMapping("/list/near")
    public ResponseEntity<List<StoreMapDTO>> getNearStores(@RequestParam("x") BigDecimal x, @RequestParam("y") BigDecimal y){
        log.info("StoreController > getNearStores");
        return ResponseEntity.ok().body(storeService.getNearStores(x, y));
    }

    /**
     * 매장 상세 정보 조회
     * @param storeNo 조회할 매장 정보
     * @return StoreDetailDTO
     * - 매장 기본 정보
     * - 매장 공지사항s
     * - 매장에서 판매하는 제품 정보s
     */
    @GetMapping("/detail")
    public ResponseEntity<StoreDetailDTO> getStoreDetail(@RequestParam("storeNo") int storeNo){
        log.info("StoreController > getStoreDetail: {}", storeNo);
        StoreDetailDTO store = storeService.getStoreDetail(storeNo);
        return ResponseEntity.ok().body(store);
    }

    /**
     * 매장 공지 사항 작성
     * @param announcementWriteDTO 작성한 공지 사항
     * @return
     * - 성공 : 200(OK)
     * - 실패 : Exception
     */
    @PostMapping("/board")
    public ResponseEntity<Void> writeAnnouncement(@Authorization String userEmail, @Valid @RequestBody AnnouncementWriteDTO announcementWriteDTO){
        log.info("Write Announcement {}", announcementWriteDTO);
        storeService.writeAnnouncement(userEmail, announcementWriteDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * 매장 공지 사항 수정
     * @param announcementModifyDTO 수정한 공지 사항 데이터
     * - 성공 : 200(OK)
     * - 실패 : Exception
     */
    @PutMapping("/board")
    public ResponseEntity<Void> modifyAnnouncement(@Authorization String userEmail,@Valid @RequestBody AnnouncementModifyDTO announcementModifyDTO){
        log.info("Modify Announcement {}", announcementModifyDTO);
        storeService.modifyAnnouncement(userEmail, announcementModifyDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * 공지사항 삭제
     * @param boardId 삭제할 공지사항 정보
     * @return
     * - 성공 : 200(OK)
     * - 실패 : Exception
     */
    @DeleteMapping("/board/{boardId}")
    public ResponseEntity<Void> deleteAnnouncement(@Authorization String userEmail, @PathVariable int boardId){
        log.info("Delete Announcement {}", boardId);
        storeService.removeAnnouncement(userEmail, boardId);
        return ResponseEntity.ok().build();
    }

    /**
     * 내 매장 공지사항 목록
     * @param userEmail 이메일
     * @return List<AnnouncementDTO>
     * - 성공 : 200(OK)
     * - 실패 : Exception
     */
    @GetMapping("/board/list")
    public ResponseEntity<List<AnnouncementDTO>> getAnnouncements(@Authorization String userEmail){
        log.info("StoreController > getAnnouncementList: {}", userEmail);
        return ResponseEntity.ok(storeService.getAnnouncements(userEmail));
    }

    /**
     * 플리마켓 설정 변경
     * @param flimarketModifyDTO 플리마켓 데이터
     * @return
     */
    @PutMapping("/section_regist")
    public ResponseEntity<Void> modifyflimarketState(@Authorization String userEmail, FlimarketModifyDTO flimarketModifyDTO) {
        log.info("Modify flimarketState {}", flimarketModifyDTO);
        storeService.modifyFlimarketState(userEmail, flimarketModifyDTO);
        return ResponseEntity.ok().build();
    }

}
