import { useEffect, useRef } from 'react';
import { useKakaoMap } from "../../contexts/ KakaoMapContext";

const KakaoMapContainer = ({ coords }) => {
    const { map, setMap, isSDKLoaded, setIsSDKLoaded, setIsMapReady } = useKakaoMap();
    const containerRef = useRef(null);

    // SDK 초기화
    useEffect(() => {
        if (!window.kakao) {
            const script = document.createElement('script');
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_API_KEY}&autoload=false`;
            script.onload = () => {
                window.kakao.maps.load(() => {
                    setIsSDKLoaded(true);
                });
            };
            document.head.appendChild(script);
        }
    }, []);

    // 지도 생성
    useEffect(() => {
        if (!isSDKLoaded || !containerRef.current) return;

        const mapInstance = new window.kakao.maps.Map(containerRef.current, {
            center: new window.kakao.maps.LatLng(coords.lat, coords.lng),
            level: 3
        });

        // 지도 완전 초기화 감지
        window.kakao.maps.event.addListener(mapInstance, 'tilesloaded', () => {
            setMap(mapInstance);
            setIsMapReady(true);
        });

    }, [isSDKLoaded, coords.lat, coords.lng]);

    return <div ref={containerRef} style={{ width: '100vw', height: '100vh', zIndex: '1'}} />;
};

export default KakaoMapContainer;