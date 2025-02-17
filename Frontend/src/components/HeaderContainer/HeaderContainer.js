import { faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      navigate("/mypage/admin");
    } else if (logindata?.userType === "U") {
      navigate("/mypage/user");
    }
  };

  const renderDropdownMenu = () => {
    if (logindata?.userType === "A") {
      return (
        <>
          <p className="welcome-text">
            {logindata ? `${logindata.userName}님 환영합니다.` : "환영합니다."}
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
            {logindata ? `${logindata.userName}님 환영합니다.` : "환영합니다."}
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
        !event.target.closest(".login-icon") // faUser 아이콘 클릭 예외 처리
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
        {/* <div className="link" onClick={handleDropdown}>
                    <div className="bell">
                        <FontAwesomeIcon
                            icon={faBell}
                            className={locationNow.pathname === "/notifications" ? "bell-icon active-bell-icon" : "bell"}
                        />
                    </div>
                </div> */}

        <div className="login">
          {isLoading ? ( // 로그인 정보 로딩 중이면 아무것도 렌더링하지 않음
            <></>
          ) : logindata ? (
            <FontAwesomeIcon
              icon={faUser}
              className="login-icon"
              onClick={handleDropdown}
            />
          ) : (
            <a href={`https://i12a506.p.ssafy.io/api/users/login?redirect=${url}`}>
              <FontAwesomeIcon icon={faRightToBracket} className="login-icon" />
            </a>
          )}
        </div>

        {/* <div className="login">
                    {isLoading ? null : logindata ? (
                        // 로그인된 유저: faUser 아이콘 + 클릭 시 마이페이지 이동
                        <FontAwesomeIcon icon={faUser} className="login-icon" onClick={handleDropdown} />
                    ) : (
                        // 로그인되지 않은 유저: faRightToBracket 아이콘 + 로그인 페이지 이동
                        <Link to="https://i12a506.p.ssafy.io/api/users/login">
                            <FontAwesomeIcon icon={faRightToBracket} className="login-icon" />
                        </Link>
                    )}
                </div> */}
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
