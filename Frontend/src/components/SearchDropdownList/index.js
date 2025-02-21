import React from "react";
import "./style.css";

const SearchDropdownList = ({ results, onItemClick }) => {
    if (!results || results.length === 0) return null; // 결과가 없으면 렌더링하지 않음
    return (
        <div className="search-dropdown-list">
        <ul>
            {results.map((item, index) => (
                <li key={index} onClick={() => onItemClick(item)}>
                    {item.item_name}
                </li>
            ))}
        </ul>
        </div>
    );
};

export default SearchDropdownList;
