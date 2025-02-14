import React, { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import "./style.css";

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

const KioskHeaderContainer = () => {
  const url = "https://i12a506.p.ssafy.io/kiosk/main";
  const { logindata } = useAuth();

  useEffect(() => {
    if (logindata && logindata.usertype !== "A") {
      window.location.href = `${apiUrl}/api/users/logout`;
    }
  }, [logindata]);

  return (
    <div className="headercontainer">
      <div className="logo">
        <img src="/logo.png" alt="headercontainerimg" />
      </div>

      <div className="auth-section">
        {logindata ? (
          logindata.usertype === "A" ? (
            <a href={`${apiUrl}/api/users/logout`} className="logout-button">
              로그아웃
            </a>
          ) : (
            <div className="auth-message">
              <span className="permission-error">
                페이지 접근 권한이 없습니다 (자동 로그아웃)
              </span>
            </div>
          )
        ) : (
          <a
            href={`${apiUrl}/api/users/login?redirect=${url}`}
            className="login-button"
          >
            <button className="login-button">로그인</button>
          </a>
        )}
      </div>
    </div>
  );
};

export default KioskHeaderContainer;
