import apiClient from "./apiClient";

const CouponGetApi = async (storeNo, couponId) => {
    try {
        const response = await apiClient.get(`/api/coupon/receive`, {
            storeNo: storeNo,
            couponId: couponId,
        });

        if (response.status === 200) {
            return response.data;
        }
        throw new Error(response.message || "데이터 요청 실패");
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export default CouponGetApi;

