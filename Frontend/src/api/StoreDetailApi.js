import apiClient from "./apiClient";

const StoreDetailApi = async (setProductdata) => {
    try {
        const storeNo = 2;

        const response = await apiClient.get('api/store/detail', {
            params: { storeNo },
        });

        const product = response.data;

        if (response.status === 200) {
            setProductdata(product); // 가져온 데이터를 setProductData로 전달
        } else {
            console.error('API 요청 실패:', product.message || '알 수 없는 오류');
            alert('API 호출 실패!');
        }
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);

        if (error.response && error.response.data) {
            alert(`API 호출 중 오류가 발생했습니다: ${error.response.data.message}`);
        } else {
            alert('API 호출 중 알 수 없는 오류가 발생했습니다.');
        }
    }
};

export default StoreDetailApi;