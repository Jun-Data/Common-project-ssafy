import apiClient from "./apiClient";

const RecommendApi = async (userNo) => {
    try {
        // ✅ 경로 파라미터 방식으로 변경
        const response = await apiClient.get(`/api/recommend/user/${userNo}?limit=5`);

        if (response.status === 200) {
            return response.data;
        }
        throw new Error(response.message || "추천 데이터 요청 실패");
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export default RecommendApi

