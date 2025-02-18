import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import KakaoMapMarkers from "../../components/KakaoMapMarkers";
import KakaoMapContainer from "../../components/KakaoMapContainer";
import AddressSearchTrigger from "../../components/AddressSearchTrigger";
import { useBaseMap } from "../../contexts/KakaoMapContext";
import useReverseGeocoding from "../../hooks/useReverseGeocoding";
import useGeocoding from "../../hooks/useGeocoding";
import './style.css'

const SearchResult = () => {
    const { isSDKLoaded } = useBaseMap()
    const { coordToAddress } = useReverseGeocoding();
    const { addressToCoord } = useGeocoding();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // 상태 관리 추가
    const [address, setAddress] = useState("");
    const [isManualAddress, setIsManualAddress] = useState(false);
    const [storelist, setStorelist] = useState([]);

    // 좌표 객체 메모이제이션
    const coords = useMemo(() => ({
        lat: parseFloat(queryParams.get('lat')),
        lng: parseFloat(queryParams.get('lng'))
    }), [queryParams.get('lat'), queryParams.get('lng')]);

    const itemId = queryParams.get('itemId');
    const itemName = queryParams.get('itemName');

    // 주소 초기화 효과
    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const newAddress = await coordToAddress(coords);
                setAddress(newAddress);
            } catch (err) {
                console.error("주소 변환 실패:", err);
                setAddress("주소 정보 불러오기 실패");
            }
        };

        if (isSDKLoaded) {
            fetchAddress();
        }
    }, [coords, isSDKLoaded, coordToAddress]);

    // 주소 변경 핸들러
    const handleAddressComplete = async (fullAddress) => {
        try {
            const newCoords = await addressToCoord(fullAddress);
            if (newCoords) {
                navigate({
                    pathname: location.pathname,
                    search: `?lat=${newCoords.lat}&lng=${newCoords.lng}&itemId=${itemId}&itemName=${itemName}`
                });
                setAddress(fullAddress);
                setIsManualAddress(true);
            }
        } catch (err) {
            console.error("주소 변환 오류:", err);
        }
    };

    return (
        <div className="result-page">
            <div className="resultpagecontents">
                <div className="resultheader"><HeaderContainer/></div>
                    <div className="resultsearchbar">
                        <button className="resultbackbutton" onClick={() => navigate(-1)}>뒤로</button>
                        <p className="resultsearchinput">{itemName}</p>
                        <div className="search-result-controls">
                            <AddressSearchTrigger
                                address={address}
                                onAddressComplete={handleAddressComplete}
                                setIsManualAddress={setIsManualAddress}
                            />
                    </div>
                </div>
                <DraggableBottomSheet
                    coords={coords}
                    setStorelist={setStorelist}
                    itemId={itemId}
                />
            </div>
            {isSDKLoaded && (
                <>
                    <KakaoMapContainer coords={coords} />
                    <KakaoMapMarkers storelist={storelist} />
                </>
            )}
        </div>
    )
}

export default SearchResult;
