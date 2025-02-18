import { useEffect, useRef } from 'react';
import { useBaseMap } from "../../contexts/KakaoMapContext";
import './style.css'


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
            '/mylocation.png',
            new window.kakao.maps.Size(40, 40),
            { offset: new window.kakao.maps.Point(20, 0) }
        );

        const newMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(coords.lat, coords.lng),
            image: markerImage,
            map: baseMap,
            clickable: true,
        });

        // 3. 마커 참조 업데이트
        markerRef.current = newMarker;

        const iwContent = `
          <div style="
            width: 100px;
            padding: 15px;
            text-align: center;
            font-size: 14px;
            color: #333;
            position: relative;
          ">
            📍 내 위치
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

        // 클릭 이벤트 핸들러
        window.kakao.maps.event.addListener(newMarker, 'click', () => {
            infowindow.open(baseMap, newMarker);
            baseMap.setCenter(newMarker.getPosition())
        });

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
