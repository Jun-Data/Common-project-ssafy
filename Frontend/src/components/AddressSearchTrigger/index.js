import { useState } from 'react';
import KakaoPostcodePopup from '../../components/KakaoPostcodePopup';
import './style.css'

const AddressSearchTrigger = ({ address, error, onAddressComplete, setIsManualAddress }) => {
    const [showAddressPopup, setShowAddressPopup] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowAddressPopup(true)}
                className="addressTriggerButton"
                aria-label="현재 위치 확인"
            >
                <img src='/mylocation.png' alt="현재 위치" />
            </button>

            {showAddressPopup && (
                <div className="address-popup-overlay">
                    <div className="address-popup-content">
                        <div className="popup-header">
                            <h3>현재 위치</h3>
                            <button
                                onClick={() => setShowAddressPopup(false)}
                                className="popup-close-btn"
                            >
                                ×
                            </button>
                        </div>

                        <div className="address-info">
                            <img src='/mylocation.png' className="address-marker" alt="위치 마커" />
                            <div className="address-text">
                                {error ? "위치 정보를 가져오는 중..." : address}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsPopupOpen(true);
                                setShowAddressPopup(false);
                            }}
                            className="address-search-btn"
                        >
                            주소 재검색
                        </button>
                    </div>
                </div>
            )}

            {isPopupOpen && (
                <KakaoPostcodePopup
                    onClose={() => setIsPopupOpen(false)}
                    onComplete={async (data) => {
                        const fullAddress = data.fullAddress;
                        onAddressComplete(fullAddress);
                        setIsManualAddress(true);
                        setIsPopupOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default AddressSearchTrigger;
