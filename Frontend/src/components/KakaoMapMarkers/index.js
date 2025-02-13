import { useEffect, useRef } from "react";
import { useKakaoMap } from "../../contexts/ KakaoMapContext";

const KakaoMapMarkers = ({ storelist }) => {
    const { map, isSDKLoaded } = useKakaoMap();
    const markersRef = useRef([]); // 마커 참조 저장용

    useEffect(() => {
        if (!isSDKLoaded || !map || !storelist?.length) return;

        const kakao = window.kakao;
        const bounds = new kakao.maps.LatLngBounds(); // 지도 범위 조절용

        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // 신규 마커 생성
        storelist.forEach(store => {
            const markerPosition = new kakao.maps.LatLng(store.lat, store.lon);

            const marker = new kakao.maps.Marker({
                position: markerPosition,
                map: map,
            });

            // 이벤트 리스너 추가
            kakao.maps.event.addListener(marker, 'click', () => {
                alert(`${store.storeName} 클릭!`);
            });

            markersRef.current.push(marker);
            bounds.extend(markerPosition); // 범위 확장
        });

        // 지도 범위 조정
        map.setBounds(bounds);

    }, [map, storelist, isSDKLoaded]); // isSDKLoaded 종속성 추가

    return null;
};

export default KakaoMapMarkers;
