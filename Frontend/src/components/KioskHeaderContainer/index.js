import React, { useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import "./style.css";

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

const KioskHeaderContainer = () => {
  const url = "https://i12a506.p.ssafy.io/kiosk/main";
  const { logindata } = useAuth();

  useEffect(() => {
    const logout = async () => {
      if (logindata && logindata.usertype !== "A") {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_API_URL}/api/users/logout`
          );
          if (response.status === 200) {
            alert("로그아웃 되었습니다");
            window.location.href = "https://i12a506.p.ssafy.io";
          } else {
            alert("로그아웃 실패! 다시 시도해주세요.");
          }
        } catch (error) {
          console.error("로그아웃 요청 중 오류 발생:", error);
          alert("서버 오류로 로그아웃에 실패했습니다.");
        }
      }
    };

    logout();
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
