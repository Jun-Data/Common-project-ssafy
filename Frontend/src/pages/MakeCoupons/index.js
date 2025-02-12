import React, { useState, useEffect } from "react";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import BottomNav from "../../components/BottomNav/BottomNav";
import MyPageHeader from "../../components/MyPageHeader";
import styled from "styled-components";
// import axios from "axios";
import { DummyCouponTypes } from "../../dummydata/coupontypes";
// import { DummyMakeCoupons } from "../../dummydata/makecoupons";
import { DummyMadeCoupons } from "../../dummydata/madecoupons";

function MakeCoupons() {
    const [count, setCount] = useState(0);
    const [expirationDate, setExpirationDate] = useState("");
    const [couponTypes, setCouponTypes] = useState([]);  // API에서 가져온 쿠폰 유형 리스트
    const [selectedCouponType, setSelectedCouponType] = useState("");  // 선택한 쿠폰 유형
    // const [issuedCoupons, setIssuedCoupons] = useState([]); // 발급된 쿠폰 목록 상태
    const [issuedCoupons, setIssuedCoupons] = useState([...DummyMadeCoupons]); // 더미데이터 발급된 쿠폰 목록 상태

    // 쿠폰 등록 함수
    const handleAddCoupon = async () => {
        if (!selectedCouponType || !count || !expirationDate) {
            alert("모든 항목을 입력하세요."); // 필수항목 입력되지 않으면 등록불가 alert
            return;
        }

        const newCoupon = {
            // couponType: selectedCouponType,
            content : selectedCouponType,
            count: parseInt(count, 10),
            expirationDate,
        };

        DummyMadeCoupons.push(newCoupon);

        alert("쿠폰이 성공적으로 등록되었습니다!");
        fetchIssuedCoupons(); // 최신 쿠폰 목록 다시 불러오기

        // 입력 필드 초기화
        setSelectedCouponType("");
        setCount(0);
        setExpirationDate("");
    };

    //     try {
    //         const response = await axios.post(
    //             "http://i12a506.p.ssafy.io:8000/api/coupon/create",
    //             newCoupon
    //         );

    //         if (response.status === 201) {
    //             alert("쿠폰이 성공적으로 등록되었습니다!");
    //             fetchIssuedCoupons(); // 최신 쿠폰 목록 다시 불러오기

    //             // 입력 필드 초기화
    //             setSelectedCouponType("");
    //             setCount(0);
    //             setExpirationDate("");
    //         }
    //     } catch (error) {
    //         console.error("쿠폰 등록 실패:", error);
    //         alert("쿠폰 등록에 실패했습니다.");
    //     }
    // };

    // 쿠폰 개수 증감
    const increaseCount = () => {
        setCount((prevCount) => prevCount + 1);
    };

    const decreaseCount = () => {
        if (count > 0) {
            setCount((prevCount) => prevCount - 1);
        }
    };

    // 쿠폰 유형을 가져오는 함수 (더미 데이터 사용)
    useEffect(() => {
        setCouponTypes(DummyCouponTypes);  // 더미 데이터로 초기화
    }, []);

    // 발급된 쿠폰 목록을 가져오는 함수 (더미 데이터 사용)
    const fetchIssuedCoupons = () => {
        setIssuedCoupons([...DummyMadeCoupons]);  // 더미 데이터로 초기화
    };
    
    useEffect(() => {
        fetchIssuedCoupons();
    }, []);

    // // 쿠폰 유형을 가져오는 함수
    // useEffect(() => {
    //     const fetchCouponTypes = async () => {
    //         try {
    //             const response = await axios.get(
    //                 "http://i12a506.p.ssafy.io:8000/api/coupon/type"
    //             );
    //             setCouponTypes(response.data);  // 받아온 데이터를 상태에 저장
    //         } catch (error) {
    //             console.error("쿠폰 유형 데이터를 가져오는 데 실패했습니다", error);
    //         }
    //     };

    //     fetchCouponTypes();
    // }, []);

    // // 발급된 쿠폰 목록을 가져오는 함수
    // const fetchIssuedCoupons = async () => {
    //     try {
    //         const response = await axios.get(
    //             "http://i12a506.p.ssafy.io:8000/api/coupon/list"
    //         );
    //         setIssuedCoupons(response.data); // 받은 데이터를 발급된 쿠폰 상태에 저장
    //     } catch (error) {
    //         console.error("발급된 쿠폰 데이터를 가져오는 데 실패했습니다", error);
    //     }
    // };

    useEffect(() => {
        fetchIssuedCoupons();
    }, []);

    return (
        <Container>
            <HeaderContainer />
            <MyPageHeader />
            <h2>쿠폰 등록 페이지</h2>
            <p>여기서 점주가 쿠폰을 등록할 수 있습니다.</p>

            {/* 쿠폰 유형 선택 */}
            <CouponTypeContainer>
                <h3>쿠폰 유형</h3>
                {couponTypes.length > 0 ? (
                    <Select 
                        value={selectedCouponType} 
                        onChange={(e) => setSelectedCouponType(e.target.value)}
                    >
                        <option value="">쿠폰 유형 선택</option>
                        {couponTypes.map((type) => (
                            <option key={type.couponId} value={type.content}>
                                {type.content}
                            </option>
                        ))}
                    </Select>
                ) : (
                    <p>쿠폰 유형을 불러오는 중입니다...</p>
                )}
            </CouponTypeContainer>

            {/* 쿠폰 입력 폼 */}
            <Form>
                <CountWrapper>
                    <Input
                        type="date"
                        placeholder="만료일"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        max="9999-12-31"
                        min="1900-01-01"
                    />
                    <Input
                        type="number"
                        placeholder="쿠폰 수량"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)}
                    />
                    <Button onClick={decreaseCount}>-</Button>
                    <Button onClick={increaseCount}>+</Button>
                </CountWrapper>

                <Button onClick={handleAddCoupon}>쿠폰 등록</Button>
            </Form>

            {/* 발급된 쿠폰 목록 */}
            <IssuedCouponTable>
                <thead>
                    <tr>
                        <th>쿠폰 유형</th>
                        <th>발급 매수</th>
                        <th>만료일</th>
                    </tr>
                </thead>
                <tbody>
                    {issuedCoupons.length > 0 ? (
                        issuedCoupons.map((coupon, index) => (
                            <tr key={index}>
                                <td>{coupon.content}</td>
                                <td>{coupon.count}%</td>
                                <td>{new Date(coupon.expirationDate).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">발급된 쿠폰이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </IssuedCouponTable>

            <BottomNav />
        </Container>
    );
}

export default MakeCoupons;

// Styled Components
const Container = styled.div`
    background: #f8f9fa;
    text-align: center;
`;

const Form = styled.div`
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Input = styled.input`
    width: 80%;
    padding: 15px;
    margin: 10px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
     /* 기본 증감 버튼 숨기기 */
    -moz-appearance: textfield; /* Firefox */
    appearance: textfield; /* 기본 브라우저 */
    
    /* Chrome, Safari, Edge에서 증감 버튼 제거 */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
`;

const CountWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const Button = styled.button`
    padding: 10px 20px;
    font-size: 1rem;
    background-color: #3f72af;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;

    &:hover {
        background-color: #2c5aa0;
    }
`;

const CouponTypeContainer = styled.div`
    margin: 20px auto;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    width: 80%;
    text-align: left;
`;

const Select = styled.select`
    width: 100%;
    padding: 10px;
    margin-top: 10px;
`;

const IssuedCouponTable = styled.table`
    width: 95%;
    border-collapse: collapse;
    margin: 10px auto;
    th, td {
        border: 1px solid #ddd;
        padding: 10px;
    }
    th {
        background-color: #3f72af;
        color: white;
    }
`;

// ## 쿠폰 타입만 보여주는 테스트 페이지
// import React, { useState, useEffect } from "react";
// import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
// import BottomNav from "../../components/BottomNav/BottomNav";
// import MyPageHeader from "../../components/MyPageHeader";
// import styled from "styled-components";
// import axios from "axios";

// function MakeCoupons() {
//     const [coupons, setCoupons] = useState([]);  // 쿠폰 목록 상태 관리

//     // 쿠폰 목록을 가져오는 함수
//     useEffect(() => {
//         const fetchCoupons = async () => {
//             try {
//                 const response = await axios.get('http://i12a506.p.ssafy.io:8000/api/coupon/type');
//                 setCoupons(response.data);  // 응답 받은 쿠폰 데이터 설정
//             } catch (error) {
//                 console.error('쿠폰 목록 가져오기 실패:', error);
//             }
//         };
//         fetchCoupons();
//     }, []);  // 컴포넌트가 처음 렌더링될 때만 호출

//     return (
//         <div>
//             <HeaderContainer />
//             <MyPageHeader />
//             <h2>발급한 쿠폰 목록</h2>

//             <ul>
//                 {coupons.map((coupon) => (
//                     <li key={coupon.couponId}>
//                         <h3>{coupon.name}</h3>
//                         <p>{coupon.content}</p>
//                         <strong>{coupon.discountRate}% 할인</strong>
//                     </li>
//                 ))}
//             </ul>

//             <BottomNav />

//         </div>
//     );
// }

// export default MakeCoupons;

// const Container = styled.div`
//     background: #f8f9fa;
//     text-align: center;
// `;

// const Form = styled.div`
//     margin: 20px 0;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
// `;

// const Input = styled.input`
//     width: 80%;
//     padding: 15px;
//     margin: 10px;
//     font-size: 1rem;
//     border: 1px solid #ccc;
//     border-radius: 8px;
// `;

// const CountWrapper = styled.div`
//     display: flex;
//     align-items: center;
//     gap: 5px;
// `;

// const Button = styled.button`
//     padding: 10px 20px;
//     font-size: 1rem;
//     background-color: #3f72af;
//     color: white;
//     border: none;
//     border-radius: 8px;
//     cursor: pointer;

//     &:hover {
//         background-color: #2c5aa0;
//     }
// `;

// const couponTypeContainer = styled.div`
//     margin: 20px 0;
//     padding: 10px;
//     background-color: #fff;
//     border: 1px solid #ddd;
//     border-radius: 8px;
//     width: 80%;
//     margin: 20px auto;
//     text-align: left;
// `;

// const IssuedCouponTable = styled.table`
//     width: 95%;
//     border-collapse: collapse;
//     margin: 10px auto;

//     th, td {
//         border: 1px solid #ddd;
//         padding: 10px;
//     }

//     th {
//         background-color: #3f72af;
//         color: white;
//     }
// `;