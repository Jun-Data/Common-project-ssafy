// SearchBar.jsx (컴포넌트)
import React, { useState } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import './style.css';

const SearchBar = ({ coords, setQuery, onClear }) => {
    const [localQuery, setLocalQuery] = useState("");
    const navigate = useNavigate();
    const isStoreDetailPage = useMatch('/storedetail/*');
    const isSearchPage = useLocation().pathname === '/search';

    const handleSearch = () => {
        if (coords) {
            navigate(`/search?lat=${coords.lat}&lng=${coords.lng}`);
        }
    };

    const handleInputChange = (e) => {
        setLocalQuery(e.target.value);
        setQuery(e.target.value);
    };

    const handleClear = () => {
        onClear();
        setLocalQuery("");
    }

    return (
        <div className="searchbar">
            {(isSearchPage || isStoreDetailPage) && (
                <div className="search-input-container">
                    <input
                        type="text"
                        className="search-input-searchpage"
                        placeholder="검색어를 입력하세요"
                        value={localQuery}
                        onChange={handleInputChange}
                    />
                    <button
                    className="clear-button"
                        onClick={handleClear}
                        aria-label="검색어 지우기">
                            ×
                        </button>
                </div>
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
    );
};

export default SearchBar;
