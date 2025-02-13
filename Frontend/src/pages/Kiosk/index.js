import KioskHeaderContainer from "../../components/KioskHeaderContainer";
import userInfoApi from "../../api/UserInfoApi";
import "./style.css"

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

const Kiosk = () => {

    const getUserInfo = userInfoApi();

    return (
        <div className="kiosk">

            <div className="headercontainer1">
                <KioskHeaderContainer/>
            </div>

            <div className="barcode_image">
                <img src="/barcode_icon.png" alt="kioskbarcode"/>
            </div>

            <section className="instructions">
                <p>상품은 <span className="highlight">바코드 스캐너</span>에 찍어주세요!</p>
                <p>플리마켓 제품은 <span className="highlight">키오스크</span>에서 구매하세요!</p>
            </section>

            <a
                href={`localhost:3000/kiosk/main`}
                className="kioskstartbutton"
            >
            {/*<a*/}
            {/*    href={getUserInfo ? `${apiUrl}/kiosk/${getUserInfo?.storeNo}` : '#'}*/}
            {/*    className="kioskstartbutton"*/}
            {/*    onClick={(e) => {*/}
            {/*    if (!getUserInfo) {*/}
            {/*        e.preventDefault();*/}
            {/*        alert("접근 권한이 없습니다");*/}
            {/*    }*/}
            {/*        }}*/}
            {/*    >*/}
            <button
                className={`start_button ${!getUserInfo ? 'disabled' : ''}`}
                // disabled={!getUserInfo}
                >시작하기</button>
               </a>

            <div className="description">
                <img src='/Description.png' alt= "kioskinstruction" />
            </div>
        </div>
    )
}

export default Kiosk
