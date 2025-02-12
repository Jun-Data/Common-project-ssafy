import { faBell, faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth"; // useAuth 훅 가져오기
import "./HeaderContainer.css";

function HeaderContainer() {
    const locationNow = useLocation();
    const navigate = useNavigate();
    const { logindata } = useAuth(); //로그인 정보 가져오기
    const [showDropdown, setShowDropdown] = useState(false);

    const handleConnectBell = () => {
        setShowDropdown(!showDropdown);
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
                <Link to="/mypage/user/chats">채팅목록</Link>
                <Link to="/mypage/user/coupons">쿠폰함</Link>
            </>
            );
        } else {
            return (
                <Link to="https://i12a506.p.ssafy.io/api/users/login">회원가입</Link>
            );
        }
    };

    return (
        <header className="header">
            <Link to="/" className="link">
                <img src="/logo.png" alt="Muin Logo" className="logo" />
            </Link>

            <div className="icons">
                <div className="link" onClick={handleConnectBell}>
                    <div className="bell">
                        <FontAwesomeIcon
                            icon={faBell}
                            className={locationNow.pathname === "/notifications" ? "bell-icon active-bell-icon" : "bell"}
                        />
                    </div>
                </div>

                <div className="login">
                    {logindata ? (
                        // 로그인된 유저: faUser 아이콘 + 클릭 시 마이페이지 이동
                        <FontAwesomeIcon icon={faUser} className="login-icon" onClick={handleNavigateToMyPage} />
                    ) : (
                        // 로그인되지 않은 유저: faRightToBracket 아이콘 + 로그인 페이지 이동
                        <Link to="https://i12a506.p.ssafy.io/api/users/login">
                            <FontAwesomeIcon icon={faRightToBracket} className="login-icon" />
                        </Link>
                    )}
                </div>
            </div>

            {/* 드롭다운 메뉴 */}
            {showDropdown && (
                <div className="dropdown">
                {renderDropdownMenu()}
                <button className="logout">로그아웃</button>
            </div>
            )}
        </header>
    );
}

export default HeaderContainer;
