import React, { useEffect } from "react";

const RegisterMap = ({ coords, address, onAddressUpdate }) => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_API_KEY}&libraries=services&autoload=false`;
        script.async = true;

        script.onload = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    const kakao = window.kakao;
                    const mapContainer = document.getElementById("map");
                    const mapOption = coords
                        ? { center: new kakao.maps.LatLng(coords.lat, coords.lng), level: 3 }
                        : { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 3 }; // 기본값: 서울

                    const map = new kakao.maps.Map(mapContainer, mapOption);
                    const geocoder = new kakao.maps.services.Geocoder();

                    // 현재 위치에 마커 추가
                    if (coords) {
                        const markerPosition = new kakao.maps.LatLng(coords.lat, coords.lng);

                        const marker = new kakao.maps.Marker({
                            position: markerPosition,
                            map: map,
                        });

                        // 마커 클릭 이벤트 추가 (예: 현재 위치 정보 표시)
                        kakao.maps.event.addListener(marker, "click", () => {
                            alert("현재 위치입니다!");
                        });

                        // 좌표 기반 역지오코딩
                        geocoder.coord2Address(coords.lng, coords.lat, (result, status) => {
                            if (status === kakao.maps.services.Status.OK) {
                                const updatedAddress =
                                    result[0]?.address?.address_name || "주소 없음";
                                onAddressUpdate(updatedAddress); // 부모 컴포넌트로 주소 전달
                            }
                        });
                    }

                    // 주소 기반 지오코딩
                    if (address) {
                        geocoder.addressSearch(address, (result, status) => {
                            if (status === kakao.maps.services.Status.OK && result.length > 0) {
                                const { x: lng, y: lat } = result[0];
                                map.setCenter(new kakao.maps.LatLng(lat, lng));

                                // 새 좌표에 마커 추가
                                const markerPosition = new kakao.maps.LatLng(lat, lng);
                                new kakao.maps.Marker({
                                    position: markerPosition,
                                    map: map,
                                });

                                onAddressUpdate(address); // 입력된 주소 그대로 업데이트
                            } else {
                                console.error("주소 변환 실패");
                            }
                        });
                    }

                });
            }
        };

        script.onerror = () => console.error("Kakao Maps SDK 로드 실패");
        document.head.appendChild(script);

        return () => document.head.removeChild(script);
    }, [coords, address]);

    return (
        <div
            id="map"
            style={{ width: "250px", height: "190px", margin: "20px 0px 0px 20px"}}
        ></div>
    );
};

export default RegisterMap;
