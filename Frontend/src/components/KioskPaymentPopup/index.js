import React from "react";

import './style.css'

const PaymentPopup = ({ onClose, onConfirm }) => {
    return (
        <div className="payment-popup">
            <div className="payment-content">
                <h2 className="payment-notice">결제 수단 선택</h2>
                <div className="payment-options">
                    <button onClick={() => onConfirm('카카오페이')}
                            className="paybtn1"><img src="/Kakaopay.png"/></button>
                    <button onClick={() => onConfirm('네이버페이')}
                            className="paybtn2"><img src="/NaverPay.png"/></button>
                </div>
                <button className="close-button" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default PaymentPopup;
