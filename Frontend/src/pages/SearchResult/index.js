import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import KakaoMapMarkers from "../../components/KakaoMapMarkers";
import KakaoMapContainer from "../../components/KakaoMapContainer";
import { useBaseMap } from "../../contexts/ KakaoMapContext";
import './style.css'

const SearchResult = () => {
    const { isSDKLoaded } = useBaseMap()
    const [storelist, setStorelist] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // 좌표 객체 메모이제이션
    const coords = useMemo(() => ({
        lat: queryParams.get('lat'),
        lng: queryParams.get('lng')
    }), [queryParams.get('lat'), queryParams.get('lng')]);

    const itemId = queryParams.get('itemId');
    const itemName = queryParams.get('itemName');

    return (
        <div className="result-page">
            <div className="resultpagecontents">
                <div className="resultheader"><HeaderContainer/></div>
                <div className="resultsearchbar">
                    <p className="resultsearchinput">{itemName}</p>
                    <button className="resultbackbutton" onClick={() => navigate(-1)}>뒤로가기</button>
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
