import { useState, useEffect, useRef } from "react";

const useReverseGeocoding = () => {
    const [geocoder, setGeocoder] = useState(null);
    const cache = useRef(new Map());

    // Geocoder 초기화 (지도 SDK는 이미 로드된 상태라고 가정)
    useEffect(() => {
        if (window.kakao && window.kakao.maps) {
            setGeocoder(new window.kakao.maps.services.Geocoder());
        }
    }, []);

    // 좌표를 주소로 변환
    const coordToAddress = async (coords) => {
        if (!geocoder || !coords) return null;

        const key = `${coords.lat.toFixed(7)},${coords.lng.toFixed(7)}`;

        // 캐시 확인
        if (cache.current.has(key)) {
            return cache.current.get(key);
        }

        // Kakao Maps API를 사용하여 좌표 검색
        return new Promise((resolve, reject) => {
            geocoder.coord2Address(coords.lng, coords.lat, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK && result[0]) {
                    const address = result[0].address.address_name;
                    cache.current.set(key, address); // 결과를 캐시에 저장
                    resolve(address);
                } else {
                    console.error("역지오코딩 실패");
                    reject("역지오코딩 실패");
                }
            });
        });
    };

    return { coordToAddress };
};

export default useReverseGeocoding;
