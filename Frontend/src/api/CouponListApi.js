import apiClient from "./apiClient";

const CouponListApi = async (nStoreNo) => {
    try {
        const response = await apiClient.get(`/api/coupon/store/list`, {
            params: {
                storeNo: nStoreNo,
            }
        });

        if (response.status === 200) {
            return response.data;
        }
        console.error(response.message || "데이터 요청 실패");
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export default CouponListApi;

