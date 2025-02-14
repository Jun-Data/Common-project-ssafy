import { useEffect } from 'react';
import { useBaseMap } from "../../contexts/ KakaoMapContext";

const KakaoMapMarkers = ({ storelist }) => {

    console.log('마커에서', storelist);

    const { baseMap, isSDKLoaded } = useBaseMap();

    useEffect(() => {
        if (!baseMap || !storelist || !isSDKLoaded) return;

        // storelist 기반으로 마커 생성
        const markers = storelist.map((store) => {
            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(store.lat, store.lon),
                map: baseMap
            });

            // 클릭 시 해당 마커 위치로 지도 중심 이동
            window.kakao.maps.event.addListener(marker, 'click', () => {
                baseMap.panTo(marker.getPosition());
            });

            return marker;
        });

        // 컴포넌트 언마운트 시 생성한 마커 제거
        return () => {
            markers.forEach((marker) => marker.setMap(null));
        };
    }, [storelist, baseMap, isSDKLoaded]);

    return null;
};

export default KakaoMapMarkers;
