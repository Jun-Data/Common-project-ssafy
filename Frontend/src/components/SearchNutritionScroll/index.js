import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NutritionSearchEmptyApi from "../../api/NutritionSearchEmptyApi";
import NutritionSearchApi from "../../api/NutritionSearchApi";
import './style.css'

const SearchNutritionScroll = ({ coords, searchQuery }) => {
    const navigate = useNavigate();
    const [maxSugar, setMaxSugar] = useState(100);
    const [maxCal, setMaxCal] = useState(500);
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    console.log(searchQuery);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let result;
                if (searchQuery) {
                    // 검색어 있을 때: 일반 검색 API 사용
                    result = await NutritionSearchApi(maxSugar, maxCal, searchQuery);
                } else {
                    // 검색어 없을 때: 기본 필터 API 사용
                    result = await NutritionSearchEmptyApi(maxSugar, maxCal);
                }
                setItems(result || []);
                setError(null);
            } catch (err) {
                setError('데이터 로딩에 실패했습니다');
                setItems([]);
            }
        };
        fetchData();
    }, [maxSugar, maxCal, searchQuery]); // 검색어 변경 감지


    return (
        <div className="scrollcontents">
            <div className="scrollnotice">영양분으로 검색하기</div>

            <div className="scrollui">
                <label>
                    <p>당 함유량: {maxSugar}</p>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={maxSugar}
                        onChange={(e) => setMaxSugar(Number(e.target.value))}
                    />
                </label>
                <label>
                    <p>칼로리: {maxCal}</p>
                    <input
                        type="range"
                        min="0"
                        max="500"
                        value={maxCal}
                        onChange={(e) => setMaxCal(Number(e.target.value))}
                    />
                </label>
            </div>

            <div className="nutritionsearchresult">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {!error && items.length === 0 && <p>데이터가 없습니다.</p>}
                {!error && items.length > 0 && (
                    <ul className="nutritionul">
                        {items.map((item) => (
                            <li
                                className="nutritionli"
                                key={item.item_id}
                                onClick={() =>
                                    navigate(
                                        `/search/results?lat=${coords.lat}&lng=${coords.lng}&itemId=${item.item_id}&itemName=${item.item_name}`
                                    )
                                }
                            >
                                <img
                                    src={item.itemImageUrl} // 이미지 URL
                                    alt={item.item_name}
                                    className="nutrition-image"
                                />
                                <span className="nutrition-text">{item.item_name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SearchNutritionScroll;
