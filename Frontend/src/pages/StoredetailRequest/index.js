import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchApi from "../../api/searchApi";
import RequestApi from "../../api/RequestApi";
import SearchBar from "../../components/SearchBar";
import SearchDropdownList from "../../components/SearchDropdownList";
import './style.css';


// 디바운스 함수 정의
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const StoredetailRequestPopup = () => {
    const [query, setQuery] = useState(""); // 검색어 상태
    const [results, setResults] = useState([]); // API 결과 상태
    const [selectedItem, setSelectedItem] = useState(0);
    const [isDropdownVisible, setDropdownVisible] = useState(false); // 드롭다운 표시 여부
    const [productImage, setProductImage] = useState(null);
    const [message, setMessage] = useState('아이스크림을 검색 후 골라보세요!');
    const navigate = useNavigate();

    // 디바운스를 적용한 API 호출 함수
    const debouncedFetchResults = debounce(async (searchQuery) => {
        try {
            const data = await SearchApi(searchQuery); // SearchApi 호출
            setResults(data); // API 결과 업데이트
            setDropdownVisible(data.length > 0);
        } catch (error) {
            console.error("검색 오류:", error);
        }
    }, 500); // 500ms 지연

    // 검색어 변경 시 디바운스 호출
    const handleQueryChange = (newQuery) => {
        setQuery(newQuery);
        debouncedFetchResults(newQuery);
    };

    const handleItemClick = (item) => {
        setProductImage(item.itemImageUrl)
        console.log("선택된 항목:", item);
        console.log(productImage)
        console.log(item.itemId)
        setSelectedItem(item.itemId);
        setMessage(`${item.itemName}이 선택되었어요!`)
        setDropdownVisible(false); // 선택 후 드롭다운 숨김
    };

    const handleSubmit = async () => {
        const itemId = selectedItem;
        const userId = 1;
        const storeId = 2;
        console.log(itemId)

        if (itemId === 0) {
            alert('제품을 선택 후 제출해주세요');
            return; // 함수 실행 중지
        }

        try {
            // API 호출
            const result = await RequestApi({
                storeId,
                itemId,
                userId,
            });

            // API 응답 처리
            console.log('요청 성공:', result);
            // 추가 성공 처리 로직 (예: 페이지 이동, 상태 업데이트 등)

        } catch (error) {
            console.error('요청 실패:', error);
            // 에러 처리 로직 (예: 에러 메시지 표시)
        }
    };



    return (
        <div>
            <div className="requestheader"><HeaderContainer/></div>
            <div className="storedetailpagerequestpopup">
                <div className="storedetailrequest">
                    <div className="requestnotice">요청하기</div>
                    <div className="requestsearchbar">
                        <SearchBar setQuery={handleQueryChange} />
                    </div>
                    {isDropdownVisible && results?.length > 0 && (
                        <div className="requestdropdown">
                            <SearchDropdownList results={results} onItemClick={handleItemClick} />
                        </div>
                    )}
                    <div className="requestitemimage">
                        <img src={productImage} alt="상품 이미지" />
                        { message }
                    </div>
                    <button onClick={handleSubmit}>제출하기</button>
                    <button onClick={() => navigate(-1)}>닫기</button>
                </div>
            </div>
        </div>
    );
};

export default StoredetailRequestPopup;
