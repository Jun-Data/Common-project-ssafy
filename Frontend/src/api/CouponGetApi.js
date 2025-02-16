import apiClient from "./apiClient";

// 수정된 전체 코드
const CouponGetApi = async (nStoreNo, couponId) => {
    try {
        const response = await apiClient.post(`/api/coupon/receive`, {
            storeNo: nStoreNo,
            couponId: couponId,
        });

        if (response.status === 200) {
            alert('쿠폰 발급 성공!')
            return response.data // 실제 데이터 반환 추가
        }

        // 실패 처리 강화
        const errorMessage = response.data?.message || "쿠폰 발급 실패"
        alert(errorMessage)
        throw new Error(errorMessage)

    } catch (error) {
        alert(`오류 발생: ${error.message}`) // 사용자 피드백 추가
        throw error
    }
}


export default CouponGetApi;

