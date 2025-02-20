import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";

function Coupons() {
    const [coupons, setCoupons] = useState([]); // 쿠폰 데이터 상태
    const [error, setError] = useState(null); // 에러 상태
    const [selectedBarcode, setSelectedBarcode] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const modalBackground = useRef();

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/coupon/receive/list`, {
                    withCredentials: true,
                });
                console.log(response)
                console.log("응답 데이터:", response.data);
                setCoupons(response.data);

            } catch (error) {
                setError("쿠폰 데이터를 가져오는데 실패했습니다.");
                console.error("Error:", error);

            }
        };

        fetchCoupons(); // 컴포넌트가 마운트될 때 데이터 로드
    }, []);

    const handleCouponClick = async (coupon) => {
        try {
            // 쿠폰 클릭 시 쿠폰 ID, storeNo, userNo를 포함한 데이터 전송
            const couponData = {
                couponId: coupon.couponId, // 쿠폰 ID
                storeNo: coupon.storeNo, // storeNo (쿠폰 데이터에 맞게 수정)
                userNo: coupon.userNo, // userNo 
            };
            console.log("전송할 쿠폰 데이터:", couponData); 
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/coupon/qrcode`, couponData); // API 요청
            console.log(response.data.qr);
            console.log(response.data.QR);
            setSelectedBarcode(response.data.qr); // 클릭한 쿠폰 바코드 
            setModalIsOpen(true);

        } catch (err) {
            setError("쿠폰 데이터를 가져오는데 실패했습니다.");
            console.error("Error:", error);
        }
    };

    const handleCloseModal = ()=>{
        setModalIsOpen(false);
        setSelectedBarcode(null);
    }

    return (
        <div>
            <HeaderContainer />
            <h2>보유 쿠폰</h2>
            <p>쿠폰을 클릭하여 QR 코드를 생성하고, </p>
            <p>키오스크에서 바로 사용하세요!</p>
            <CouponsContainer>
                {coupons.length === 0 ? (
                    <h2>[ 현재 보유하신 쿠폰이 없습니다 ]</h2>
                ) : (
                    <CouponList>
                        {coupons.map((coupon, index) => (
                            <CouponCard
                                key={index}
                                onClick={() => coupon.usedAt ? null : handleCouponClick(coupon)} // 쿠폰 클릭 시 모달창 바코드
                                style={{
                                    opacity: coupon.usedAt ? 0.5 : 1,
                                    pointerEvents: coupon.usedAt ? "none" : "auto",
                                }}
                            >
                                <CouponContent>
                                    <StoreInfo>
                                        <h3>{coupon.storeName} 매장</h3>
                                        <h3>{coupon.discountRate}% 할인쿠폰</h3>
                                    </StoreInfo>
                                    <CouponText>{coupon.content}</CouponText>
                                    <ExpirationDate>
                                     {coupon.usedAt && <UsedText>이미 사용한 쿠폰</UsedText>}
                                    </ExpirationDate>
                                </CouponContent>
                            </CouponCard>
                        ))}
                    </CouponList>
                )}

                {/* 모달 창 */}
                {modalIsOpen && (
                    <ModalBackground
                        ref={modalBackground}
                        onClick={(e) => {
                            if (e.target === modalBackground.current) {
                                setModalIsOpen(false);
                            }
                        }}
                    >
                        <ModalContent>
                            <h2>쿠폰 QR</h2>
                            {/* Base64 인코딩된 바코드 문자열을 이미지로 변환 */}
                            <BarcodeImage src={`data:image/png;base64,${selectedBarcode}`} alt="쿠폰 바코드" />
                                <Button onClick={handleCloseModal}>닫기</Button>
                        </ModalContent>
                    </ModalBackground>
                )}

            </CouponsContainer>
        </div>
    );
};


const CouponsContainer = styled.div`
  padding: 16px;
`;

const CouponList = styled.div`
  margin-top: 16px;
`;

const CouponCard = styled.div`
  background: linear-gradient(135deg, #f6f9fc,rgb(226, 236, 249));
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
`;

const CouponContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
`;

const StoreInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const CouponText = styled.p`
  font-size: 14px;
  color: #333;
  margin: 10px 0;
`;

const ExpirationDate = styled.p`
  font-size: 12px;
  color: #ff6347;
  margin-top: 5px;
`;

const ModalBackground = styled.div`
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
    background-color: #ffffff;
    width: 90%;
    height: 50%;
    border-radius: 12px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    position: relative;
    justify-content: center; /* 세로축 가운데 정렬 */
    align-items: center; /* 가로축 가운데 정렬 */
    text-align: center;
    gap: 10px;
    padding: 5px;
`;
const Button = styled.button`
    padding: 10px 20px;
    font-size: 1rem;
    background-color: #3f72af;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    &:hover {
        background-color: #3f72af;
    }
`;

const BarcodeImage = styled.img`
  max-width:90%;  /* 이미지가 container 크기에 맞게 조절됨 */
  max-height: 200px;  /* 이미지 최대 높이 설정 */
  object-fit: contain;  /* 이미지 비율을 유지하며 크기를 맞춤 */
`;

const UsedText = styled.p`
  font-size: 12px;
  color: gray;
  font-weight: bold;
  margin-top: 5px;
`;

export default Coupons;
