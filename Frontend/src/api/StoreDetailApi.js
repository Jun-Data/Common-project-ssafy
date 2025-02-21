import axios from "axios";

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

const StoreDetailApi = async (storeNo, setProductdata) => {
    try {

        const response = await axios.get(`${apiUrl}/api/store/detail`, {
            params: { storeNo },
        });

        const product = response.data;

        if (response.status === 200) {
            setProductdata(product); // 가져온 데이터를 setProductData로 전달
        } else {
            console.error('API 요청 실패:', product.message || '알 수 없는 오류');
        }
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);

        if (error.response && error.response.data) {
            console.error(`${error.response.data.message}`);
        } else {
            console.error('API 호출 중 알 수 없는 오류가 발생했습니다.');
        }
    }
};

export default StoreDetailApi;