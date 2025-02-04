package com.hexa.muinus.store.service;

import com.hexa.muinus.common.exception.store.*;
import com.hexa.muinus.common.exception.user.UserNotFoundException;
import com.hexa.muinus.store.domain.information.Announcement;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.dto.information.AnnouncementDTO;
import com.hexa.muinus.store.dto.information.AnnouncementDeleteDTO;
import com.hexa.muinus.store.dto.information.AnnouncementModifyDTO;
import com.hexa.muinus.store.dto.information.AnnouncementWriteDTO;
import com.hexa.muinus.store.dto.store.*;
import com.hexa.muinus.store.domain.store.repository.StoreRepository;
import com.hexa.muinus.users.domain.user.Users;
import com.hexa.muinus.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreService {
    private final StoreRepository storeRepository;
    private final UserService userService;
    private final StoreItemService storeItemService;
    private final AnnouncementService announcementService;


    /**
     * 매장 등록
     * @param storeRegisterDTO 매장 등록 정보
     */
    @Transactional("dataTransactionManager")
    public void registerStore(StoreRegisterDTO storeRegisterDTO) {
        log.info("Starting store registration for DTO: {}", storeRegisterDTO);

        Users user = getUserByEmail(storeRegisterDTO.getUserEmail());

        validStoreByUser(user);
        validateStoreLocation(storeRegisterDTO.getLocationX(), storeRegisterDTO.getLocationY());
        validateStoreRegistrationNo(storeRegisterDTO.getRegistrationNo());

        Store store = storeRegisterDTO.toEntity(user);
        log.debug("Converted StoreRegistDTO to Store entity: {}", store);
        saveStore(store);
    }

    /**
     * 점주 조회
     * @param userEmail 사용자 이메일(점주)
     * @return Users
     */
    @Transactional(readOnly = true)
    public Users getUserByEmail(String userEmail) {
        Users user = userService.findUserByEmail(userEmail);
        // 사용자 유효성 검사
        if (user == null) {
            throw new UserNotFoundException(userEmail);
        }
        return user;
    }

    /**
     * 점주 - 매장 소유 여부 확인(1개만 소유/오픈 가능)
     * @param user 점주
     */
    private void validStoreByUser(Users user){
        if(findStoreByUser(user) != null){
            throw new StoreAlreadyRegisteredException(user.getEmail());
        }
    }

    /**
     * 사용자 정보로 매장 찾기
     * @param user 사용자
     * @return Store
     */
    public Store findStoreByUser(Users user){
        return storeRepository.findByUsers(user);
    }

    /**
     * 주소 중복 확인
     * @param x
     * @param y
     */
    private void validateStoreLocation(BigDecimal x, BigDecimal y){
        if(findStoreByLocation(x, y) != null){
            throw new StoreLocationDuplicateException(x, y);
        }
    }

    /**
     * 주소로 매장 찾기
     * @param x 경도
     * @param y 위도
     * @return Store
     */
    public Store findStoreByLocation(BigDecimal x, BigDecimal y) {
        return storeRepository.findByLocationXAndLocationY(x, y);
    }

    /**
     * 사업자 등록 번호 중복 확인
     * @param registrationNo 사업자 등록 번호
     */
    private void validateStoreRegistrationNo(String registrationNo){
        if(findStoreByRegistrationNo(registrationNo) != null){
            throw new StoreRegistrationNoDuplicateException(registrationNo);
        }
    }

    /**
     * 사업자등록번호로 매장 찾기
     * @param registrationNo 사업자 등록 번호
     * @return Store
     */
    @Transactional(readOnly = true)
    public Store findStoreByRegistrationNo(String registrationNo) {
        return storeRepository.findByRegistrationNo(registrationNo);
    }

    /**
     * Insert Store
     * 
     * @param store Store 객체
     * @return storeNo 추가된 Store 객체
     */
    private Store saveStore(Store store) {
        System.out.println("Saving store: " + store);
        Store savedStore = storeRepository.save(store);
        log.info("Store saved successfully with ID: {}", savedStore.getStoreNo());
        return savedStore;
    }

    /**
     * 매장 삭제
     * - `deleted` 컬럼 값 "Y"-> "N" 으로 변경
     * - 해당 매장 비활성화
     * @param storeNo 매장 번호
     */
    @Transactional
    public void closeStore(int storeNo) {
        log.info("Closing store with No: {}", storeNo);
        // 사용자 - 매장 조회
        Store store = findStoreByStoreNo(storeNo);
        // 매장 비활성화
        store.disableStore();
        log.info("Store {} has been disabled successfully (deleted={})", store.getStoreNo(), store.getDeleted());
    }


    /**
     * 매장 정보 수정
     * @param storeModifyDTO 수정할 매장 정보
     */
    @Transactional
    public void modifyStore(StoreModifyDTO storeModifyDTO) {
        log.info("Modifying store with userEmail: {}", storeModifyDTO.getUserEmail());
        // 사용자 - 매장 조회
        Store store = findStoreByEmail(storeModifyDTO.getUserEmail());
        // 매장 정보 수정
        store.updateStoreInfo(storeModifyDTO);
        log.info("Store {} has been updated successfully ({})", store.getStoreNo(), store);
    }

    /**
     * 해당 제품을 판매하는 내 주변 매장 조회
     * @param itemId 제품 번호
     * @return List<StoreSearchDTO> stores
     */
    @Transactional(readOnly = true)
    public List<StoreSearchDTO> searchStore(int itemId, BigDecimal x, BigDecimal y, int radius) {
        log.info("Searching store with itemId: {} and radius: {}", itemId, radius);
        // 제품 판매하는 매장 리스트
        List<StoreSearchDTO> stores = storeRepository.findStoresByItemIdAndRadius(itemId, x.doubleValue(), y.doubleValue(), radius).stream()
                .map(StoreSearchDTO::new)
                .toList();

        if (stores.isEmpty()) {
            log.warn("No stores found for itemId: {} and radius: {}", itemId, radius);
        }

        return stores;
    }

    /**
     * 매장 상세 정보 조회
     * 플리마켓 아이템은 공개하지 않음
     * - 매장 검색이 되었을 때 매장 번호 반환 
     * -> 해당 번호로 매장 접근
     * @param storeNo 매장 번호 
     * @return StoreDetailDTO
     */
    @Transactional(readOnly = true)
    public StoreDetailDTO getStoreDetail(int storeNo) {
        log.info("Getting store detail with storeNo: {}", storeNo);

        // 매장 조회
        StoreDTO store = StoreDTO.fromEntity(findStoreByStoreNo(storeNo));

        // 공지사항 조회
        List<AnnouncementDTO> announcements = announcementService.getAllAnnouncementsByStoreNo(storeNo);

        // 판매 제품 조회
        List<StoreItemDTO> storeItems = storeItemService.findAllStoreItems(storeNo);

        return new StoreDetailDTO(store, announcements, storeItems);
    }

    /**
     * 플리마켓 상태 수정
     * - 플리마켓 비허용 -> 허용 : 플리마켓 사진, 섹션 개수 수정
     * - 플리마켓 허용 -> 비허용 : 사진, 개수 초기화
     * @param dto 플리마켓 정보
     */
    @Transactional
    public void modifyFlimarketState(FlimarketModifyDTO dto){
        log.info("Modifying flimarket state {}", dto);
        Store store = findStoreByEmail(dto.getUserEmail());
        store.modifyFlimarketState(dto);
        log.info("Flimarket state {} has been modified successfully", store);
    }

    /**
     * 매장 번호로 매장 찾기
     * @param storeNo 매장 번호
     * @return Store
     */
    @Transactional(readOnly = true)
    public Store findStoreByStoreNo(int storeNo) {
        return storeRepository.findById(storeNo)
                .orElseThrow(() -> new StoreNotFoundException(storeNo));
    }

    /**
     * 공지사항 작성
     * @param announcementWriteDTO 등록할 공지사항 데이터
     */
    public void writeAnnouncement(AnnouncementWriteDTO announcementWriteDTO) {
        log.info("Writing announcement {}", announcementWriteDTO);
        // 매장 유효성 검사
        Store store = findStoreByEmail(announcementWriteDTO.getUserEmail());
        // 공지사항 작성
        Announcement announcement = announcementWriteDTO.toEntity(store);
        log.debug("Converted announcementWriteDTO to Announcement entity: {}", announcement);

        announcementService.saveAnnouncement(announcement);
    }

    /**
     * 매장 공지 사항 수정
     * 수정은 로그인한 사장님이 -> storeNo 대신 user-email로
     * @param dto 수정 내용
     */
    @Transactional
    public void modifyAnnouncement(AnnouncementModifyDTO dto) {
        log.info("Modifying announcement {}", dto);
        // 공지 사항 조회
        Announcement announcement = getAnnouncement(dto.getUserEmail(), dto.getBoardId());
        // 공지 사항 수정
        announcement.updateAnnouncement(dto);
        log.info("Announcement {} has been updated successfully", announcement);
    }

    /**
     * 공지 사항 삭제
     * 수정은 로그인한 사장님이 -> storeNo 대신 user-email로
     * @param dto 삭제할 공지 사항 정보
     */
    @Transactional
    public void removeAnnouncement(AnnouncementDeleteDTO dto) {
        log.info("Deleting announcement {}", dto);
        Announcement announcement = getAnnouncement(dto.getUserEmail(), dto.getBoardId());
        announcementService.removeAnnouncement(announcement);
    }

    /**
     * 이메일로 store 찾기
     * @param userEmail 점주 이메일
     * @return Store 매장
     * - 점주가 아니면 store 에 접근할 수 있는 권한이 없음
     */
    @Transactional(readOnly = true)
    public Store findStoreByEmail(String userEmail){
        return storeRepository.findByUser_Email(userEmail)
                .orElseThrow(() -> new StoreNotForbiddenException(userEmail));
    }

    /**
     * 공지 사항 받아오기
     * @param userEmail 이메일
     * @param boardId 공지 번호
     * @return Announcement
     */
    private Announcement getAnnouncement(String userEmail, int boardId) {
        return announcementService.findAnnouncementByUserEmailAndBoardId(userEmail, boardId);
    }
}
