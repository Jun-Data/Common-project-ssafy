import React from "react";
import "./style.css";

const SearchDropdownList = ({ results, onItemClick }) => {
    if (!results || results.length === 0) return null; // 결과가 없으면 렌더링하지 않음

    return (
        <div className="search-dropdown-list">
            {console.log("드롭다운 실행")}
        <ul className="dropdownsearchlist">
            {results.map((item, index) => (
                <li key={index} onClick={() => onItemClick(item)}>
                    {item.itemName}
                </li>
            ))}
        </ul>
        </div>
    );
};

export default SearchDropdownList;
