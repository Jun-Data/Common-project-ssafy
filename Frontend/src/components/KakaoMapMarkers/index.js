import { useEffect, useRef } from 'react';
import { useKakaoMap } from "../../contexts/ KakaoMapContext";

const KakaoMapMarkers = ({ storelist }) => {
    const { map, isMapReady } = useKakaoMap();
    const markers = useRef([]);

    // 마커 생성/제거
    useEffect(() => {
        if (!isMapReady || !storelist?.length) return;

        const kakao = window.kakao;

        // 기존 마커 제거
        markers.current.forEach(marker => marker.setMap(null));

        // 신규 마커 생성
        markers.current = storelist.map(store => {
            return new kakao.maps.Marker({
                position: new kakao.maps.LatLng(store.lat, store.lon),
                map: map
            });
        });

        return () => markers.current.forEach(marker => marker.setMap(null));
    }, [storelist, isMapReady]);

    return null;
};

export default KakaoMapMarkers;