import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchApi from "../../api/searchApi";
import SearchBar from "../../components/SearchBar";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchDropdownList from "../../components/SearchDropdownList";
import SearchNavbar from "../../components/SearchNavbar";
import SearchNativeApi from "../../api/SearchNativeApi";
import './style.css';

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const Search = () => {


    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const lat = queryParams.get('lat');
    const lng = queryParams.get('lng');

    const debouncedFetchResults = debounce(async (searchQuery) => {
        try {
            const data = await SearchApi(searchQuery);
            setResults(data);
            setDropdownVisible(data.length > 0);
        } catch (error) {
            console.error("검색 오류:", error);
        }
    }, 500);

    const handleQueryChange = (newQuery) => {
        setQuery(newQuery);
        debouncedFetchResults(newQuery);
    };

    const handleClear = () => {
        setDropdownVisible(false);
        setResults([]);
    };

    const handleItemClick = (item) => {
        setDropdownVisible(false);
        navigate(`/search/results?lat=${lat}&lng=${lng}&itemId=${item.item_id}&itemName=${item.item_name}`);
    };

    const handleNativeSearch = async (searchQuery) => {
        try {
            const data = await SearchNativeApi(searchQuery);
            setResults(data);
            setDropdownVisible(data.length > 0);
        } catch (error) {
            console.error("네이티브 검색 오류:", error);
        }
    };

    return (
        <div className="searchpage">
            <div className="searchpageheader"><HeaderContainer /></div>
            <div className="searchpagesearchbar">
                <SearchBar
                    setQuery={handleQueryChange}
                    onClear={handleClear}
                    onSearch={handleNativeSearch}
                />

                {isDropdownVisible && results?.length > 0 && (
                    <div className="searchpagedropdown">
                        <SearchDropdownList
                            className="search-page-dropdown"
                            results={results}
                            onItemClick={handleItemClick}
                        />
                    </div>
                )}
            </div>
            <div className="searchpagenavbar">
                <SearchNavbar lat={lat} lng={lng} />
            </div>
            <div className="searchpagerecommend" style={{ marginTop: "50px" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", marginTop:"20px", marginLeft: "3px" }}>
                    제품명을 검색하시면 제품을 보유한 근처 매장이 나와요!
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" ,marginLeft: "3px"}}>
                    원하는 영양분으로도 제품을 검색해보세요!
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", marginLeft: "3px" }}>
                    메인페이지에서 
                    <img src="/mylocation.png" style={{ width: "18px", height: "18px", verticalAlign: "middle" }} alt="위치 설정 아이콘" /> 
                    을 눌러 위치를 재설정할 수 있어요!
                </li>
            </ul>
            </div>
        </div>
    );
};

export default Search;
