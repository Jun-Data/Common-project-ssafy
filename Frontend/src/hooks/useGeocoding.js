import { useState, useEffect, useRef } from "react";
import { useBaseMap } from "../contexts/KakaoMapContext";

const useGeocoding = () => {
    const { isSDKLoaded } = useBaseMap(); // ✅ BaseMap 컨텍스트 사용
    const [geocoder, setGeocoder] = useState(null);
    const cache = useRef(new Map());

    // 지오코더 초기화
    useEffect(() => {
        if (isSDKLoaded && window.kakao?.maps?.services?.Geocoder) {
            setGeocoder(new window.kakao.maps.services.Geocoder());
        }
    }, [isSDKLoaded]);

    // 주소 → 좌표 변환
    const addressToCoord = async (address) => {
        if (!geocoder || !address) return null;

        // 정규화된 주소 키 생성
        const normalizedAddress = address.trim().replace(/\s+/g, ' ');

        // 캐시 히트 검사
        if (cache.current.has(normalizedAddress)) {
            return cache.current.get(normalizedAddress);
        }

        return new Promise((resolve, reject) => {
            geocoder.addressSearch(normalizedAddress, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK && result[0]) {
                    const coords = {
                        lat: parseFloat(result[0].y),
                        lng: parseFloat(result[0].x)
                    };
                    cache.current.set(normalizedAddress, coords);
                    resolve(coords);
                } else {
                    reject(new Error(`주소 변환 실패: ${status}`));
                }
            });
        });
    };

    return { addressToCoord };
};

export default useGeocoding;
