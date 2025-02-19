import { useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchNutritionScroll from "../../components/SearchNutritionScroll";
import './style.css'

const SearchbyNurtrition = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [searchQuery, setSearchQuery] = useState('');

    const coords = {
        lat: queryParams.get('lat'),
        lng: queryParams.get('lng')
    }

    return (
        <div className="searchbynurtritioncontents">
            <div className="nutritionheader"><HeaderContainer/></div>

            {/* 검색 입력 섹션 */}
            <div className="nutritionsearchbar">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="음식 이름으로 검색"
                />
                <button
                    className="nutritionsearchbtn"
                    onClick={() => setSearchQuery('')}
                >
                    x
                </button>
            </div>

            {/* 스크롤 컴포넌트에 검색어 전달 */}
            <div className="nutritionScroll">
                <SearchNutritionScroll
                    coords={coords}
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    )
}

export default SearchbyNurtrition
