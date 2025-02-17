import { useEffect } from 'react';
import { useBaseMap } from "../../contexts/ KakaoMapContext";

const KakaoMapMarkers = ({ storelist }) => {

    const { baseMap, isSDKLoaded } = useBaseMap();

    useEffect(() => {
        if (!baseMap || !storelist || !isSDKLoaded) return;

        // storelist 기반으로 마커 생성
        const markers = storelist.map((store) => {
            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(store.locationX, store.locationY),
                map: baseMap,
                clickable: true,
            });

            const iwContent = `
              <div style="
                width: 100px;
                padding: 15px;
                text-align: center;
                color: #333;
                position: relative;
                overflow: hidden;
                text-overflow: ellipsis;
                border-radius: 8px;  
                white-space: normal;  /* 줄바꿈 허용 */
                word-wrap: break-word;  /* 긴 단어도 줄 바꿈 */
              ">
                ${store.storeName}
                <div style="
                  position: absolute;
                  width: 0;
                  height: 0;
                "></div>
              </div>
            `;

            const infowindow = new window.kakao.maps.InfoWindow({
                content: iwContent,
                removable: true,
            });

            // 클릭 시 해당 마커 위치로 지도 중심 이동
            window.kakao.maps.event.addListener(marker, 'click', () => {
                baseMap.panTo(marker.getPosition());
                infowindow.open(baseMap, marker);
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
