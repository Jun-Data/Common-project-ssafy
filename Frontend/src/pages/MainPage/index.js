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
import {useKakaoMap} from "../../contexts/ KakaoMapContext";

import "./style.css";

const MainPage = () => {

    const { isSDKLoaded } = useKakaoMap();
    const { coordToAddress } = useReverseGeocoding();
    const { addressToCoord } = useGeocoding();
    const { geoCoords, error } = useGeolocation()

    const [coords, setCoords] = useState({lat: 37.5015376, lng: 127.0397208});
    const [address, setAddress] = useState("인재의 산실 멀티캠퍼스");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [storelist, setStorelist] = useState([]);
    const [isManualAddress, setIsManualAddress] = useState(false);


    useEffect(() => {
        if (isSDKLoaded && !isManualAddress && geoCoords) { // ✅ SDK 로드 확인 추가
            (async () => {
                try {
                    const newAddress = await coordToAddress(geoCoords);
                    setCoords(geoCoords);
                    setAddress(newAddress);
                } catch (error) {
                    console.error("역지오코딩 실패:", error);
                    setAddress("위치 정보를 가져올 수 없음"); // ✅ 오류 처리 추가
                }
            })();
        }
    }, [geoCoords, isSDKLoaded, isManualAddress]); // ✅ 종속성 수정

    const handleAddressComplete = async (data) => {
        try {
            const newAddress = data.fullAddress;
            setAddress(prev => { // 함수형 업데이트
                console.log('주소 업데이트:', prev, '→', newAddress);
                return newAddress;
            });

            const newCoords = await addressToCoord(newAddress);
            if (newCoords) {
                setCoords(prevCoords => ({ // 함수형 업데이트
                    ...prevCoords,
                    ...newCoords
                }));
                setIsManualAddress(true);
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
                    <div className="mainpageaddressdetail">내 위치: {address}</div>
                    <button onClick={() => setIsPopupOpen(true)} className="addressSearchButton">
                        주소 찾기
                    </button>
                </div>
                <div className="mainpagesearchbar">
                    <SearchBar coords={coords} />
                </div>

                <div className="mainpagebottomsheet">
                    <DraggableBottomSheet coords={coords} setStorelist={setStorelist} />
                </div>

                <div className="mainpagemap">
                    <KakaoMapContainer coords={coords} />
                    <KakaoMapMarkers storelist={storelist} />
                </div>

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
