import React, { createContext, useState, useContext, useEffect } from "react";

const KakaoMapContext = createContext();

export const KakaoMapProvider = ({ children }) => {
    const [map, setMap] = useState(null);
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_API_KEY}&autoload=false`;
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                setIsSDKLoaded(true);
            });
        };

        script.onerror = () => console.error("Kakao Maps SDK 로드 실패");

        document.head.appendChild(script);
        return () => document.head.removeChild(script);
    }, []);

    return (
        <KakaoMapContext.Provider value={{ map, setMap, isSDKLoaded }}>
            {children}
        </KakaoMapContext.Provider>
    );
};

export const useKakaoMap = () => useContext(KakaoMapContext);
