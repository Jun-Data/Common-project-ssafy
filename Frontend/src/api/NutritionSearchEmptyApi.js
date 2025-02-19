import axios from "axios";

const nutritionSearchEmptyApi = async(maxSugar, maxCal) => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    try {
        const response = await axios.get(`${apiUrl}/api/items/search`, {
            params: {
                minSugar: 0,
                maxSugar,
                minCal: 0,
                maxCal,
            },
        });
        return response.data

    } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
    }
};

export default nutritionSearchEmptyApi;