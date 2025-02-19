import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import BarcodeScannerComponent from "../../components/KioskBarcodeScanner";
import Cartpage from "../../components/KioskCartpage";
import KioskFleaproductlist from "../../components/KioskFleaproductlist";
import PaymentPopup from '../../components/KioskPaymentPopup';
import KioskCouponPopup from "../../components/KioskCouponPopup";
import KioskPaymentFinishPopup from "../../components/KioskPaymentFinishPopup";
import './style.css';

const KioskMainScreen = () => {
    const [state, setState] = useState({
        cartItems: [],
        discount: 0,
        isPaymentPopupOpen: false,
        isCouponPopupOpen: false,
        isPaymentFinish: false,
        isCouponPromptOpen: false
    });
    const navigate = useNavigate();

    const updateState = (newState) => {
        setState(prev => ({ ...prev, ...newState }));
    };

    const handleCartOperation = (operation) => {
        setState(prev => ({
            ...prev,
            cartItems: operation(prev.cartItems)
        }));
    };

    const handleAddToCart = (product) => {
        handleCartOperation((prevItems) => {
            const existing = prevItems.find((item) => item.id === product.id);
            if (existing) {
                // Check if adding more exceeds stock
                if (existing.quantity + 1 > product.quantity) {
                    alert(`재고가 부족합니다. 최대 ${product.quantity}개까지 담을 수 있습니다.`);
                    return prevItems; // Return without changes
                }
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Check if initial quantity exceeds stock
                if (product.quantity < 1) {
                    alert(`재고가 부족합니다.`);
                    return prevItems;
                }
                return [
                    ...prevItems,
                    { ...product, quantity: 1, itemName: product.itemName || product.fliItemName },
                ];
            }
        });
    };

    const handleIncrement = (itemName) => {
        handleCartOperation((prevItems) =>
            prevItems.map((item) => {
                if (item.itemName === itemName) {
                    // Check if increment exceeds stock
                    if (item.quantity + 1 > item.stockQuantity) {
                        alert(`재고가 부족합니다. 최대 ${item.stockQuantity}개까지 담을 수 있습니다.`);
                        return item; // No change to the item
                    }
                    return { ...item, quantity: item.quantity + 1 };
                }
                return item;
            })
        );
    };
    const handleDecrement = (itemName) => {
        handleCartOperation(prevItems =>
            prevItems.map((item) =>
                item.itemName === itemName && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    const handleRemove = (itemName) => {
        handleCartOperation(prevItems =>
            prevItems.filter(item => item.itemName !== itemName)
        );
    };

    const calculateTotalPrice = () => {
        return state.cartItems.reduce((total, item) =>
            total + item.price * item.quantity, 0) - state.discount;
    };

    const handleConfirmPayment = (method) => {
        updateState({
            isPaymentPopupOpen: false,
            cartItems: [],
            discount: 0,
            isPaymentFinish: true
        });
    };

    const handleApplyCoupon = (couponAmount) => {
        updateState({
            discount: couponAmount,
            isCouponPopupOpen: false,
            isPaymentPopupOpen: true
        });
        alert(`쿠폰이 적용되었습니다! ${couponAmount.toLocaleString()}원 할인`);
    };


    return (
        <div className="kioskmainscreen">
            <div className="mainscreencartpage">
                <Cartpage
                    cartItems={state.cartItems}
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
                        onClick={() => updateState({ isCouponPromptOpen: true })}>결제하기
                    </button>
                    <button className="mainscreentohome" onClick={() => navigate("/kiosk")}>홈으로</button>
                </div>
            </div>
            {/* 쿠폰 적용 확인 팝업 추가 */}
            {state.isCouponPromptOpen && (
                <div className="coupon-prompt-overlay">
                    <div className="coupon-prompt-content">
                        <h2>쿠폰을<br/><br/>적용하시겠습니까?</h2>
                        <div className="coupon-prompt-buttons">
                            <button
                                onClick={() => {
                                    updateState({
                                    isCouponPromptOpen: false,
                                    isCouponPopupOpen: true
                                    })
                                }}
                            >
                                예
                            </button>
                            <button
                                onClick={() => updateState({
                                    isCouponPromptOpen: false,
                                    isPaymentPopupOpen: true
                                })}
                            >
                                아니오
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 수정된 결제 팝업 호출 방식 */}
            {state.isPaymentPopupOpen && (
                <PaymentPopup
                    total={calculateTotalPrice()}
                    onClose={() => updateState({ isPaymentPopupOpen: false })}
                    onConfirm={handleConfirmPayment}
                />
            )}

            {/* 쿠폰 팝업 닫힐 때 결제창 자동 호출 */}
            {state.isCouponPopupOpen && (
                <KioskCouponPopup
                    onClose={() => updateState({
                        isCouponPopupOpen: false,
                        isPaymentPopupOpen: true
                    })}
                    onApplyCoupon={handleApplyCoupon}
                />
            )}

            {state.isPaymentFinish && (
                <KioskPaymentFinishPopup
                    onClose={() => {
                        updateState({ isPaymentFinish: false });
                        navigate('/kiosk');
                    }}
                />
            )}
        </div>
    );
};

export default KioskMainScreen;
