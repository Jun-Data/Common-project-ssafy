import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KioskHeaderContainer from "../../components/KioskHeaderContainer";
import useAuth from "../../hooks/useAuth";
import "./style.css";

const Kiosk = () => {
    const navigate = useNavigate();
    const { logindata } = useAuth();

    const handleNavigate = () => {
        if (logindata) {
            const storeNumber = logindata.storeNo;
            navigate(`/kiosk/${storeNumber}/main`);
        } else {
            alert("로그인이 필요한 서비스입니다!");
        }
    };

    useEffect(() => {
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.documentElement.style.overflow = 'auto';
        };
    }, []);

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

                <button className={`start_button ${!logindata ? "disabled" : ""}`}
                        onClick={handleNavigate}>
                    시작하기
                </button>

            <div className="description">
                <img src="/Description.png" alt="kioskinstruction" />
            </div>
        </div>
    );
};

export default Kiosk;