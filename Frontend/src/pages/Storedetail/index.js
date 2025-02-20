import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import StoreDetailbar from "../../components/StoreDetailBar";
import StoreDetailApi from "../../api/StoreDetailApi";
import CouponGetApi from "../../api/CouponGetApi";
import CouponListApi from "../../api/CouponListApi";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/Button";
import "./style.css";
import Swal from "sweetalert2";

const StoreDetail = () => {
  const [productData, setProductData] = useState(null);
  const [activeTab, setActiveTab] = useState("storeItems");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [couponList, setCouponList] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const { storeNo } = useParams();
  const nStoreNo = Number(storeNo);
  const navigate = useNavigate();
  const { logindata } = useAuth();
  const url = encodeURI(window.location.href);

  // 상태 관리 함수들
  const handleTabClick = (tab) => setActiveTab(tab);
  const handleItemClick = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
  };

  // 로그인 확인 함수
  const checkLogin = () => {
    console.log("로그인체크중");
    if (!logindata) {
      Swal.fire({
        icon: "error",
        title: "오류 발생!",
        text: "로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다",
      }).then(() => {
        window.location.href = `https://i12a506.p.ssafy.io/api/users/login?redirect=${url}`;
      });
      return false;
    }
    return true;
  };

  // 쿠폰 처리 핸들러
  const handleCouponListGet = async (nStoreNo) => {
    try {
      const coupons = await CouponListApi(nStoreNo);
      if (!coupons || coupons.length === 0) {
        // alert("사용 가능한 쿠폰이 없습니다");
        Swal.fire({
          icon: "error",
          title: "오류 발생!",
          text: "사용 가능한 쿠폰이 없습니다",
        })

        return;
      }
      setCouponList(coupons);
      setShowCouponPopup(true);
    } catch (error) {
      console.error("쿠폰 처리 실패:", error);
      alert("쿠폰 조회 중 오류가 발생했습니다");
    }
  };

  const handleCouponReceive = async (coupon) => {
    try {
      const result = await CouponGetApi(nStoreNo, coupon.couponId);

      if (!result?.isError) {
        // alert("쿠폰이 성공적으로 발급되었습니다");
        Swal.fire({
          icon: 'success',
          title: '성공!',
          text: '쿠폰이 성공적으로 발급되었습니다!',
        });  
  
        // 쿠폰 리스트 갱신
        const updatedList = couponList.filter(
          (c) => c.couponId !== coupon.couponId
        );
        setCouponList(updatedList);
        setSelectedCoupon(null);
      }
    } catch (error) {
      console.error("쿠폰 수령 실패:", error);
    }
  };

  // 페이지 이동 함수들
  const navigateRequestPage = (storeNo) =>
    navigate(`/storedetail/${storeNo}/request`);
  const navigateFlearequest = (storeNo) =>
    navigate(`/storeDetail/${storeNo}/flearequest`);
  const navigateToVideoCall = (storeNo) => navigate(`/${storeNo}/videocall`);

  // 팝업 닫기 함수
  const closePopup = () => {
    setSelectedItem(null);
    setSelectedType("");
    setShowCouponPopup(false);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ko-KR", options);
  };

  useEffect(() => {
    StoreDetailApi(storeNo, setProductData);
  }, []);

  return (
    <div className="searchpagedom">
      <div className="storedetailheadercontainer">
        <HeaderContainer />
      </div>

      {/* 상점 이미지 및 정보 섹션 */}
      <div className="storedetailphotoinfo">
        <div className="market-image">
          {productData?.store?.storeImageUrl ? (
            <img
              src={productData.store.storeImageUrl}
              alt="StoreImage"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="image-fallback">등록된 이미지가 없습니다.</div>
          )}
        </div>
        <div className="market-detail">
          <div className="market-name">{productData?.store.name}</div>
          <div className="market-location">{productData?.store.address}</div>
        </div>
      </div>

      {/* 액션 버튼 그룹 */}
      <div className="storedetail-btnlist">
        <button
          className="couponrequestbtn"
          onClick={() => checkLogin() && handleCouponListGet(nStoreNo)}
        >
          쿠폰수령
        </button>
        <button
          className="requestbtn"
          onClick={() => checkLogin() && navigateRequestPage(nStoreNo)}
        >
          입고요청
        </button>
        <button
          className="flearequestbtn"
          onClick={() => checkLogin() && navigateFlearequest(nStoreNo)}
        >
          플리신청
        </button>
        <button
          className="videocallbtn"
          onClick={() => checkLogin() && navigateToVideoCall(nStoreNo)}
        >
          화상통화
        </button>
      </div>

      {/* 네비게이션 바 */}
      <div className="storedetailnavbar">
        <StoreDetailbar onTabClick={handleTabClick} />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="storedetailmarketinfo">
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
                  <div className="item-info">{storeItem.itemName}</div>
                  <div className="price-info">{storeItem.salePrice}원</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-items">등록된 상품이 없습니다</div>
          ))}

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
                    onError={(e) => (e.target.src = "/logo.png")}
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
                    onError={(e) => (e.target.src = "/logo.png")}
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
          <div
            className="popup-content"
            style={
              selectedType === "store"
                ? {
                    width: "300px",
                    height: "330px",
                    padding: "12px",
                  }
                : {}
            }
            onClick={(e) => e.stopPropagation()}
          >
            {selectedType === "store" && (
              <>
                <h3 className="store-item-title">{selectedItem.itemName}</h3>
                <img
                  src={selectedItem.itemImageUrl || "/logo.png"}
                  alt={selectedItem.itemName || "상품 이미지"}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "2px solid #dbe2ef",
                  }}
                  onError={(e) => (e.target.src = "/logo.png")}
                />
                <div>
                  <p className="store-item-price">
                    💰 가격 : <strong>{selectedItem.finalPrice}원</strong>
                  </p>
                  <p className="store-item-quantity">
                    📦 수량 : <strong>{selectedItem.quantity}</strong>
                  </p>
                </div>
                <Button type="SECONDARY" onClick={closePopup}>
                  {" "}
                  닫기
                </Button>
              </>
            )}

            {selectedType === "fli" && (
              <>
                <h2 className="fliitem-title">{selectedItem.fliItemName}</h2>
                <img
                  src={selectedItem.imagePath || "/logo.png"}
                  alt={selectedItem.fliItemName || "상품 이미지"}
                  className="fliitemdetailimage"
                  style={{
                    width: "300px",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "2px solid #ddd",
                  }}
                  onError={(e) => (e.target.src = "/logo.png")}
                />
                <div className="fliitem-info">
                  <h3 className="fliitem-price">
                    💰 가격 : <strong>{selectedItem.price}원</strong>
                  </h3>
                  <h3 className="fliitem-quantity">
                    📦 수량 : <strong>{selectedItem.quantity}</strong>
                  </h3>
                  <br />
                </div>
                <Button type="SECONDARY" onClick={closePopup}>
                  {" "}
                  닫기
                </Button>
              </>
            )}

            {selectedType === "announcement" && (
              <>
                <h1 className="announcement-title">{selectedItem.title}</h1>
                <p className="announcement-date">
                  작성일: {formatDate(selectedItem.createdAt)}
                </p>
                <p className="announcement-content">{selectedItem.content}</p>
                <img
                  src={selectedItem.boardImageUrl || "/logo.png"}
                  className="announcementdetailimage"
                  style={{
                    width: "250px",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "2px solid #ddd",
                    marginBottom: "20px",
                  }}
                  onError={(e) => (e.target.src = "/logo.png")}
                />
                <Button type="SECONDARY" onClick={closePopup}>
                  {" "}
                  닫기
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      {showCouponPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowCouponPopup(false)}
        >
          <div
            className="coupon-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="coupon-popup-title">🎁 보유 가능 쿠폰</h2>
            <div className="coupon-list-container">
              {couponList.map((coupon) => (
                <div
                  key={coupon.couponId}
                  className="coupon-item"
                  onClick={() => handleCouponReceive(coupon)}
                >
                  <div className="coupon-info">
                    <span className="coupon-name">
                      {coupon.discountRate}% 할인쿠폰
                    </span>
                  </div>
                  <span className="coupon-date">
                    {" "}
                    {formatDate(coupon.expirationDate)}
                  </span>
                </div>
              ))}
            </div>
            <Button
              type="SECONDARY"
              onClick={() => setShowCouponPopup(false)}
              style={{ marginTop: "15px" }}
            >
              닫기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetail;
