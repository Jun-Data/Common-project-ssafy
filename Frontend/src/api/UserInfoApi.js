import axios from "axios";

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

const userInfoApi = async () => {
    try {

        const response = await axios.get(`${apiUrl}/api/users/info`);

        const userInfo = response.data;

        if (response.status === 200) {
            return userInfo;
        } else {
            console.error('API 요청 실패:', userInfo.message || '알 수 없는 오류');
            return null;
        }
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);

        if (error.response && error.response.data) {
            return null
        } else {
            return null
        }
    }
};

export default userInfoApi;