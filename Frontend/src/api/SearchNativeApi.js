import axios from "axios";

const SearchNativeApi = async( query ) => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    try {
        const response = await axios.get(`${apiUrl}/api/items/search-native?query=${query}`);
        return response.data

    } catch (err) {
        console.error('API 호출 중 오류 발생:', err);
    }
};

export default SearchNativeApi;