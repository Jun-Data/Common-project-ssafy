import React, { useEffect, useRef } from "react";
import { useKakaoMap } from "../../contexts/ KakaoMapContext";

const KakaoMapContainer = ({ coords }) => {
    const { map, setMap, isSDKLoaded } = useKakaoMap();
    const mapContainer = useRef(null);
    const markerRef = useRef(null); // 마커 참조 저장

    // 지도 초기화 및 마커 생성
    useEffect(() => {
        if (isSDKLoaded && !map && mapContainer.current) {
            const kakao = window.kakao;

            // 지도 생성
            const mapInstance = new kakao.maps.Map(mapContainer.current, {
                center: new kakao.maps.LatLng(coords.lat, coords.lng),
                level: 3,
            });

            // 커스텀 마커 이미지 설정
            const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
            const imageSize = new kakao.maps.Size(40, 40);
            const imageOption = { offset: new kakao.maps.Point(27, 69) };

            // 마커 생성
            markerRef.current = new kakao.maps.Marker({
                map: mapInstance,
                position: new kakao.maps.LatLng(coords.lat, coords.lng),
                image: new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)
            });

            setMap(mapInstance);
        }
    }, [isSDKLoaded, coords, map, setMap]);

    // 좌표 변경 시 지도 중심 및 마커 위치 업데이트
    useEffect(() => {
        if (map && markerRef.current) {
            const newPosition = new window.kakao.maps.LatLng(coords.lat, coords.lng);

            // 지도 중심 이동
            map.setCenter(newPosition);

            // 마커 위치 업데이트
            markerRef.current.setPosition(newPosition);
        }
    }, [coords, map]);

    return <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }} />;
};

export default KakaoMapContainer;
