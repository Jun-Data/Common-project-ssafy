import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import StoreDetailbar from "../../components/StoreDetailBar";
import StoreDetailApi from "../../api/StoreDetailApi";
import CouponGetApi from "../../api/CouponGetApi";
import CouponListApi from "../../api/CouponListApi";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import Button from "../../components/Button";
import "./style.css";
import Swal from "sweetalert2";

const StoreDetail = () => {
  const [productData, setProductData] = useState(null); // API 데이터를 저장할 상태
  const [activeTab, setActiveTab] = useState("storeItems"); // 활성화된 탭 상태
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 아이템 데이터
  const [selectedType, setSelectedType] = useState(""); // 선택된 아이템 타입
  const { storeNo } = useParams();
  const nStoreNo = Number(storeNo);
  const navigate = useNavigate();
  const { logindata } = useAuth();
  const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

  const handleTabClick = (tab) => {
    setActiveTab(tab); // 활성화된 탭 업데이트
  };

  // 수정 필요
  const checkLogin = () => {
    if (!logindata) {
      // alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
      Swal.fire({
        icon: "error",
        title: "오류 발생!",
        text: "로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다",
    });
      axios.get(`${apiUrl}/api/users/login`, {});
      return false;
    }
    return true;
  };

  const handleCouponGet = async (nStoreNo) => {
    // if (!checkLogin()) return;

    try {
      const couponList = await CouponListApi(nStoreNo);
      if (!couponList || couponList.length === 0 || !couponList[0]?.couponId) {
        // alert("사용 가능한 쿠폰이 없습니다");
        Swal.fire({
          icon: "error",
          title: "오류 발생!",
          text: "사용 가능한 쿠폰이 없습니다",
      });
        return;
      }

      const couponId = couponList[0].couponId;
      const receivedCoupon = await CouponGetApi(nStoreNo, couponId); // 순서 변경
      return receivedCoupon;
    } catch (error) {
      console.error("쿠폰 처리 실패:", error);
    }
  };

  // 3. 페이지 이동 함수들
  const navigateRequestPage = () => {
    // if (!checkLogin()) return; // 로그인 체크
    navigate(`/storedetail/${storeNo}/request`);
  };

  const navigateFlearequest = () => {
    // if (!checkLogin()) return; // 로그인 체크
    navigate(`/storeDetail/${storeNo}/flearequest`);
  };

  const navigateToVideoCall = () => {
    navigate(`/${storeNo}/videocall`);
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

  console.log(productData)

  return (
    <div className="searchpagedom">
      <div className="storedetailheadercontainer">
        <HeaderContainer />
      </div>
      <div className="storedetailphotoinfo">
        <div className="market-image">
          {productData?.store?.storeImageUrl ? (
            <img
              src={productData.store.storeImageUrl}
              alt="StoreImage"
              onError={(e) => {
                e.target.style.display = "none"; // 이미지 숨기기
              }}
            />
          ) : (
            <div className="image-fallback">
              <span>
                등록된 이미지가
                <br /> 없습니다.
              </span>
            </div>
          )}
        </div>
        <div className="market-detail">
          <div className="market-name">{productData?.store.name}</div>
          <div className="market-location">{productData?.store.address}</div>
        </div>
      </div>
          <div className="storedetail-btnlist">
            <button className="couponrequestbtn" onClick={() => handleCouponGet(nStoreNo)}>쿠폰수령</button>
            <button className="requestbtn" onClick={navigateRequestPage}>입고요청</button>
            <button className="flearequestbtn" onClick={navigateFlearequest}>플리신청</button>
            <button className="videocallbtn" onClick={navigateToVideoCall}>화상통화</button>
        </div>
      <div className="storedetailnavbar">
        <StoreDetailbar onTabClick={handleTabClick} />
      </div>

      <div className="storedetailmarketinfo">
        {/* 상점 상품 탭 */}
        {activeTab === "storeItems" &&
          (productData?.storeItems?.length ? (
            <ul className="storedetailul">
              {productData.storeItems.map((storeItem) => (
                <li
                  key={storeItem.itemId}
                  className="storedetailmarketli"
                  onClick={() => handleItemClick(storeItem, "store")}
                >
                  <img
                    src={storeItem.itemImageUrl}
                    alt="상품 이미지"
                    className="storedetailitemimage"
                  />
                  <div className="item-info">
                    <span>{storeItem.itemName}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-items">등록된 상품이 없습니다</div>
          ))}

        {/* FLI 상품 탭 */}
        {activeTab === "fliItems" &&
          (productData?.fliItems?.length ? (
            <ul className="storedetailul">
              {productData.fliItems.map((fliItem) => (
                <li
                  key={fliItem.fliItemId}
                  className="storedetailmarketli"
                  onClick={() => handleItemClick(fliItem, "fli")}
                >
                  <img
                    src={fliItem.imagePath || "/logo.png"}
                    className="storedetailitemimage"
                    onError={(e) => {
                      e.target.src = "/logo.png";
                    }}
                  />
                  <div className="item-info">
                    <span>{fliItem.fliItemName}</span>
                    <span>{fliItem.price.toLocaleString()}원</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-items">플리마켓 상품이 존재하지 않습니다.</div>
          ))}

        {/* 공지사항 탭 */}
        {activeTab === "announcements" &&
          (productData?.announcements?.length ? (
            <ul className="storedetailul">
              {productData.announcements.map((announcement) => (
                <li
                  key={announcement.boardId}
                  className="storedetailmarketli"
                  onClick={() => handleItemClick(announcement, "announcement")}
                >
                  <img
                      src={announcement.boardImageUrl || "/logo.png"}
                      className="storedetailitemimage"
                      onError={(e) => {
                        e.target.src = "/logo.png";
                      }}
                  />
                  <div className="item-info">
                    <span>{announcement.title}</span>
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-items">등록된 공지사항이 없습니다</div>
          ))}
      </div>

      {/* 팝업 */}
      {selectedItem && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" style={selectedType === "store" ? { width: "300px", height: "300px", padding: "15px" } : {}} onClick={(e) => e.stopPropagation()}>
            {selectedType === "store" && (
              <>
                <h3 className="store-item-title">{selectedItem.itemName}</h3>
                <img
                  src={selectedItem.itemImageUrl || "/logo.png"}
                  alt={selectedItem.itemName || "상품 이미지"}
                  style={{width:"100px", height:"100px", objectFit:"cover" , borderRadius: "10px", border: "2px solid #dbe2ef"}}
                  onError={(e) => {
                    e.target.src = "/logo.png";
                  }}
                />                
                <div>
                  <p className="store-item-price">💰 가격 :  <strong>{selectedItem.finalPrice}원</strong></p>
                  <p className="store-item-quantity">📦 수량 :  <strong>{selectedItem.quantity}</strong></p>
                </div>
              </>
            )}
            {selectedType === "fli" && (
              <>
                <h2 className="fliitem-title">{selectedItem.fliItemName}</h2>
                <img
                  src={selectedItem.imagePath || "/logo.png"}
                  alt={selectedItem.fliItemName || "상품 이미지"}
                  className="fliitemdetailimage"
                  style={{width:"300px", height:"300px", objectFit:"cover" , borderRadius: "10px", border: "2px solid #ddd"}}
                  onError={(e) => {
                    e.target.src = "/logo.png";
                  }}
                />
                <div className="fliitem-info">
                  <h3 className="fliitem-price">💰 가격 : <strong>{selectedItem.price}원</strong></h3>
                  <h3 className="fliitem-quantity">📦 수량 : <strong>{selectedItem.quantity}</strong></h3>
                  <br />
                </div>
              </>
            )}
            {selectedType === "announcement" && (
              <>
                <h1 className="announcement-title">{selectedItem.title}</h1>
                <p className="announcement-date">작성일 : {formatDate(selectedItem.createdAt)}</p>{" "}
                {/* 날짜 변환 적용 */}
                <p className="announcement-content">{selectedItem.content}</p>
                <img
                    src={selectedItem.boardImageUrl || "/logo.png"}
                    className="announcementdetailimage"
                    style={{width:"250px", height:"250px", objectFit:"cover" , borderRadius: "10px", border: "2px solid #ddd", marginBottom:"20px"}}
                    onError={(e) => {
                      e.target.src = "/logo.png";
                    }}
                />
              </>
            )}
            <Button type="SECONDARY" onClick={closePopup}>닫기</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetail;
