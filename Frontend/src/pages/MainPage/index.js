import { useState, useEffect } from "react";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchBar from "../../components/SearchBar";
import KakaoPostcodePopup from "../../components/KakaoPostcodePopup";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import BottomNav from "../../components/BottomNav/BottomNav";
import KakaoMapContainer from "../../components/KakaoMapContainer";
import KakaoMapMarkers from "../../components/KakaoMapMarkers";
import useGeolocation from "../../hooks/UseGeolocation";
import useReverseGeocoding from "../../hooks/useReverseGeocoding";
import useGeocoding from "../../hooks/useGeocoding";
import {useKakaoMap} from "../../contexts/ KakaoMapContext";

import "./style.css";

const MainPage = () => {

    const { isSDKLoaded } = useKakaoMap();
    const { coordToAddress } = useReverseGeocoding();
    const { addressToCoord } = useGeocoding();
    const { geoCoords, error } = useGeolocation()

    const [coords, setCoords] = useState({lat: 32.1234567, lng: 32.1234567});
    const [address, setAddress] = useState("인재의 산실 멀티캠퍼스");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [storelist, setStorelist] = useState([]);
    const [isManualAddress, setIsManualAddress] = useState(false);


    // geolocation 실행되면 코드, 위치 업데이트
    useEffect(() => {
        if (coords && !isManualAddress && isSDKLoaded) {
            setCoords(geoCoords);
            (async () => {
                try {
                    const newAddress = await coordToAddress(coords);
                    setAddress(newAddress);
                } catch (error) {
                    console.error("역지오코딩 실패:", error);
                }
            })();
        }
    }, [coords, coordToAddress, isManualAddress, isSDKLoaded]);

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

    return (
        <div className="mainpagebackground">
            <div className="mainpagecontents">
                <div className="mainpageheader">
                    <HeaderContainer />
                </div>
                <div className="mainpagecurrentaddress">
                    <div className="mainpageaddressdetail">현재 주소: {address}</div>
                    <button onClick={() => setIsPopupOpen(true)} className="addressSearchButton">
                        주소 찾기
                    </button>
                </div>
                <div className="mainpagesearchbar">
                    <SearchBar coords={coords} />
                </div>

                <DraggableBottomSheet coords={coords} setStorelist={setStorelist} />

                <div className="mainpagemap">
                    <KakaoMapContainer coords={coords} />
                    <KakaoMapMarkers storelist={storelist} />
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
