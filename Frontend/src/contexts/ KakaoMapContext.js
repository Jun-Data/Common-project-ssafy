import { createContext, useState, useContext, useEffect } from 'react';

const API_KEY = process.env.REACT_APP_KAKAO_JS_API_KEY;

// 전역 컨텍스트 생성 (단일 지도 인스턴스 사용)
const BaseMapContext = createContext();

export const KakaoMapProvider = ({ children }) => {
    const [baseMap, setBaseMap] = useState(null);
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&libraries=services,clusterer&autoload=false`;

        script.onload = async () => {
            try {
                // SDK 완전 초기화 대기
                await new Promise(resolve => window.kakao.maps.load(resolve));

                // 'map-root' 컨테이너에 단일 지도 인스턴스를 생성
                const mapContainer = document.getElementById('map-root');
                if (!mapContainer) {
                    console.error('map-root 요소를 찾을 수 없습니다.');
                    return;
                }
                const mapInstance = new window.kakao.maps.Map(mapContainer, {
                    center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                    level: 3,
                });

                setBaseMap(mapInstance);
                setIsSDKLoaded(true);
            } catch (error) {
                console.error('맵 SDK 초기화 실패:', error);
            }
        };

        document.head.appendChild(script);
        return () => document.head.removeChild(script);
    }, []);

    return (
        <BaseMapContext.Provider value={{ baseMap, setBaseMap, isSDKLoaded }}>
            {children}
        </BaseMapContext.Provider>
    );
};

export const useBaseMap = () => useContext(BaseMapContext);
