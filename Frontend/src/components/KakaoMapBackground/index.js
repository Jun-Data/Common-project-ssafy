import React, { useEffect } from "react";

const KakaoMapBackground = ({ coords, onMapLoad }) => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_API_KEY}&libraries=services&autoload=false`;
        script.async = true;

        script.onload = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    const kakao = window.kakao;
                    const mapContainer = document.getElementById("map");
                    const mapOption = {
                        center: new kakao.maps.LatLng(coords.lat, coords.lng),
                        level: 3,
                    };
                    const map = new kakao.maps.Map(mapContainer, mapOption);

                    // 부모 컴포넌트로 지도 객체 전달
                    if (onMapLoad) onMapLoad(map);

                    // 내 위치 마커 생성
                    createMyLocationMarker(map, coords);
                });
            }
        };

        script.onerror = () => console.error("Kakao Maps SDK 로드 실패");
        document.head.appendChild(script);

        return () => document.head.removeChild(script);
    }, [coords, onMapLoad]);

    // 내 위치 마커 생성 함수
    const createMyLocationMarker = (map, coords) => {
        const kakao = window.kakao;

        // 사용자 정의 이미지 URL
        const imageSrc =
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; // 커스텀 이미지 예제
        const imageSize = new kakao.maps.Size(40, 40); // 이미지 크기
        const imageOption = { offset: new kakao.maps.Point(20, 40) }; // 중심점 설정

        // MarkerImage 객체 생성
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

        // 마커 위치 설정
        const markerPosition = new kakao.maps.LatLng(coords.lat, coords.lng);

        // 마커 생성
        const marker = new kakao.maps.Marker({
            position: markerPosition,
            map: map,
            image: markerImage, // 커스텀 이미지 적용
        });

        return marker;
    };

    return <div id="map" style={{ width: "100vw", height: "100vh" }}></div>;
};

export default KakaoMapBackground;