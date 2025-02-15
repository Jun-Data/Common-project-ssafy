import { useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import KakaoMapMarkers from "../../components/KakaoMapMarkers";
import KakaoMapContainer from "../../components/KakaoMapContainer";
import { useBaseMap } from "../../contexts/ KakaoMapContext";
import './style.css'

const SearchResult = () => {
    const { isSDKLoaded } = useBaseMap()

    const [storelist, setStorelist] = useState([]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);


    const coords = {lat: queryParams.get('lat'), lng: queryParams.get('lng')}
    const itemId = queryParams.get('itemId');

    return (
        <div className="result-page">
            <div className="resultpagecontents">
                <div className="resultheader"><HeaderContainer/></div>
                <DraggableBottomSheet coords={coords}
                                   setStorelist={setStorelist}
                                   itemId={itemId} />

        </div>
        {/* 지도 루트 컨테이너 (한 페이지에 단 하나만 존재해야 함) */}
        {/*<div id="map-root" className="resultpagemap" ></div>*/}
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