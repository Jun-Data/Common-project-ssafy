// Search.jsx (메인 페이지)
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchApi from "../../api/searchApi";
import SearchBar from "../../components/SearchBar";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchDropdownList from "../../components/SearchDropdownList";
import SearchNavbar from "../../components/SearchNavbar";
import useAuth from "../../hooks/useAuth";
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
    const { logindata } = useAuth();
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
        navigate(`/search/results?lat=${lat}&lng=${lng}&itemId=${item.itemId}&itemName=${item.itemName}`);
    };

    return (
        <div className="searchpage">
            <div className="searchpageheader"><HeaderContainer /></div>
            <div className="searchpagesearchbar">
                <SearchBar
                    setQuery={handleQueryChange}
                    onClear={handleClear}
                />
                {isDropdownVisible && results?.length > 0 && (
                    <div className="searchpagedropdown">
                        <SearchDropdownList
                            results={results}
                            onItemClick={handleItemClick}
                        />
                    </div>
                )}
            </div>
            <div className="searchpagenavbar">
                <SearchNavbar lat={lat} lng={lng} />
            </div>
            <div className="searchpagerecommend">
                <ul>
                    <li>원하시는 제품을 검색하면 해당 제품을 보유한<br/> 근처 가게를 볼 수 있어요.</li>
                    <li>메인페이지에서 <img src="/mylocation.png"/>을 눌러 위치를 설정할 수 있어요.</li>
                    <li>영양분으로도 제품을 검색해보세요!</li>
                </ul>
            </div>
        </div>
    );
};

export default Search;
