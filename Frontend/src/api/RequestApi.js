import apiClient from "./apiClient";

const RequestApi = async ({ storeId, itemId }) => {
    try {
        const response = await apiClient.post(`/api/item/register`, {
            storeId: storeId,
            itemId: itemId,
        });
        console.log(response)
        if (response.status >= 200 && response.status < 300) {
            console.log("API 호출 성공:", response.data);
            return response.data;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
        console.error("API 호출 오류:", error.response?.data || error.message);
        throw error;
    }   
};

export default RequestApi;