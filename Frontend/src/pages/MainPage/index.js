import { useState, useEffect } from "react";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchBar from "../../components/SearchBar";
import KakaoMapBackground from "../../components/KakaoMapBackground";
import KakaoPostcodePopup from "../../components/KakaoPostcodePopup";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import BottomNav from "../../components/BottomNav/BottomNav";
import useGeolocation from "../../hooks/UseGeolocation";
import useReverseGeocoding from "../../hooks/useReverseGeocoding";
import useGeocoding from "../../hooks/useGeocoding";
import KakaoMapMarkers from "../../components/KakaoMapMarkers";

import "./style.css";

const MainPage = () => {
    const { coords: initialCoords } = useGeolocation();
    const { coordToAddress } = useReverseGeocoding();
    const { addressToCoord } = useGeocoding();
    const [coords, setCoords] = useState(initialCoords);
    const [address, setAddress] = useState("인재의 산실 멀티캠퍼스");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [storelist, setStorelist] = useState([]); // 바텀시트에서 전달받을 데이터
    const [isManualAddress, setIsManualAddress] = useState(false); // 사용자 주소 설정 여부
    const [map, setMap] = useState(null); // 지도 객체 상태 추가

    // initialCoords가 변경될 때 coords 동기화 및 주소 업데이트
    useEffect(() => {
        if (initialCoords && !isManualAddress) {
            setCoords(initialCoords);
            (async () => {
                try {
                    const newAddress = await coordToAddress(initialCoords);
                    setAddress(newAddress);
                } catch (error) {
                    console.error("역지오코딩 실패:", error);
                }
            })();
        }
    }, [initialCoords, coordToAddress, isManualAddress]);

    // 카카오 우편번호 검색 완료 핸들러
    const handleAddressComplete = async (data) => {
        try {
            const newAddress = data.fullAddress;
            setAddress(newAddress);

            const newCoords = await addressToCoord(newAddress);
            if (newCoords) {
                setCoords(newCoords);
                setIsManualAddress(true); // 사용자가 직접 주소를 설정했음을 표시
            }
        } catch (error) {
            console.error("지오코딩 실패:", error);
        }
    };
    console.log(isManualAddress);

    return (
        <div className="mainpagebackground">
            <div className="mainpagecontents">
                <div className="mainpageheader"><HeaderContainer /></div>
                <div className="mainpagecurrentaddress">
                    <div className="mainpageaddressdetail">
                        현재 주소: {address}
                    </div>
                    <button onClick={() => setIsPopupOpen(true)} className="addressSearchButton">
                        주소 찾기
                    </button>
                </div>
                <div className="mainpagesearchbar"><SearchBar coords={coords} /></div>

                <DraggableBottomSheet coords={coords} setStorelist={setStorelist} />

                <div className="mainpagemap">
                    <KakaoMapBackground coords={coords} onMapLoad={setMap} />
                </div>
                <div className="mainpagemarker">
                    {map && <KakaoMapMarkers map={map} storelist={storelist} />}
                </div>

                <BottomNav />

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
