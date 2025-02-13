import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import KioskHeaderContainer from "../../components/KioskHeaderContainer";
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
        setIsCouponPopupOpen(false); // 쿠폰 팝업 닫기
    };

    const handleCancelCoupon = () => {
        setDiscount(0); // 할인 초기화
        alert("쿠폰이 취소되었습니다.");
    };

    return (
        <div className="kioskmainscreen">
            <div className="mainscreencontainer"><KioskHeaderContainer/></div>
            <div className="mainscreennotice">
                장 바 구 니
                {discount > 0 ? (
                    <button onClick={handleCancelCoupon}>쿠폰 적용 취소</button>
                ) : (
                    <button onClick={() => setIsCouponPopupOpen(true)}>쿠폰 적용</button>
                )}
            </div>
            <div className="mainscreencartpage">
                <Cartpage
                    cartItems={cartItems}
                    onIncrement={handleIncrement}
                    onDecrement={handleDecrement}
                    onRemove={handleRemove}
                />
            </div>
            <div className="cartpagetotal">총 금액: {calculateTotalPrice().toLocaleString()}원</div>
            <div className="kioskpleaproductlist"><KioskFleaproductlist onAddToCart={handleAddToCart}/></div>
            <div className="barcodebuttoncontainer">
                <div className="mainscreenbarcodescanner"><BarcodeScannerComponent onAddToCart={handleAddToCart}/></div>
                <div className="buttonzone">
                    <button className="mainscreenpayment" onClick={() => setIsPaymentPopupOpen(true)}>결제하기</button>
                    <button className="mainscreentohome" onClick={kioskhomeclick}>홈으로</button>
                </div>
            </div>

            {isPaymentPopupOpen && (
                <>
                    <PaymentPopup
                        onClose={() => setIsPaymentPopupOpen(false)}
                        onConfirm={handleConfirmPayment}
                    />
                </>
            )}

            {isCouponPopupOpen && (
                <KioskCouponPopup
                    onClose={() => setIsCouponPopupOpen(false)}
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
