import { createContext, useState, useContext } from 'react';

const KakaoMapContext = createContext({
    map: null,
    isSDKLoaded: false,
    isMapReady: false,
    setMap: () => {},
    setIsMapReady: () => {}
});

export const KakaoMapProvider = ({ children }) => {
    const [map, setMap] = useState(null);
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    return (
        <KakaoMapContext.Provider
            value={{ map, setMap, isSDKLoaded, setIsSDKLoaded, isMapReady, setIsMapReady }}
        >
            {children}
        </KakaoMapContext.Provider>
    );
};

export const useKakaoMap = () => useContext(KakaoMapContext);
