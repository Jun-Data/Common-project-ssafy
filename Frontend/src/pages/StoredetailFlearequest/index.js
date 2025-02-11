import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import FleaRequestApi from "../../api/FleaRequestApi";
import './style.css';

const StoredetailFlearequest = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userAccount: "",
        userBank: "",
        accountName: "",
        itemName: "",
        quantity: 1,
        price: 10000,
        sectionNumber: 1,
        startDate: "",
        expireDate: 30,
        imagePath: "", // Base64 형식으로 저장
    });

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // 이미지 파일 업로드 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    imagePath: reader.result, // Base64 데이터 저장
                });
            };
            reader.readAsDataURL(file); // 파일을 Base64로 변환
        }
    };

    // 폼 제출 핸들러
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("입력된 데이터:", formData);
        FleaRequestApi(formData);
        // API 호출 또는 추가 처리
    };

    return (
        <div className="storedetailpageflearequest">
            <div className="requestheader"><HeaderContainer /></div>
            <div className="requestpopup">
                <div className="storedetailflea">
                    <div className="fleanotice">플리마켓 신청하기</div>
                    <form onSubmit={handleSubmit} className="fleaform">
                        <ul>
                            <li>
                                <label>계좌:</label>
                                <input
                                    type="text"
                                    name="userAccount"
                                    value={formData.userAccount}
                                    onChange={handleChange}
                                    placeholder="계좌번호를 입력하세요"
                                />
                            </li>
                            <li>
                                <label>은행:</label>
                                <input
                                    type="text"
                                    name="userBank"
                                    value={formData.userBank}
                                    onChange={handleChange}
                                    placeholder="은행 이름을 입력하세요"
                                />
                            </li>
                            <li>
                                <label>계좌:</label>
                                <input
                                    type="text"
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleChange}
                                    placeholder="소유주 이름을 입력하세요"
                                />
                            </li>
                            <li>
                                <label>상품:</label>
                                <input
                                    type="text"
                                    name="itemName"
                                    value={formData.itemName}
                                    onChange={handleChange}
                                    placeholder="상품 이름을 입력하세요"
                                />
                            </li>
                            <li>
                                <label>수량:</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    min="1"
                                />
                            </li>
                            <li>
                                <label>가격:</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </li>
                            <li>
                                <label>섹션:</label>
                                <input
                                    type="number"
                                    name="sectionNumber"
                                    value={formData.sectionNumber}
                                    onChange={handleChange}
                                />
                            </li>
                            <li className="datetimeinputfield">
                                <label>시작:</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </li>
                            <li>
                                <label>보관:</label>
                                <input
                                    type="number"
                                    name="expireDate"
                                    value={formData.expireDate}
                                    onChange={handleChange}
                                />
                            </li>
                            {/* 파일 업로드 버튼 */}
                            <li>
                                <label>사진:</label>
                                <input
                                    type="file"
                                    accept="image/*" // 이미지 파일만 허용
                                    onChange={handleFileChange} // 파일 변경 핸들러 호출
                                />
                            </li>
                        </ul>
                        {/* 제출 버튼 */}
                        <button type="submit" className="flearequestsubmitbutton">제출하기</button>
                    </form>

                    {/* 뒤로가기 버튼 */}
                    <button
                        onClick={() => navigate(-1)}
                        className='flearequestbackbutton'>뒤로가기</button>
                </div>
            </div>
        </div>
    );
};

export default StoredetailFlearequest;
