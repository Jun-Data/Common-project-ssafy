import axios from 'axios';

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

const apiClient = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
    withCredentials: true, // 쿠키 자동 포함
});

// Axios 인터셉터로 리프레시 토큰 처리
apiClient.interceptors.response.use(
    response => response, // 응답이 성공적일 경우 그대로 반환
    async (error) => {
        const originalRequest = error.config;

        // Access Token 만료 시 처리
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 무한 루프 방지

            try {
                // 리프레시 토큰으로 새 토큰 발급 요청
                await apiClient.post('/api/users/reissue');
                return apiClient(originalRequest); // 원래 요청 재시도
            } catch (refreshError) {
                console.error('리프레시 토큰 유효하지 않음:', refreshError);
                window.location.href = '/login'; // 로그아웃 처리
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
