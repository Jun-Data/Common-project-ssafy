import { useState } from "react";
import KioskHeaderContainer from "../../components/KioskHeaderContainer";
import useAuth from "../../hooks/useAuth";
import "./style.css";

const Kiosk = () => {
    const [storeNo, setStoreNo] = useState("");
    const { logindata } = useAuth();



    return (
        <div className="kiosk">
            <div className="headercontainer1">
                {/* 로그인 및 권한 처리는 KioskHeaderContainer에서 모두 해결 */}
                <KioskHeaderContainer />
            </div>
            <div className="barcode_image">
                <img src="/barcode_icon.png" alt="kioskbarcode" />
            </div>

            <section className="instructions">
                <p>
                    상품은 <span className="highlight">바코드 스캐너</span>에 찍어주세요!
                </p>
                <p>
                    플리마켓 제품은 <span className="highlight">키오스크</span>에서 구매하세요!
                </p>
            </section>

            <a href="http://localhost:3000/kiosk/main" className="kioskstartbutton">
                <button className={`start_button ${!logindata ? "disabled" : ""}`}>
                    시작하기
                </button>
            </a>

            <div className="description">
                <img src="/Description.png" alt="kioskinstruction" />
            </div>
        </div>
    );
};

export default Kiosk;