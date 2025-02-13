import { useEffect } from "react";
import { useKakaoMap } from "../../contexts/ KakaoMapContext";

const KakaoMapMarkers = ({ storelist }) => {
    const { map } = useKakaoMap();

    useEffect(() => {
        if (!map || !storelist) return;

        // 마커 생성 함수
        const createMarker = (store) => {
            const kakao = window.kakao;
            const markerPosition = new kakao.maps.LatLng(store.lat, store.lon);

            const marker = new kakao.maps.Marker({
                position: markerPosition,
                map: map,
            });

            // 마커 클릭 이벤트
            kakao.maps.event.addListener(marker, "click", () => {
                alert(`${store.name} 클릭!`);
            });

            return marker;
        };

        // 기존 마커 제거 후 새로 생성
        const markers = storelist.map((store) => createMarker(store));

        // 컴포넌트 언마운트 시 마커 제거
        return () => {
            markers.forEach((marker) => marker.setMap(null));
        };
    }, [map, storelist]);

    return null; // UI를 렌더링하지 않음 (마커만 지도에 표시)
};

export default KakaoMapMarkers;
