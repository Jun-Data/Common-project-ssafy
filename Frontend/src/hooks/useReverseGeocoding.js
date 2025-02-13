import { useState, useEffect, useRef } from "react";
import { useKakaoMap } from "../contexts/ KakaoMapContext";

const useReverseGeocoding = () => {
    const { isSDKLoaded } = useKakaoMap(); // ✅ SDK 로드 상태 가져오기
    const [geocoder, setGeocoder] = useState(null);
    const cache = useRef(new Map());

    useEffect(() => {
        if (isSDKLoaded && window.kakao?.maps?.services) { // ✅ SDK 로드 확인
            setGeocoder(new window.kakao.maps.services.Geocoder());
        }
    }, [isSDKLoaded]);

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
