import axios from "axios";

const SearchApi = async (searchQuery) => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    try {
        const response = await axios.get(`${apiUrl}/api/items/autocomplete`, {
            params: { prefix: searchQuery }, // 쿼리 파라미터 전달
        });
        return response.data; // API 결과 반환
    } catch (error) {
        console.error("검색 오류:", error);
        throw error; // 에러를 상위로 전달
    }
};

export default SearchApi;