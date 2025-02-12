import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './style.css'


const SearchNutritionScroll = () => {
    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const lat = queryParams.get('lat');
    const lng = queryParams.get('lng');


    // 상태 관리
    const [maxSugar, setMaxSugar] = useState(100);
    const [maxCal, setMaxCal] = useState(500);
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    // API 호출 함수
    const fetchItems = async (maxSugar, maxCal) => {
        try {
            const response = await axios.get(`${apiUrl}/api/items/search`, {
                params: {
                    minSugar: 0, // 항상 0으로 고정
                    maxSugar,
                    minCal: 0, // 항상 0으로 고정
                    maxCal,
                },
            });
            setItems(response.data); // 받아온 데이터를 상태에 저장
        } catch (err) {
            console.error('API 호출 중 오류 발생:', err);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 값이 변경될 때마다 API 호출
    useEffect(() => {
        fetchItems(maxSugar, maxCal);
    }, [maxSugar, maxCal]);

    return (
        <div className="scrollcontents">
            <div className="scrollnotice">영양분으로 검색하기</div>
            <div className="scrollui">
                <label>
                    Sugar (Max): {maxSugar}&nbsp;&nbsp;&nbsp;
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={maxSugar}
                        onChange={(e) => setMaxSugar(Number(e.target.value))}
                    />
                </label><br/>
                <label>
                    Calories (Max): {maxCal}
                    <input
                        type="range"
                        min="0"
                        max="500"
                        value={maxCal}
                        onChange={(e) => setMaxCal(Number(e.target.value))}
                    />
                </label><br/>
            </div>

            <div className="nutritionsearchresult">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {!error && items.length === 0 && <p>데이터가 없습니다.</p>}
                {!error && items.length > 0 && (
                    <ul className="nutritionul">
                        {items.map((item) => (
                            <li className='nutritionli'
                                key={item.itemId}
                                onClick={() => navigate(`search/results?lat=${lat}&lng=${lng}&itemId=${item.itemId}`)}>
                                {item.itemName}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SearchNutritionScroll;
