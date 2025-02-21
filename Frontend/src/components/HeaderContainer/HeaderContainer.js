import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth"; // useAuth 훅 가져오기
import axios from "axios";
import Swal from "sweetalert2";
import "./HeaderContainer.css";

function HeaderContainer() {
  const url = encodeURI(window.location.href);
  const navigate = useNavigate();
  const { logindata, isLoading } = useAuth(); //로그인 정보 가져오기
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleDropdown = (event) => {
    event.stopPropagation();
    setShowDropdown((prev) => !prev);
  };
  

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API_URL}/api/users/logout`
      );
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "로그아웃 완료",
          text: "로그아웃 되었습니다.",
        }).then(() => {
          window.location.href = "https://i12a506.p.ssafy.io";
        });
      } else {
        alert("로그아웃 실패! 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("로그아웃 요청 중 오류 발생:", error);
      alert("서버 오류로 로그아웃에 실패했습니다.");
    }
  };

  // userType에 따라 마이페이지 이동 경로 설정
  const handleNavigateToMyPage = () => {
    if (logindata?.userType === "A") {
      navigate("/mypage/admin/flea");
    } else if (logindata?.userType === "U") {
      navigate("/mypage/user/coupons");
    }
  };

  const renderDropdownMenu = () => {
    if (logindata?.userType === "A") {
      return (
        <>
          <p className="welcome-text" onClick={handleNavigateToMyPage}>
            {logindata ? (
              <>
                <strong>{logindata.userName}</strong>님 환영합니다!
              </>
            ) : (
              "환영합니다."
            )}
          </p>
          <Link to="/mypage/admin/flea">플리마켓</Link>
          <Link to="/mypage/admin/stock">입고</Link>
          <Link to="/mypage/admin/coupon">쿠폰</Link>
          <Link to="/mypage/admin/notice">공지사항</Link>
        </>
      );
    } else if (logindata?.userType === "U") {
      return (
        <>
          <p className="welcome-text" onClick={handleNavigateToMyPage}>
            {logindata ? (
              <>
                <strong>{logindata.userName}</strong>님 환영합니다!
              </>
            ) : (
              "환영합니다."
            )}
          </p>
          <Link to="/mypage/user/coupons">쿠폰함</Link>
        </>
      );
    } else {
      return (
        <Link to={`https://i12a506.p.ssafy.io/api/users/login?redirect=${url}`}>
          회원가입
        </Link>
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".login-icon") &&// faUser 아이콘 클릭 예외 처리
        !event.target.closest(".user-icon") // user 추가
      ) {
        setShowDropdown(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  


  return (
    <header className="header">
      <Link to="/" className="link">
        <img src="/logo.png" alt="Muin Logo" className="logo" />
      </Link>

      <div className="icons">

        <div className="login">
          {isLoading ? ( // 로그인 정보 로딩 중이면 아무것도 렌더링하지 않음
            <></>
          ) : logindata ? (
            <img src="/user.png" alt="User Icon" className="user-icon"
            onClick={handleDropdown}
            />
          ) : (
            <a href={`https://i12a506.p.ssafy.io/api/users/login?redirect=${url}`}>
              <img src="/login.png" alt="Login Icon" className="login-icon"/>
            </a>
          )}
        </div>
      </div>

      {/* 드롭다운 메뉴 */}
      {showDropdown && (
        <div className="dropdown" ref={dropdownRef}> 
          {renderDropdownMenu()}
          <button className="logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
}

export default HeaderContainer;
