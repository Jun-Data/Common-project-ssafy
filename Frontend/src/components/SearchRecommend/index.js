import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import RecommendApi from "../../api/RecommendApi";
import './style.css';

const SearchRecommend = () => {
    const [recommend, setRecommend] = useState([]); // 추천 리스트 상태
    const [cookies] = useCookies(['userToken']); // 쿠키에서 userToken 읽기
    const userId = cookies?.userToken?.userId; // userId 가져오기

    useEffect(() => {
        if (userId) {
            fetchRecommendations(userId); // 컴포넌트 마운트 시 API 호출
        }
    }, [userId]);

    const fetchRecommendations = async (userId) => {
        try {
            const recommendList = await RecommendApi(userId); // API 호출
            setRecommend(recommendList); // 상태 업데이트
        } catch (error) {
            console.error("추천 리스트를 가져오는 중 오류 발생:", error);
        }
    };

    return (
        <div className="search-recommend">
            <p>인기 추천 제품</p>
            {recommend.length > 0 ? (
                <ul>
                    {recommend.map((item, index) => (
                        <li key={index}>{item.name}</li> // 추천 아이템 렌더링
                    ))}
                </ul>
            ) : (
                <p>추천 리스트가 없습니다.</p>
            )}
        </div>
    );
};

export default SearchRecommend;
