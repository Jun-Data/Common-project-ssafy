import React, { useEffect, useRef } from "react";
import { useKakaoMap } from "../../contexts/ KakaoMapContext";

const KakaoMapContainer = ({ coords }) => {
    const { map, setMap, isSDKLoaded } = useKakaoMap();
    const mapContainer = useRef(null);

    console.log('롤에서',coords)

    // 지도 초기화
    useEffect(() => {
        if (isSDKLoaded && !map && mapContainer.current) {
            const kakao = window.kakao;
            const mapInstance = new kakao.maps.Map(mapContainer.current, {
                center: new kakao.maps.LatLng(coords.lat, coords.lng),
                level: 3,
            });
            setMap(mapInstance);
        }
    }, [isSDKLoaded, coords, map, setMap]);

    // 좌표 변경 시 지도 중심 업데이트
    useEffect(() => {
        if (map) {
            map.setCenter(new window.kakao.maps.LatLng(coords.lat, coords.lng));
        }
    }, [coords, map]);

    return <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }} />;
};

export default KakaoMapContainer;
