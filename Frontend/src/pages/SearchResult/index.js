import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import KakaoMapMarkers from "../../components/KakaoMapMarkers";
import KakaoMapContainer from "../../components/KakaoMapContainer";
import './style.css'

const SearchResult = () => {
    const [storelist, setStorelist] = useState([]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);


    const coords = {lat: queryParams.get('lat'), lng: queryParams.get('lng')}
    const itemId = queryParams.get('itemId');

    return (
        <div className="result-page">
            <div className="resultpagecontents">
                <div className="resultheader"><HeaderContainer/></div>
                <div className="resultpagenotice;">검색 결과</div>
                <DraggableBottomSheet coords={coords}
                                   itemId={itemId}
                                   setStorelist={setStorelist} />
            </div>
            <div className="resultpagemap">
                <KakaoMapContainer coords={coords} />
            </div>
            <div className="resultpagemarker">
                <KakaoMapMarkers storelist={storelist} />
            </div>

        </div>
    )
}

export default SearchResult;