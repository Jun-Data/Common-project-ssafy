import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import BarcodeScannerComponent from "../../components/KioskBarcodeScanner";
import Cartpage from "../../components/KioskCartpage";
import KioskFleaproductlist from "../../components/KioskFleaproductlist";
import PaymentPopup from '../../components/KioskPaymentPopup';
import KioskCouponPopup from "../../components/KioskCouponPopup";
import KioskPaymentFinishPopup from "../../components/KioskPaymentFinishPopup";
import './style.css';

const KioskMainScreen = () => {
    const [cartItems, setCartItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [isCouponPopupOpen, setIsCouponPopupOpen] = useState(false);
    const [isPaymentFinish, setIsPaymentFinish] = useState(false);
    const [isCouponPromptOpen, setIsCouponPromptOpen] = useState(false); // 추가된 상태
    const navigate = useNavigate();

    const kioskhomeclick = () => {
        navigate('/kiosk');
    };

    const handleAddToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.itemName === product.itemName);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.itemName === product.itemName
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
    };

    const handleIncrement = (itemName) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.itemName === itemName ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const handleDecrement = (itemName) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.itemName === itemName && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    const handleRemove = (itemName) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.itemName !== itemName));
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0) - discount;
    };

    const handleConfirmPayment = (method) => {
        setIsPaymentPopupOpen(false); // 결제 팝업 닫기
        setCartItems([]); // 결제 후 장바구니 초기화
        setDiscount(0); // 할인 초기화
        setIsPaymentFinish(true);
    };

    const handleApplyCoupon = (couponAmount) => {
        setDiscount(couponAmount);
        alert(`쿠폰이 적용되었습니다! ${couponAmount.toLocaleString()}원 할인`);
        setIsCouponPopupOpen(false);
        setIsPaymentPopupOpen(true); // 쿠폰 적용 후 결제창 자동 호출
    };


    return (
        <div className="kioskmainscreen">
            <div className="mainscreencartpage">
                <Cartpage
                    cartItems={cartItems}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onRemove={handleRemove}
                />
            </div>
            <div className="kioskpleaproductlist"><KioskFleaproductlist onAddToCart={handleAddToCart}/></div>
            <div className="barcodebuttoncontainer">
                <div className="mainscreenbarcodescanner"><BarcodeScannerComponent onAddToCart={handleAddToCart}/></div>
                <div className="buttonzone">
                    <div className="cartpagetotal">총 금액: {calculateTotalPrice().toLocaleString()}원</div>
                    <button
                        className="mainscreenpayment"
                        onClick={() => setIsCouponPromptOpen(true)}>결제하기
                    </button>
                    <button className="mainscreentohome" onClick={kioskhomeclick}>홈으로</button>
                </div>
            </div>
            {/* 쿠폰 적용 확인 팝업 추가 */}
            {isCouponPromptOpen && (
                <div className="coupon-prompt-overlay">
                    <div className="coupon-prompt-content">
                        <h2>쿠폰을 적용하시겠습니까?</h2>
                        <div className="coupon-prompt-buttons">
                            <button
                                onClick={() => {
                                    setIsCouponPromptOpen(false);
                                    setIsCouponPopupOpen(true);
                                }}
                            >
                                예
                            </button>
                            <button
                                onClick={() => {
                                    setIsCouponPromptOpen(false);
                                    setIsPaymentPopupOpen(true);
                                }}
                            >
                                아니오
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 수정된 결제 팝업 호출 방식 */}
            {isPaymentPopupOpen && (
                <PaymentPopup
                    total={calculateTotalPrice()} // 총 금액 전달
                    onClose={() => setIsPaymentPopupOpen(false)}
                    onConfirm={handleConfirmPayment}
                />
            )}

            {/* 쿠폰 팝업 닫힐 때 결제창 자동 호출 */}
            {isCouponPopupOpen && (
                <KioskCouponPopup
                    onClose={() => {
                        setIsCouponPopupOpen(false);
                        setIsPaymentPopupOpen(true); // 쿠폰창 닫으면 결제창 호출
                    }}
                    onApplyCoupon={handleApplyCoupon}
                />
            )}

            {isPaymentFinish && (
                <KioskPaymentFinishPopup onClose={() => {
                    setIsPaymentFinish(false);
                    navigate('/kiosk');
                }} />
            )}
        </div>
    );
};

export default KioskMainScreen;
