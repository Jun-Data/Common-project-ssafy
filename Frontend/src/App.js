import "./App.css";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import MainPage from "./pages/MainPage";
import Kiosk from "./pages/Kiosk";
import KioskMainScreen from "./pages/KioskMain";
import SignUp from "./pages/SignUpPage/SignUp";
import OwnerSignUp from "./pages/SignUpPage/OwnerSignUp";
import UserSignUp from "./pages/SignUpPage/UserSignUp";
import MyPage from "./pages/MyPage";
import Coupons from "./pages/Coupons";
import KakaoRedirect from "./pages/KakaoRedirect";
import SearchPage from "./pages/Search";
import StoreDetail from "./pages/Storedetail";
import MakeCoupons from "./pages/MakeCoupons";
import Notice from "./pages/Notice";
import StockRequests from "./pages/StockRequests";
import FleaRequests from "./pages/FleaRequests";
import SearchbyNurtrition from "./pages/SearchbyNurtrition";
import SearchResult from "./pages/SearchResult";
import StoredetailRequestPopup from "./pages/StoredetailRequest";
import StoreDetailFlearequest from "./pages/StoredetailFlearequest";
import VideoCall from "./pages/VideoCall";
import { KakaoMapProvider } from "./contexts/KakaoMapContext";

function App() {
  const location = useLocation();

  // 지도 페이지 판별 로직
  const isMapPage = ["/", "/search/results"].includes(location.pathname);

  // 뷰포트 높이 설정 (검색 결과[5] 참조)
  useEffect(() => {
    const setScreenSize = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setScreenSize();
    window.addEventListener("resize", setScreenSize);
    return () => window.removeEventListener("resize", setScreenSize);
  }, []);

  return (
    <div className="App">
      <div className="appcontainer">
        <div>
        <KakaoMapProvider>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/owner-signup" element={<OwnerSignUp />} />
            <Route path="/user-signup" element={<UserSignUp />} />
            <Route path="/mypage/user" element={<MyPage />} />
            <Route path="/mypage/user/coupons" element={<Coupons />} />
            <Route path="/mypage/admin" element={<MyPage />} />
            <Route path="/mypage/admin/flea" element={<FleaRequests />} />
            <Route path="/mypage/admin/stock" element={<StockRequests />} />
            <Route path="/mypage/admin/coupon" element={<MakeCoupons />} />
            <Route path="/mypage/admin/notice" element={<Notice />} />

            <Route path="/oauth/kakao" element={<KakaoRedirect />} />

            <Route path="/kiosk" element={<Kiosk />} />
            <Route path="/kiosk/:storeNo/main" element={<KioskMainScreen />} />

            <Route path="/" element={<MainPage />} />
            <Route
              path="/search/results"
              element={<SearchResult key={location.key} />}
            />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/storedetail/:storeNo" element={<StoreDetail />} />
            <Route
              path="/storedetail/:storeNo/request"
              element={<StoredetailRequestPopup />}
            />
            <Route
              path="/storedetail/:storeNo/flearequest"
              element={<StoreDetailFlearequest />}
            />
            <Route path="/searchbynutrition" element={<SearchbyNurtrition />} />
            <Route path="/:storeNo/videocall" element={<VideoCall />} />
          </Routes>
        </KakaoMapProvider>
      </div>
      <div
        id="map-root"
        className={`map-container ${isMapPage ? "visible" : "hidden"}`}
        style={{
          opacity: isMapPage ? 1 : 0,
          visibility: isMapPage ? "visible" : "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s ease",
        }}
      ></div>
      </div>
    </div>
  );
}

export default App;
