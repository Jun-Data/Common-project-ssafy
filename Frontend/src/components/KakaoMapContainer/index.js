import { useEffect, useRef } from 'react';
import { useBaseMap } from "../../contexts/ KakaoMapContext";

const KakaoMapContainer = ({ coords }) => {
    const { baseMap, isSDKLoaded } = useBaseMap();
    const markerRef = useRef(null); // 마커 인스턴스 추적용 ref

    useEffect(() => {
        if (!isSDKLoaded || !baseMap || !coords) return;

        // 1. 기존 마커 제거
        if (markerRef.current) {
            markerRef.current.setMap(null);
        }

        // 2. 새 마커 생성
        const markerImage = new window.kakao.maps.MarkerImage(
            '/mylocation.jpg',
            new window.kakao.maps.Size(30, 30),
            { offset: new window.kakao.maps.Point(0, 0) }
        );

        const newMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(coords.lat, coords.lng),
            image: markerImage,
            map: baseMap
        });

        // 3. 마커 참조 업데이트
        markerRef.current = newMarker;

        // 4. 지도 중심 이동
        const position = new window.kakao.maps.LatLng(coords.lat, coords.lng);
        baseMap.setCenter(position);


        // 클린업 함수
        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
            }
        };
    }, [coords, baseMap, isSDKLoaded]); // coords 변경 시 재실행


    return null;
};

export default KakaoMapContainer;
