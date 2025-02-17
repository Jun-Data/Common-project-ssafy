import apiClient from "./apiClient";

const CouponGetApi = async (nStoreNo, couponId) => {
    try {
        const response = await apiClient.post(`/api/coupon/receive`, {
            storeNo: nStoreNo,
            couponId: couponId,
        });

        // 성공 케이스
        if (response.status === 200) {
            alert('쿠폰 발급 성공!')
            return response.data
        }

        // 에러 코드 확인
        const errorCode = response.data?.errorCode
        const errorMessage = response.data?.message || "쿠폰 발급 실패"

        // 40930: 이미 수령한 쿠폰
        if (errorCode) {
            alert(errorMessage) // 서버에서 받은 메시지 바로 표시
            return { isError: true, errorCode } // 추가 작업을 위한 정보 반환
        }

        // 기타 에러 처리
        alert(errorMessage)
        throw new Error(errorMessage)

    } catch (error) {
        // 네트워크 에러 등 예상치 못한 오류
        if (!error.response) {
            alert(`시스템 오류: ${error.message}`)
        }
        throw error
    }
}

export default CouponGetApi;