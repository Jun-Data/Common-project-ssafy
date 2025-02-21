import React, { useState, useEffect } from "react";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import MyPageHeader from "../../components/MyPageHeader";
import styled from "styled-components";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css";

function MakeCoupons() {
    const [count, setCount] = useState(0);
    const [expirationDate, setExpirationDate] = useState("");
    const [couponTypes, setCouponTypes] = useState([]);  // API에서 가져온 쿠폰 유형 리스트
    const [selectedCouponType, setSelectedCouponType] = useState("");  // 선택한 쿠폰 유형
    const [issuedCoupons, setIssuedCoupons] = useState([]); // 발급된 쿠폰 목록 상태

    // 쿠폰 등록 함수
    const handleAddCoupon = async () => {
        if (!selectedCouponType || !count || !expirationDate) {
            Swal.fire({
                icon: 'warning',
                title: '입력 오류',
                text: '모든 항목을 입력하세요.',
            });            
            return;
        }
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_API_URL}/api/coupon/create`,
                {   couponId: selectedCouponType.couponId, // 선택한 쿠폰 타입의 ID
                    count: count, 
                    expirationDate: expirationDate
                },
                {
                withCredentials: true,}
            );

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: '성공!',
                    text: '쿠폰이 성공적으로 등록되었습니다!',  // 성공 메시지
                });                
                fetchIssuedCoupons(); // 최신 쿠폰 목록 다시 불러오기

                // 입력 필드 초기화
                setSelectedCouponType("");
                setCount(0);
                setExpirationDate("");
            }
        } catch (error) {
            console.error("쿠폰 등록 실패:", error);
            if (error.response?.data?.message?.includes("Duplicate entry")) {
                // 중복 생성 오류 처리
                Swal.fire({
                    icon: 'error',
                    title: '이미 생성된 쿠폰',
                    text: '이미 해당 유형의 쿠폰을 만드셨습니다! 다른 유형을 선택해주세요.',
                });
            } else {
                // 기타 에러 처리
                Swal.fire({
                    icon: 'error',
                    title: '오류 발생',
                    text: '쿠폰 등록에 실패했습니다.',
                });
            }
        }
    };

    // 쿠폰 개수 증감
    const increaseCount = () => {
        setCount((prevCount) => prevCount + 1);
    };

    const decreaseCount = () => {
        if (count > 0) {
            setCount((prevCount) => prevCount - 1);
        }
    };
    
    // 쿠폰 유형을 가져오는 함수
    useEffect(() => {
        const fetchCouponTypes = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/coupon/type`);
                setCouponTypes(response.data);  // 받아온 데이터를 상태에 저장
            } catch (error) {
                console.error("쿠폰 유형 데이터를 가져오는 데 실패했습니다", error);
            }
        };

        fetchCouponTypes();
    }, []);

    // 발급된 쿠폰 목록을 가져오는 함수
    const fetchIssuedCoupons = async () => {
        try {
            const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_API_URL}/api/coupon/list`);
            setIssuedCoupons(response.data); // 받은 데이터를 발급된 쿠폰 상태에 저장
        } catch (error) {
            console.error("발급된 쿠폰 데이터를 가져오는 데 실패했습니다", error);
        }
    };

    useEffect(() => {
        fetchIssuedCoupons();
    }, []);

    return (
        <Container>
            <HeaderContainer />
            <MyPageHeader />
            <h2>쿠폰 등록 페이지</h2>
            <p>매장 이용자들이 사용할 수 있는 쿠폰을 만들어 보세요!</p>

            {/* 쿠폰 유형 선택 */}
            <CouponTypeContainer>
                {couponTypes.length > 0 ? (
                    <Select 
                        value={selectedCouponType?.couponId || ""} 
                        onChange={(e) => {
                            const selectedType = couponTypes.find(type => type.couponId === parseInt(e.target.value, 10));
                            setSelectedCouponType(selectedType);  // 쿠폰 객체로 저장
                        }}
                    >
                        <option value="">쿠폰 유형 선택</option>
                        {couponTypes.map((type) => (
                            <option key={type.couponId} value={type.couponId}>
                                {type.content}
                            </option>
                        ))}
                    </Select>
                ) : (
                    <p>쿠폰 유형을 불러오는 중입니다...</p>
                )}

            {/* 쿠폰 입력 폼 */}
            <Form>
                <StyledDatePicker
                        selected={expirationDate}
                        onChange={(date) => setExpirationDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        minDate={new Date()} 
                        placeholderText="쿠폰 만료일 선택"
                    />
                    <CountContainer>
                    <Input
                        type="number"
                        placeholder="쿠폰 수량"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)}
                    />
                    <CountButton onClick={decreaseCount}>-</CountButton>
                    <CountButton onClick={increaseCount}>+</CountButton>
                    </CountContainer>

                <Button onClick={handleAddCoupon}>쿠폰 등록</Button>
            </Form>
            </CouponTypeContainer>

            {/* 발급된 쿠폰 목록 */}
            <IssuedCouponTable>
                <thead>
                    <tr>
                        <th>쿠폰 유형</th>
                        <th>매수</th>
                        <th>만료일</th>
                    </tr>
                </thead>
                <tbody>
                    {issuedCoupons.length > 0 ? (
                        issuedCoupons.map((coupon, index) => (
                            <tr key={index}>
                                <td>{coupon.content} 할인</td>
                                <td>{coupon.count} 장</td>
                                <td>{new Date(coupon.expirationDate).toLocaleDateString('ko-KR')}</td>
                                </tr>
                        ))
                    ) : (
                    <tr>
                        <td colSpan={issuedCoupons.length > 0 ? 1 : 3}>발급된 쿠폰이 없습니다.</td>
                    </tr>
                    )}
                </tbody>
            </IssuedCouponTable>
        </Container>
    );
}

export default MakeCoupons;

const Container = styled.div`
    text-align: center;
    min-height: 100vh;
`;

const Form = styled.div`
    align-items: center;
    width: 90%;
    background: white;
    border-radius: 12px;
    margin-top: 10px;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    margin: 8px 0;
    font-size: 1rem;
    border: 1px solid #d1d8e0;
    border-radius: 8px;
    box-sizing: border-box;
    transition: border-color 0.3s ease;

    &:focus {
        border-color: #3f72af;
        outline: none;
    }

    /* 기본 증감 버튼 숨기기 */
    -moz-appearance: textfield;
    appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
`;

const Button = styled.button`
    padding: 12px 20px;
    font-size: 1rem;
    background: linear-gradient(135deg, #3f72af, #2c5aa0);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 110%;
    margin-top: 10px;
    font-weight: bold;
    box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);

    &:hover {
        background: linear-gradient(135deg, #2c5aa0, #1f487e);
        transform: translateY(-2px);
        box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
    }
`;

const CountButton = styled.button`
    padding: 10px;   
    background-color: #3f72af;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 7px;
    border: none;
    color: white;
    font-weight: bold;
    transition: background-color 0.2s ease;
    
    &:hover {
        background-color: #2c5aa0;
    }
`;
const CountContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const CouponTypeContainer = styled.div`
    margin: 20px auto;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    width: 86%;
    max-width: 400px;
    text-align: left;

    h3 {
        margin-bottom: 10px;
        color: #2c3e50;
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 12px;
    font-size: 1rem;
    border: 1px solid #d1d8e0;
    border-radius: 8px;
    transition: border-color 0.3s ease;
    background: white;

    &:focus {
        border-color: #3f72af;
        outline: none;
    }
`;

const IssuedCouponTable = styled.table`
    width: 97%;
    border-collapse: collapse;
    margin: 20px auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    white-space: nowrap;


    th, td {
        border: 1px solid #ddd;
        padding: 12px;
        font-size: 1rem;
    }

    th {
        background-color: #3f72af;
        color: white;
    }

    td {
        text-align: center;
    }
`;

const StyledDatePicker = styled(DatePicker)`
    width: 100%;
    padding: 12px;
    font-size: 1rem;
    border: 1px solid #d1d8e0;
    border-radius: 8px;
    text-align: center;
    transition: border-color 0.3s ease;

    &:focus {
        border-color: #3f72af;
        outline: none;
    }
`;
