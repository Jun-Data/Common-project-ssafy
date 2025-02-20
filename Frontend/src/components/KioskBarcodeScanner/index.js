import { useState } from "react";
import { useParams } from "react-router-dom";
import { BarcodeScanner } from "@thewirv/react-barcode-scanner";
import apiClient from "../../api/apiClient";

const BarcodeScannerComponent = ({ onAddToCart }) => {
  const [isScanningAllowed, setIsScanningAllowed] = useState(true);
  const { storeNo } = useParams();

  const handleScanSuccess = async (scannedData) => {
    if (!isScanningAllowed) return;

    setIsScanningAllowed(false);
    setTimeout(() => setIsScanningAllowed(true), 4000);

    try {
      const barcode = scannedData;

      // apiClient를 사용하여 API 호출
      const response = await apiClient.get("api/kiosk/scan", {
        params: { storeNo, barcode },
      });

      const product = response.data;
      console.log(product);

      if (response.status === 200) {
        onAddToCart({
          itemId: product.itemId,
          itemName: product.itemName,
          price: product.price,
        });
      } else {
        console.error(product.message || "알 수 없는 오류");
      }
    } catch (error) {
      console.error(error);

      if (error.response && error.response.data) {
        console.error(
          `테스트 API 호출 중 오류가 발생했습니다: ${error.response.data.message}`
        );
      } else {
        console.error("테스트 API 호출 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <BarcodeScanner
      onSuccess={handleScanSuccess}
      constraints={{ facingMode: "user" }}
      onError={(error) => console.error("스캐너 오류:", error)}
    />
  );
};

export default BarcodeScannerComponent;
