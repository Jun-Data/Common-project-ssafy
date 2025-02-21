import React from "react";
import './style.css'

function KioskList() {
    return (
        <div className="kiosklist">
            <div className="text1">선택하신 주문내역</div>
            <div className="text2">주문금액</div>
            <div className="text3">수량</div>
        </div>
    );
}

export default KioskList;