import { useState, useEffect } from "react";

const useGeolocation = () => {
    const [geoCoords, setGeoCoords] = useState({lat: 0, lng: 0}); // 기본 좌표
    const [error, setError] = useState(null); // 에러 상태 추가

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation을 지원하지 않는 브라우저입니다.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setGeoCoords({ lat: latitude, lng: longitude });
            },
            (error) => {
                console.error("Error getting location:", error);
            },
            {
                enableHighAccuracy: true, // 높은 정확도 요청
                timeout: 10000,          // 10초 내에 응답 없으면 중단
                maximumAge: 0            // 캐시된 위치 정보 사용 안 함
            }
        );
    };

    useEffect(() => {
        getLocation(); // 컴포넌트 마운트 시 실행
    }, []);

    return { geoCoords, error }; // 에러 상태도 반환
};

export default useGeolocation;
