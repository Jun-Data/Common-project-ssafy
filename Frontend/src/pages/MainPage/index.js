import { useState, useEffect } from "react";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchBar from "../../components/SearchBar";
import KakaoPostcodePopup from "../../components/KakaoPostcodePopup";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import KakaoMapContainer from "../../components/KakaoMapContainer";
import KakaoMapMarkers from "../../components/KakaoMapMarkers";
import useGeolocation from "../../hooks/UseGeolocation";
import useReverseGeocoding from "../../hooks/useReverseGeocoding";
import useGeocoding from "../../hooks/useGeocoding";
import { useBaseMap } from "../../contexts/ KakaoMapContext";
import "./style.css";

const MainPage = () => {
    const { isSDKLoaded } = useBaseMap();
    const { coordToAddress } = useReverseGeocoding();
    const { addressToCoord } = useGeocoding();
    const { geoCoords, error } = useGeolocation();

    const [coords, setCoords] = useState({ lat: 37.5015376, lng: 127.0397208 });
    const [address, setAddress] = useState("인재의 산실 멀티캠퍼스");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [storelist, setStorelist] = useState([]);
    const [isManualAddress, setIsManualAddress] = useState(false);

    // 자동 위치 추적: geolocation 결과로 좌표와 주소 업데이트
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

    // 주소 검색 완료 시 핸들러
    const handleAddressComplete = async (data) => {
        try {
            const fullAddress = data.fullAddress;
            setAddress(fullAddress);
            setIsManualAddress(true);
            const newCoords = await addressToCoord(fullAddress);
            if (newCoords) {
                setCoords(prev => ({ ...prev, ...newCoords }));
            }
        } catch (err) {
            console.error("주소 변환 오류:", err);
        }
    };

    console.log(coords)

    return (
        <div className="mainpagebackground">
            <div className="mainpagecontents">
                <div className="mainpageheader">
                    <HeaderContainer />
                </div>

                <div className="mainpagecurrentaddress">
                    <div className="mainpageaddressdetail">
                        {error ? "위치 찾는 중...." : `내 위치: ${address}`}
                    </div>
                    <button
                        onClick={() => setIsPopupOpen(true)}
                        className="addressSearchButton"
                    >
                        주소 찾기
                    </button>
                </div>

                <div className="mainpagesearchbar">
                    <SearchBar coords={coords} />
                </div>

                <div className="mainpagebottomsheet">
                    <DraggableBottomSheet
                        coords={coords}
                        setStorelist={setStorelist}
                    />
                </div>

                {/* 지도 루트 컨테이너 (한 페이지에 단 하나만 존재해야 함) */}
                <div id="map-root" className="mainpagemap" ></div>

                {isSDKLoaded && (
                    <>
                        <KakaoMapContainer coords={coords} />
                        <KakaoMapMarkers storelist={storelist} />
                    </>
                )}

                {isPopupOpen && (
                    <KakaoPostcodePopup
                        onClose={() => setIsPopupOpen(false)}
                        onComplete={handleAddressComplete}
                    />
                )}
            </div>
        </div>
    );
};

export default MainPage;
