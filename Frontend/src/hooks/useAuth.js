import { useState, useEffect } from "react";
import axios from "axios";

function useAuth() {
    const [logindata, setLogindata] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/users/info`, {
                    withCredentials: true, // 쿠키 포함
                });

                if (response.status === 200) {
                    setLogindata(response.data); // 로그인된 사용자 정보 저장
                } else {
                    setLogindata(null); // 로그인되지 않은 상태
                }
            } catch (error) {
                console.error("로그인 상태 확인 오류:", error);
                setLogindata(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, []);

    return { logindata, isLoading };
}

export default useAuth;
