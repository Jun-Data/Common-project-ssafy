import { useState, useEffect, useRef } from "react";
import { useKakaoMap } from "../contexts/ KakaoMapContext";


const useGeocoding = () => {
    const { isSDKLoaded } = useKakaoMap(); // ✅ SDK 로드 상태 가져오기
    const [geocoder, setGeocoder] = useState(null);
    const cache = useRef(new Map());

    useEffect(() => {
        if (isSDKLoaded && window.kakao?.maps?.services) { // ✅ SDK 로드 확인
            setGeocoder(new window.kakao.maps.services.Geocoder());
        }
    }, [isSDKLoaded]); // ✅ 종속성 배열에 isSDKLoaded 추가

    // 주소를 좌표로 변환
    const addressToCoord = async (address) => {
        if (!geocoder || !address) return null;

        // 캐시 키로 주소 사용
        if (cache.current.has(address)) {
            return cache.current.get(address);
        }

        // Kakao Maps API를 사용하여 주소 검색
        return new Promise((resolve, reject) => {
            geocoder.addressSearch(address, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK && result[0]) {
                    const coords = { lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) };
                    cache.current.set(address, coords); // 결과를 캐시에 저장
                    resolve(coords);
                } else {
                    console.error("주소 검색 실패");
                    reject("주소 검색 실패");
                }
            });
        });
    };

    return { addressToCoord };
};

export default useGeocoding;
