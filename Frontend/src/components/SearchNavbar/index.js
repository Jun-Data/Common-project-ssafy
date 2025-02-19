import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './style.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBowlFood } from "@fortawesome/free-solid-svg-icons";

const SearchNavbar = ({lat, lng}) => {
    const navigate = useNavigate()
    const handlenavigate = () => {
        navigate(`/searchbynutrition?lat=${lat}&lng=${lng}`);
    }

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        // 키보드 활성화 상태를 감지하는 함수
        const handleResize = () => {
            if (window.innerHeight < 600) { // 화면 높이가 특정 값보다 작아지면 키보드 활성화로 간주
                setKeyboardVisible(true);
            } else {
                setKeyboardVisible(false);
            }
        };

        // 이벤트 리스너 등록
        window.addEventListener('resize', handleResize);

        // 컴포넌트 언마운트 시 이벤트 리스너 정리
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <button
            onClick={handlenavigate}
            className="searchnavbarr"
            style={{
                bottom: isKeyboardVisible ? '50px' : '0', // 키보드가 보이면 50px 위로 이동
                fontSize: "16px",
                fontWeight: "bold",
                padding: "12px 20px",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease-in-out",
                backgroundColor: "#dbe2ef",
                marginTop: "30px",
            }}
        >
            <FontAwesomeIcon icon={faBowlFood} />  영양분으로 검색하기
        </button>
    );
};

export default SearchNavbar;
