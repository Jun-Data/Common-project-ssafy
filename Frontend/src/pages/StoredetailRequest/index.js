import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import SearchApi from "../../api/searchApi";
import RequestApi from "../../api/RequestApi";
import SearchBar from "../../components/SearchBar";
import SearchDropdownList from "../../components/SearchDropdownList";
import './style.css';
import Button from "../../components/Button";
import Swal from "sweetalert2";

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
    const { storeNo } = useParams();
    const nStoreNo = Number(storeNo)



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
        setSelectedItem(item.item_id);
        setMessage(`${item.item_name}`);
        setQuery('');
        setDropdownVisible(false); // 선택 후 드롭다운 숨김

    };

    const handleSubmit = async () => {
        const itemId = selectedItem;
        const storeId = nStoreNo;

        if (itemId === 0) {
            Swal.fire({
                icon: "warning",
                title: "제품을 선택해주세요!",
                text: "제품을 선택한 후 제출할 수 있습니다.",
            });
        return; // 함수 실행 중지
        }

        try {
            // API 호출
            const result = await RequestApi({
                storeId,
                itemId,
            });

            Swal.fire({
                icon: "success",
                title: "요청 완료!",
                text: "요청이 성공적으로 전달되었어요!",
            }).then(() => {
                navigate(-1);
            });

        } catch (error) {
            console.error('요청 실패:', error);
            Swal.fire({
                icon: "error",
                title: "오류 발생!",
                html: "다시 시도해주세요. <br>하루 1회만 입고 가능합니다!",
            });
                }
    };

    const handleClear = () => {
        setDropdownVisible(false);
        setResults([]);
    };

    return (
        <div>
            <div className="requestheader"><HeaderContainer/></div>
            <div className="storedetailpagerequestpopup">
                <div className="storedetailrequest">
                    <div className="requestnotice">입고 요청하기</div>
                    <div className="requestsearchbar">
                        <SearchBar setQuery={handleQueryChange} onClear={handleClear} />
                        {isDropdownVisible && results?.length > 0 && (
                            <div className="requestdropdown">
                                <SearchDropdownList
                                    className="request-page-dropdown"
                                    results={results}
                                    onItemClick={handleItemClick}/>
                            </div>
                        )}
                    </div>
                    <div className="requestitemimage">
                        <img
                        src={productImage || '/logo.png'}
                        className="requestitemimageimg"
                        onError={(e) => {
                            e.target.src = '/logo.png';
                        }}
                    />
                        <div className="requestitemimagetxt">{ message }</div>
                    </div>
                    <div className="requestbuttonzone">
                        <Button type="SECONDARY" className="requestbuttons" onClick={() => navigate(-1)}>닫기</Button>
                        <Button type="PRIMARY" className="requestbuttons" onClick={handleSubmit}>요청하기</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoredetailRequestPopup;
