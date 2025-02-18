import { useState, useEffect, useRef } from "react";
import { useBaseMap } from "../contexts/KakaoMapContext";

const useReverseGeocoding = () => {
    const { isSDKLoaded } = useBaseMap(); // ✅ BaseMap 컨텍스트 사용
    const [geocoder, setGeocoder] = useState(null);
    const cache = useRef(new Map());

    // 역지오코더 초기화
    useEffect(() => {
        if (isSDKLoaded && window.kakao?.maps?.services?.Geocoder) {
            setGeocoder(new window.kakao.maps.services.Geocoder());
        }
    }, [isSDKLoaded]);

    // 좌표 → 주소 변환
    const coordToAddress = async (coords) => {
        if (!geocoder || !coords) return null;

        // 캐시 키 생성 (소수점 7자리까지)
        const cacheKey = `${coords.lat.toFixed(7)},${coords.lng.toFixed(7)}`;

        // 캐시 히트 검사
        if (cache.current.has(cacheKey)) {
            return cache.current.get(cacheKey);
        }

        return new Promise((resolve, reject) => {
            geocoder.coord2Address(coords.lng, coords.lat, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK && result[0]) {
                    const address = result[0].address?.address_name || '주소 정보 없음';
                    cache.current.set(cacheKey, address);
                    resolve(address);
                } else {
                    reject(new Error(`역지오코딩 실패: ${status}`));
                }
            });
        });
    };

    return { coordToAddress };
};

export default useReverseGeocoding;
