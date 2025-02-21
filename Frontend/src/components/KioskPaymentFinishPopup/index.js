import React, { useState, useEffect } from 'react';
import "./style.css";

const KioskPaymentFinishPopup = ({ onClose }) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // 1초마다 countdown을 감소시키는 타이머 설정
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        // countdown이 0이 되면 onClose 호출 및 타이머 정리
        if (countdown === 0) {
            onClose();
        }

        // 컴포넌트가 언마운트되거나 countdown이 변경될 때 타이머 정리
        return () => clearInterval(timer);
    }, [countdown, onClose]);

    return (
        <div className="kiosk-finish-popup">
            <div className="kiosk-finish-content">
                <h2 className="kiosk-finish-notice">결제가 완료되었습니다.</h2>
                <div className="kiosk-finish-scanner">
                    {countdown}초 후 홈 화면으로 이동합니다.<br/>
                    놓고가신 물건이 없는지 다시한번 확인해주세요!
                </div>
            </div>
        </div>
    );
};

export default KioskPaymentFinishPopup;
