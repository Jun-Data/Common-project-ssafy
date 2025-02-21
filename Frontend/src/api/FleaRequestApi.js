import apiClient from "./apiClient";
import Swal from "sweetalert2";
const FleaRequestApi = async (formData) => {

    try {
        const response = await apiClient.post(`/api/fli/register`, formData);

        if (response.status >= 200 && response.status < 300) {
            Swal.fire({
                icon: 'success',
                title: '신청 성공',
                text: '플리마켓 신청이 완료되었습니다!',
                confirmButtonText: '확인',
            });
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