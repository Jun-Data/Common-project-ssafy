import axios from 'axios';

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

const resultBottomSheetApi = async ({ coords, itemId, receivedData }) => {
    try {
        // API 호출
        const response = await axios.get(`${apiUrl}/api/items/store-items`, {
            params: { lat: coords.lat,
                      lon: coords.lng,
                      itemId: itemId,
                      },
        });

        const resultnearStorelist = response.data;

        if (response.status === 200) {
            receivedData(resultnearStorelist); // 데이터를 부모 컴포넌트로 전달
        } else {
            console.error('API 요청 실패:');
        }
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('요청이 취소되었습니다:', error.message);
        } else if (error.response) {
            console.error('API 호출 중 오류 발생:', error.response.data);
        } else if (error.request) {
            console.error('응답을 받지 못했습니다:', error.request);
        } else {
            console.error('요청 설정 중 오류 발생:', error.message);
        }

    }
};

export default resultBottomSheetApi
