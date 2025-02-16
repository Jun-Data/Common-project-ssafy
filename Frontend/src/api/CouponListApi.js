import apiClient from "./apiClient";

const CouponListApi = async (storeNo) => {
    try {
        const response = await apiClient.get(`/api/coupon/store/list?storeNo=${storeNo}`);

        if (response.status === 200) {
            return response.data;
        }
        throw new Error(response.message || "데이터 요청 실패");
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export default CouponListApi;

