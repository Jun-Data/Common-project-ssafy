import { useEffect, useRef } from "react";
import { useKakaoMap } from "../../contexts/ KakaoMapContext";

const KakaoMapMarkers = ({ storelist }) => {
    const { map, isSDKLoaded } = useKakaoMap();
    const markers = useRef([]);

    // 마커 생성/제거 핵심 로직
    useEffect(() => {
        if (!isSDKLoaded || !map || !storelist) return;

        const kakao = window.kakao;

        // 기존 마커 전부 제거
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];

        // 새 마커 생성
        storelist.forEach(store => {
            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(store.lat, store.lon),
                map: map
            });
            markers.current.push(marker);
        });

    }, [storelist, map, isSDKLoaded]); // 의존성 배열 최소화

    return null;
};

export default KakaoMapMarkers;
