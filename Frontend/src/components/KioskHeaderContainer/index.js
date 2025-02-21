import { useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import "./style.css";
import Swal from "sweetalert2";

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

const KioskHeaderContainer = () => {

  const { logindata } = useAuth();

  useEffect(() => {
// 로그인했지만 권한이 없는 userType 일 경우, 자동 로그아웃 처리
    if (logindata && logindata.userType !== "A") {
      const logout = async () => {
        try {
          const response = await axios.get(`${apiUrl}/api/users/logout`);
          if (response.status === 200) {
            // alert("권한이 없습니다. 로그아웃합니다.");
            Swal.fire({
              icon: "error",
              title: "오류 발생!",
              text: "권한이 없습니다. 로그아웃합니다.",
          });
            window.location.href = "https://i12a506.p.ssafy.io";
          } else {
            alert("로그아웃 실패! 다시 시도해주세요.");
          }
        } catch (error) {
          console.error("로그아웃 요청 중 오류 발생:", error);
          alert("서버 오류로 로그아웃에 실패했습니다.");
        }
      };
      logout();
    }
  }, [logindata]);

  return (
      <div className="headercontainer">
        <div className="logo">
          <img src="/logo.png" alt="headercontainerimg" />
        </div>
        <div className="auth-section">
          {logindata ? (
              // 로그인되어 있다면 usertype에 따라 분기 처리
              logindata.userType === "A" ? (
                  <a href={`${apiUrl}/api/users/logout?redirect=${apiUrl}/kiosk`} className="logout-button">
                    <img src="/logout.png" />
                  </a>
              ) : (
                  <div className="auth-message">
          <span className="permission-error">
            페이지 접근 권한이 없습니다 (자동 로그아웃)
          </span>
                  </div>
              )
          ) : (
              // 아직 로그인이 안 되어 있다면 로그인 버튼 노출
              <a
                  href={`${apiUrl}/api/users/login?redirect=${apiUrl}`}
                  className="login-button"
              >
                <img src="/login.png" />
              </a>
          )}
        </div>
      </div>
  );
};

export default KioskHeaderContainer;