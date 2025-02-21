import { useState, useEffect } from "react";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchBar from "../../components/SearchBar";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import KakaoMapContainer from "../../components/KakaoMapContainer";
import KakaoMapMarkers from "../../components/KakaoMapMarkers";
import useGeolocation from "../../hooks/UseGeolocation";
import useReverseGeocoding from "../../hooks/useReverseGeocoding";
import useGeocoding from "../../hooks/useGeocoding";
import { useBaseMap } from "../../contexts/KakaoMapContext";
import "./style.css";

const MainPage = () => {
    const { isSDKLoaded } = useBaseMap();
    const { coordToAddress } = useReverseGeocoding();
    const { addressToCoord } = useGeocoding();
    const { geoCoords, error } = useGeolocation();

    const [coords, setCoords] = useState({ lat: 37.5015376, lng: 127.0397208 });
    const [address, setAddress] = useState("인재의 산실 멀티캠퍼스");
    const [isManualAddress, setIsManualAddress] = useState(false);
    const [storelist, setStorelist] = useState([]);

    // 자동 위치 추적 효과
    useEffect(() => {
        if (isSDKLoaded && !isManualAddress && geoCoords) {
            (async () => {
                try {
                    const newAddress = await coordToAddress(geoCoords);
                    setCoords(geoCoords);
                    setAddress(newAddress);
                } catch (err) {
                    console.error("위치 업데이트 실패:", err);
                    setAddress("위치 정보 불러오기 실패");
                }
            })();
        }
    }, [geoCoords, isSDKLoaded, isManualAddress, coordToAddress]);

    // 주소 검색 핸들러
    const handleAddressComplete = async (fullAddress) => {
        try {
            setAddress(fullAddress);
            const newCoords = await addressToCoord(fullAddress);
            if (newCoords) {
                setCoords(prev => ({ ...prev, ...newCoords }));
            }
        } catch (err) {
            console.error("주소 변환 오류:", err);
        }
    };

    return (
        <div className="mainpagebackground">
            <div className="mainpagecontents">
                <div className="mainpageheader">
                    <HeaderContainer />
                </div>

                <div className="mainpagesearchbar">
                    <SearchBar
                        coords={coords}
                        address={address}
                        error={error}
                        onAddressComplete={handleAddressComplete}
                        setIsManualAddress={setIsManualAddress}
                    />
                </div>

                <div className="mainpagebottomsheet">
                    <DraggableBottomSheet
                        coords={coords}
                        setStorelist={setStorelist}
                    />
                </div>

                {isSDKLoaded && (
                    <>
                        <KakaoMapContainer coords={coords} />
                        <KakaoMapMarkers storelist={storelist} />
                    </>
                )}
            </div>
        </div>
    );
};

export default MainPage;
