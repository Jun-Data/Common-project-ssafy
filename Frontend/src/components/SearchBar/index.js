import React, { useState } from "react";
import { useNavigate, useLocation, matchPath, useMatch } from "react-router-dom";
import './style.css'

const SearchBar = ({ coords, setQuery }) => {
    const [localQuery, setLocalQuery] = useState(""); // 로컬 상태로 입력값 관리
    const navigate = useNavigate();
    const location = useLocation();

    const isStoreDetailPage = useMatch('/storedetail/*');
    const isSearchPage = useLocation().pathname === '/search';

    const handleSearch = () => {
        if (coords) {
            navigate(`/search?lat=${coords.lat}&lng=${coords.lng}`);
        }
    }


    // 검색어 입력 처리
    const handleInputChange = (e) => {
        setLocalQuery(e.target.value);
        setQuery(e.target.value); // 부모 컴포넌트에 검색어 전달
        console.log("입력변화감지")
    };


    return (
        <div className="searchbar">
            {(isSearchPage || isStoreDetailPage) && (
                <input
                    type="text"
                    className="search-input-searchpage"
                    placeholder="검색어를 입력하세요"
                    value={localQuery}
                    onChange={handleInputChange}
                />
            )}
            {!isSearchPage && !isStoreDetailPage && (
                <input
                    type="text"
                    className="search-input-mainpage"
                    placeholder="제품 이름으로 검색해보세요!"
                    onClick={handleSearch}
                />
            )}
        </div>
    )
};

export default SearchBar;
