import { useState, useEffect, useRef } from "react";

const useReverseGeocoding = () => {
    const [geocoder, setGeocoder] = useState(null);
    const cache = useRef(new Map());

    // Kakao Maps API 로드
    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_API_KEY}&libraries=services`;
        script.async = true;

        script.onload = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    // Geocoder 초기화는 API 로드 이후에만 수행
                    setGeocoder(new window.kakao.maps.services.Geocoder());
                });
            }
        };

        script.onerror = () => console.error("Kakao Maps SDK 로드 실패");
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
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
