import React, { useState } from 'react';
import { BarcodeScanner } from '@thewirv/react-barcode-scanner';
import apiClient from '../../api/apiClient';

const BarcodeScannerComponent = ({ onAddToCart }) => {
    const [isCameraActive, setIsCameraActive] = useState(true);
    const [isScanningAllowed, setIsScanningAllowed] = useState(true);

    const handleScanSuccess = async () => {
        if (!isScanningAllowed) return;

        setIsScanningAllowed(false);
        setTimeout(() => setIsScanningAllowed(true), 1000);

        try {
            const storeNo = 1;
            const barcode = 8801118250590;

            // apiClient를 사용하여 API 호출
            const response = await apiClient.get('api/kiosk/scan', {
                params: { storeNo, barcode },
            });

            const product = response.data;

            if (response.status === 200) {
                alert('테스트 API 호출 성공!');
                onAddToCart({
                    id: product.itemId,
                    itemName: product.itemName,
                    price: product.price,
                });
            } else {
                console.error('API 요청 실패:', product.message || '알 수 없는 오류');
                alert('테스트 API 호출 실패!');
            }
        } catch (error) {
            console.error('테스트 API 호출 중 오류 발생:', error);

            if (error.response && error.response.data) {
                alert(`테스트 API 호출 중 오류가 발생했습니다: ${error.response.data.message}`);
            } else {
                alert('테스트 API 호출 중 알 수 없는 오류가 발생했습니다.');
            }
        }
    };

    // 카메라 활성화 상태를 관리하는 버튼 추가 (필요 시)
    const toggleCamera = () => {
        setIsCameraActive((prevState) => !prevState);
    };

    return (
        <div>
                <BarcodeScanner
                    onSuccess={handleScanSuccess}
                    onError={(error) => console.error('스캐너 오류:', error)}
                />
        </div>
    );
};

export default BarcodeScannerComponent;
