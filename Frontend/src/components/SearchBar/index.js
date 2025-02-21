import { useState } from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import AddressSearchTrigger from "../AddressSearchTrigger";
import './style.css';

const SearchBar = ({
                       coords,
                       setQuery,
                       onClear,
                       onSearch,
                       address,
                       error,
                       onAddressComplete,
                       setIsManualAddress
                   }) => {
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
        setQuery?.(e.target.value);
    };

    const handleClear = () => {
        if (localQuery) { //검색어 있으면 검색어 비움움
            onClear?.();
            setLocalQuery("");
        } else { // 없으면 메인페이지
            navigate("/");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (localQuery.trim()) {
                onSearch?.(localQuery.trim());
            }
        }
    };

    return (
        <div className="searchbar">
            {(isSearchPage || isStoreDetailPage) && (
                <div className="search-container">
                    <input
                        autoFocus
                        type="text"
                        className="search-input-searchpage"
                        placeholder="검색어를 입력하세요"
                        value={localQuery}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                    />
                    <button
                        className="clear-btn"
                        onClick={handleClear}
                        aria-label="검색어 지우기"
                    >
                        ×
                    </button>
                </div>
            )}

            {!isSearchPage && !isStoreDetailPage && (
                <div className="main-search-container">
                    <input
                        type="text"
                        className="search-input-mainpage"
                        placeholder="원하는 제품을 이름으로 검색해보세요"
                        onClick={handleSearch}
                    />
                    <AddressSearchTrigger
                        className="search-input-address-search"
                        address={address}
                        error={error}
                        onAddressComplete={onAddressComplete}
                        setIsManualAddress={setIsManualAddress}
                    />
                </div>
            )}
        </div>
    );
};

export default SearchBar;
