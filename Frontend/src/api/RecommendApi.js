import apiClient from "./apiClient";

const RecommendApi = async (userId) => {
    try {
        const response = await apiClient.get(`/api/recommend/user/${userId}`);
        if (response.status === 200) {
            console.log("API 호출 성공:", response.data);
            return response.data; // 추천 리스트 반환
        } else {
            console.error("API 요청 실패:", response.message || "알 수 없는 오류");
            throw new Error(response.message || "API 요청 실패");
        }
    } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
        throw error;
    }
};

export default RecommendApi;
