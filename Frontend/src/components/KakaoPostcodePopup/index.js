import React from "react";
import DaumPostcodeEmbed from "react-daum-postcode";
import "./style.css";
import Button from "../Button"

const KakaoPostcodePopup = ({ onClose, onComplete }) => {
    const handleComplete = (data) => {
        const fullAddress = data.address; // 기본 주소
        const zoneCode = data.zonecode;  // 우편번호
        onComplete({ fullAddress, zoneCode }); // 부모 컴포넌트로 데이터 전달
        onClose(); // 팝업 닫기
    };

    return (
        <div className="mainkakaoaddresspopup">
            <DaumPostcodeEmbed onComplete={handleComplete} />
            <Button type="SECONDARY" onClick={onClose} style={{ padding: "5px 17px", marginTop: "5px"}}>닫기</Button>
        </div>
    );
};

export default KakaoPostcodePopup;
