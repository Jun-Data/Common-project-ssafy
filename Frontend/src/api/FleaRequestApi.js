import apiClient from "./apiClient";

const FleaRequestApi = async (storeId, userAccount, userBank, accountName, itemName,
                            quantity, price, sectionNumber, StartDate, expireDate, imagePath) => {
    try {
        const response = await apiClient.post(`/api/fli/register`, {
            storeId : storeId,
            userAccount : userAccount,
            userBank : userBank,
            accountName : accountName,
            itemName: itemName,
            quantity : quantity,
            price: price,
            sectionNumber : sectionNumber,
            StartDate : StartDate, //2025-02-08T15:30:00
            expireDate : expireDate,
            imagePath : imagePath,
    });

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

export default FleaRequestApi;