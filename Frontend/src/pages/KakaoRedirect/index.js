import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios"; // axios 추가

export function KakaoRedirect() {
  const navigate = useNavigate();
  const code = new URL(window.location.href).searchParams.get("code");
  console.log(code);

  useEffect(() => {
    // 코드가 없으면 리다이렉트
    if (!code) {
      navigate('/');  // 로그인 페이지로 리다이렉트
      return;
    }

    // 요청 보낼 URL
    const url = "https://i12a506.p.ssafy.io/api/users/login"; // 백엔드 API 주소

    // POST 요청을 보내기 위한 데이터
    const data = { code };

    // 요청을 보낼 headers (기본값)
    const headers = {
      "Content-Type": "application/json", // JSON 형식으로 데이터 전송
    };

    axios
      .post(url, data, { headers })
      .then((response) => {
        console.log(response.data);
        console.log(response.data.result.user_id);
        console.log(response.data.result.jwt);

        // 로그인 성공 후, 필요한 페이지로 리다이렉트
        navigate("/"); //홈으로 이동
      })
      .catch((error) => {
        console.error("오류 발생", error);
      });
  }, [code, navigate]); // code와 navigate가 변경되었을 때만 실행

  return (
    <div>
      <h1>로그인 중입니다...</h1>
    </div>
  );
}

export default KakaoRedirect;
