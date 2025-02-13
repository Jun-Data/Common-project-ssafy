import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import StoreDetailbar from "../../components/StoreDetailBar";
import StoreDetailApi from "../../api/StoreDetailApi";
import "./style.css";

const StoreDetail = () => {
    const [productData, setProductData] = useState(null); // API 데이터를 저장할 상태
    const [activeTab, setActiveTab] = useState("storeItems"); // 활성화된 탭 상태
    const [selectedItem, setSelectedItem] = useState(null); // 선택된 아이템 데이터
    const [selectedType, setSelectedType] = useState(""); // 선택된 아이템 타입
    const { storeNo } = useParams();

    const handleTabClick = (tab) => {
        setActiveTab(tab); // 활성화된 탭 업데이트
    };

    const navigate = useNavigate();

    const navigateRequestPage = () => {
        navigate(`/storedetail/${storeNo}/request`);
    };

    const navigateFlearequest = () => {
        navigate(`/storeDetail/${storeNo}/flearequest`);
    };

    const handleItemClick = (item, type) => {
        setSelectedItem(item); // 선택된 아이템 데이터 저장
        setSelectedType(type); // 선택된 타입 저장 (store, fli, announcement)
    };

    const closePopup = () => {
        setSelectedItem(null); // 팝업 닫기
        setSelectedType("");
    };

    // 날짜 형식 변환 함수
    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" }; // 예시: "2025년 2월 6일"
        return new Date(dateString).toLocaleDateString("ko-KR", options);
    };

    useEffect(() => {
        // API 호출 및 데이터 설정
        StoreDetailApi(storeNo, setProductData);
    }, []); // 빈 배열을 의존성으로 전달하여 한 번만 실행되도록 설정

    return (
        <div className="searchpagedom">
            <div className="storedetailheadercontainer"><HeaderContainer /></div>
            <div className="storedetailphotoinfo">
                <div className="market-image">
                    <img src={productData?.store?.storeImageUrl} alt="StoreImage" />
                </div>
                <div className="market-detail">
                    <div className="market-name">이름 테스트 {productData?.store.name}</div>
                    <div className="market-location">주소주소 {productData?.store.address}</div>
                    <div className="storedetail-btnlist">
                        <button className="requestbtn" onClick={navigateRequestPage}>제품<br />입고요청</button>
                        <button className="flearequestbtn" onClick={navigateFlearequest}>플리마켓<br />신청하기</button>
                    </div>
                </div>
            </div>
            <div className="storedetailnavbar">
                <StoreDetailbar onTabClick={handleTabClick} />
            </div>

            {/* 리스트 렌더링 */}
            <div className="storedetailmarketinfo">
                {activeTab === "storeItems" && (
                    <ul className="storedetailul">
                        {productData?.storeItems?.map((storeItem) => (
                            <li
                                key={storeItem.itemId}
                                className="storedetailmarketli"
                                onClick={() => handleItemClick(storeItem, "store")}
                            >
                                <img src={storeItem.itemImageUrl} alt="storedetailitemimage" className='storedetailitemimage' />
                                <div className="item-info">
                                    <span>{storeItem.itemName}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {activeTab === "fliItems" && (
                    <ul className="storedetailul">
                        {productData?.fliItems?.map((fliItem) => (
                            <li
                                key={fliItem.fliItemId}
                                className="storedetailmarketli"
                                onClick={() => handleItemClick(fliItem, "fli")}
                            >
                                <img src={fliItem.imagePath} alt="storedetailitemimage" />
                                <div className="item-info">
                                    <span>{fliItem.fliItemName}</span>
                                    <span>{fliItem.price}원</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {activeTab === "announcements" && (
                    <ul className="storedetailul">
                        {productData?.announcements?.map((announcement) => (
                            <li
                                key={announcement.boardId}
                                className="storedetailmarketli announcement"
                                onClick={() => handleItemClick(announcement, "announcement")}
                            >
                                <div className="item-info">
                                    <span>제목테스트{announcement.title}</span>
                                    <span>{formatDate(announcement.createdAt)}</span> {/* 날짜 변환 적용 */}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 팝업 */}
            {selectedItem && (
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        {selectedType === "store" && (
                            <>
                                <h3>{selectedItem.itemName}</h3>
                                <p>가격: {selectedItem.finalPrice}원</p>
                                <p>수량: {selectedItem.quantity}</p>
                            </>
                        )}
                        {selectedType === "fli" && (
                            <>
                                <h3>{selectedItem.fliItemName}</h3>
                                <p>가격: {selectedItem.price}원</p>
                                <p>수량: {selectedItem.quantity}</p>
                            </>
                        )}
                        {selectedType === "announcement" && (
                            <>
                                <h3>제목테스트{selectedItem.title}</h3>
                                <p>난너를믿은만큼난내친구도믿었기에{selectedItem.content}</p>
                                <p>작성일: {formatDate(selectedItem.createdAt)}</p> {/* 날짜 변환 적용 */}
                            </>
                        )}
                        <button onClick={closePopup}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreDetail;
