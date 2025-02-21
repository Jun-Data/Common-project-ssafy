import React from 'react';
import KioskCouponScanner from "../KioskCouponScanner";
import "./style.css";

const KioskCouponPopup = ({ onClose, onApplyCoupon }) => {
    return (
        <div className="kiosk-coupon-popup">
            <div className="kiosk-coupon-content">
                <h2 className="kiosk-coupon-notice">쿠폰 바코드 스캔</h2>
                <div className="kiosk-coupon-scanner">
                    <KioskCouponScanner onConfirm= {onApplyCoupon} />
                </div>
                <button className="coupon-close-button" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

export default KioskCouponPopup;
