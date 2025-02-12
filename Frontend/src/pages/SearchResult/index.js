import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import ResultBottomSheet from "../../components/ResultBottomSheet";
import BottomNav from "../../components/BottomNav/BottomNav";
import KakaoMapBackgroundResult from "../../components/KakaoMapBackgroundResult";
import KakaoMapMarkersResult from "../../components/KakaoMapMarkersResult";
import './style.css'

const SearchResult = () => {
    const [storelist, setStorelist] = useState([]);
    const [map, setMap] = useState(null); // 지도 객체 상태 추가

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);


    const coords = {lat: queryParams.get('lat'), lng: queryParams.get('lng')}
    const itemId = queryParams.get('itemId');

    return (
        <div className="result-page">
            <div className="resultpagecontents">
                <div className="resultheader"><HeaderContainer/></div>
                <div className="resultpagenotice;">검색 결과</div>
                <ResultBottomSheet coords={coords}
                                   itemId={itemId}
                                   setStorelist={setStorelist} />
                <BottomNav/>
            </div>
            <div className="resultpagemap">
                <KakaoMapBackgroundResult coords={coords} onMapLoad={setMap} />
            </div>
            <div className="resultpagemarker">
                {map && <KakaoMapMarkersResult map={map} storelist={storelist} />}
            </div>

        </div>
    )
}

export default SearchResult;