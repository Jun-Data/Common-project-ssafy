import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import StoreDetailbar from "../../components/StoreDetailBar";
import StoreDetailApi from "../../api/StoreDetailApi";
import "./style.css";

const StoreDetail = () => {
    const [productData, setProductData] = useState(null); // API 데이터를 저장할 상태
    const [activeTab, setActiveTab] = useState("storeItems"); // 활성화된 탭 상태

    const handleTabClick = (tab) => {
        setActiveTab(tab); // 활성화된 탭 업데이트
    };

    const navigate = useNavigate();

    const navigateRequestPage = () => {
        const storeNo = 2
        navigate(`/storedetail/${storeNo}/request`);
    };

    const navigateFlearequest = () => {
        const storeNo = 2
        navigate(`/storeDetail/${storeNo}/flearequest`);
    }

    useEffect(() => {
        // setProductData를 StoreDetailApi에 전달
        StoreDetailApi(setProductData);
    }, []); // 빈 배열을 의존성으로 전달하여 한 번만 실행되도록 설정


    return (
        <div className="searchpagedom">
            <div className="storedetailheadercontainer"><HeaderContainer /></div>
            <div className="storedetailphotoinfo">
                <div className="market-image">
                    <img src={productData?.store?.storeImageUrl} alt="StoreImage" />
                </div>
                <div className="market-detail">
                    <div className="market-name">{productData?.store.name}</div>
                    <div className="market-location">{productData?.store.address}</div>
                    <div className="storedetail-btnlist">
                    <button className="requestbtn"
                            onClick={navigateRequestPage}>제품 입고요청</button>
                    <button className="flearequestbtn"
                            onClick={navigateFlearequest}>플리마켓 신청</button>
                    </div>
                </div>
            </div>
            <div className="storedetailnavbar">
                <StoreDetailbar onTabClick={handleTabClick} />
            </div>
            <div className="storedetailmarketinfo">
                {/* 조건부 렌더링 */}
                {activeTab === "storeItems" && (
                    <ul className="storedetailul">
                        {productData?.storeItems?.map((storeItem) => (
                            <li key={storeItem.itemId} className="storedetailmarketli">
                                <img src={storeItem.itemImageUrl} alt="storedetailitemimage" className='storedetailitemimage'/>
                                {storeItem.itemName}
                                {storeItem.finalPrice}
                            </li>
                        ))}
                    </ul>
                )}
                {activeTab === "fliItems" && (
                    <div>
                        <ul className="storedetailul">
                            {productData?.fliItems?.map((fliItem) => (
                                <li key={fliItem.fliItemId} className="storedetailmarketli">
                                    <img src={fliItem.imagePath} alt="storedetailitemimage" />
                                    {fliItem.fliItemName}
                                    {fliItem.Price}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {activeTab === "announcements" && (
                    <div>
                        <ul className="storedetailul">
                            {productData?.announcements?.map((announcement) => (
                                <li key={announcement.boardId} className="storedetailmarketli">
                                    {announcement.title}
                                    {announcement.createdAt}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreDetail;
