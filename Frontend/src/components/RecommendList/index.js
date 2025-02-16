import React, { useEffect, useState } from "react";
import RecommendApi from "../../api/RecommendApi";
import './style.css'

const RecommendList = ({ userNo }) => {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // ✅ 올바른 API 함수 호출 방식
                const data = await RecommendApi(userNo);

                // ✅ 응답 데이터 직접 사용
                if (!userNo) {
                    setRecommendations(null);
                } else {
                    console.log("추천 데이터가 없습니다.");
                    setRecommendations([]);
                }
            } catch (error) {
                console.error("추천 데이터 가져오기 실패:", error);
                setRecommendations([]);
            }
        };

        fetchRecommendations();
    }, [userNo]); // ✅ userId 종속성 추가

    return (
        <div>
            <h2>추천 리스트</h2>
            <ul>
                { userNo ? (
                    recommendations.map((item) => (
                        <li key={item.id}>{item.name}</li> // API 응답에 id와 name이 있다고 가정
                    ))
                ) : (
                    <li>로그인을 하시면 제품을 추천해드려요!</li>
                )}
            </ul>
        </div>
    );
};

export default RecommendList;
