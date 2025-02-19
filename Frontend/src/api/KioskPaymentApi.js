import apiClient from "./apiClient";

const KioskPaymentApi = async (requestData) => {
    try {
        const response = await apiClient.post(`/api/kiosk/payment`, requestData);
        if (response.status === 200) return response.data;
        console.error(response.message || "데이터 요청 실패");
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export default KioskPaymentApi;

