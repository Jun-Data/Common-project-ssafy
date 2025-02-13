import React, { useEffect, useState } from "react";
import RecommendApi from "../../api/RecommendApi";
import './style.css'

const RecommendList = () => {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            const userId = 1; // 예시로 userId를 1로 설정
            try {
                // 추천 데이터를 API에서 가져오기
                const response = await RecommendApi.get(`api/recommend/user`, {
                    params: { userId }, // userId를 쿼리 파라미터로 전달
                });

                // API 응답 데이터가 유효한지 확인 후 상태 업데이트
                if (response && response.data) {
                    setRecommendations(response.data);
                } else {
                    console.error("추천 API에서 데이터를 받지 못했습니다.");
                    setRecommendations([]);
                }
            } catch (error) {
                console.error("추천 데이터를 가져오는 중 오류 발생:", error);
                setRecommendations([]);
            }
        };

        fetchRecommendations();
    }, []);

    return (
        <div>
            <h2>추천 리스트</h2>
            <ul>
                {recommendations.length > 0 ? (
                    recommendations.map((item) => (
                        <li key={item.id}>{item.name}</li> // API 응답에 id와 name이 있다고 가정
                    ))
                ) : (
                    <li>추천 데이터가 없습니다.</li>
                )}
            </ul>
        </div>
    );
};

export default RecommendList;
