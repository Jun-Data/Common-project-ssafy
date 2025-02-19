import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import DraggableBottomSheet from "../../components/DraggableBottomSheet/DraggableBottomSheet";
import KakaoMapMarkers from "../../components/KakaoMapMarkers";
import KakaoMapContainer from "../../components/KakaoMapContainer";
import AddressSearchTrigger from "../../components/AddressSearchTrigger";
import { useBaseMap } from "../../contexts/KakaoMapContext";
import useReverseGeocoding from "../../hooks/useReverseGeocoding";
import useGeocoding from "../../hooks/useGeocoding";
import SearchDropdownList from "../../components/SearchDropdownList";
import searchApi from "../../api/searchApi";
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
    const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가
    const [searchResults, setSearchResults] = useState([]); // 검색 결과 상태 추가
    const [isManualAddress, setIsManualAddress] = useState(false);
    const [storelist, setStorelist] = useState([]);

    // 좌표 객체 메모이제이션
    const coords = useMemo(() => ({
        lat: parseFloat(queryParams.get('lat')),
        lng: parseFloat(queryParams.get('lng'))
    }), [queryParams.get('lat'), queryParams.get('lng')]);

    const itemId = queryParams.get('itemId');
    const itemName = queryParams.get('itemName');

    // 검색어 변경 핸들러
    const handleSearchChange = useCallback(async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await searchApi(query);
            setSearchResults(results);
        } catch (error) {
            console.error("검색 실패:", error);
            setSearchResults([]);
        }
    }, []);

// 검색어 디바운싱 효과
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            // 검색어가 있을 때만 API 호출
            if (searchQuery) {
                handleSearchChange(searchQuery);
            } else {
                setSearchResults([]); // 검색어가 비면 결과 초기화
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, handleSearchChange]);

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

    // 드롭다운 아이템 선택 핸들러
    const handleItemSelect = (selectedItem) => {
        navigate({
            pathname: location.pathname,
            search: `?lat=${coords.lat}&lng=${coords.lng}&itemId=${selectedItem.item_id}&itemName=${selectedItem.item_name}`
        });
        setSearchQuery(selectedItem.item_name);
        setSearchResults([]);
    };

    return (
        <div className="result-page">
                <div className="resultheader"><HeaderContainer/></div>
                <div className="search-input-container">
                    <div className="resultsearchbar">
                        <button className="resultbackbutton" onClick={() => navigate(-1)}>
                            <img src="/back-button.png" alt="뒤로 가기" />
                        </button>
                        <input
                            className="resultsearchinput"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={itemName}
                        />
                        <button className="resultclearbutton" onClick={() => setSearchQuery('')}>x</button>
                        <div className="search-result-controls">
                            <AddressSearchTrigger
                                address={address}
                                onAddressComplete={handleAddressComplete}
                                setIsManualAddress={setIsManualAddress}
                            />
                        </div>
                    </div>
                    {searchQuery && (  // 검색어가 있을 때만 드롭다운 표시
                        <div className="searchresultdropdown">
                            <SearchDropdownList
                            results={searchResults}
                            onItemClick={handleItemSelect}
                            /></div>
                    )}
                </div>
                <DraggableBottomSheet
                    coords={coords}
                    setStorelist={setStorelist}
                    itemId={itemId}
                />
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
