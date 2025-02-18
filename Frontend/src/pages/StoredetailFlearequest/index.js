import { useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import FleaRequestApi from "../../api/FleaRequestApi";
// import './style.css';
import styled from "styled-components";

const StoredetailFlearequest = () => {
    const navigate = useNavigate();
    const { storeNo } = useParams();
    const nStoreNo = Number(storeNo)

    const [formData, setFormData] = useState({
        storeId: nStoreNo,
        userAccount: "",
        userBank: "",
        accountName: "",
        itemName: "",
        quantity: "",
        price: 10000,
        sectionNumber: "",
        startDate: "",
        expirationDate: 30,  // 필드명 통일
        imageUrl: "",
    });
        
    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name==="quantity" && value<0) {
            return;
        }

        // 보관이 음수로 입력되지 않도록 처리
        if (name === "expirationDate" && value < 0) {
            return; // 음수인 값은 무시
        }

        // 섹션은 1에서 4 사이의 값만 허용
        if (name === "sectionNumber") {
            const numValue = Number(value);
            if (numValue < 1 || numValue > 4) {
                return; // 1~4 사이의 값만 허용
            }
        }
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
                    imageUrl: reader.result, // Base64 데이터 저장
                });
            };
            reader.readAsDataURL(file); // 파일을 Base64로 변환
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // API 호출부
        FleaRequestApi(formData);
    }

    return (
        <div>
        <HeaderContainer/>
        <Container>
        <ModalBackground>
        <ModalContent>
            <div className="requestpopup">
                <div className="storedetailflea">
                <Title>플리마켓 신청하기</Title>                    
                <form onSubmit={handleSubmit} className="fleaform">
                        <ul>
                            <ListContainer>
                                <label>은행:</label>
                                <Input
                                    type="text"
                                    name="userBank"
                                    value={formData.userBank}
                                    onChange={handleChange}
                                    placeholder="은행 이름을 입력하세요"
                                />
                            </ListContainer>
                            <ListContainer>
                                <label>계좌1:</label>
                                <Input
                                    type="text"
                                    name="userAccount"
                                    value={formData.userAccount}
                                    onChange={handleChange}
                                    placeholder="계좌번호를 입력하세요"
                                />
                            </ListContainer>
                            <ListContainer>
                                <label>계좌2:</label>
                                <Input
                                    type="text"
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleChange}
                                    placeholder="소유주 이름을 입력하세요"
                                />
                            </ListContainer>
                            <ListContainer>
                                <label>상품:</label>
                                <Input
                                    type="text"
                                    name="itemName"
                                    value={formData.itemName}
                                    onChange={handleChange}
                                    placeholder="상품 이름을 입력하세요"
                                />
                            </ListContainer>
                            <ListContainer>
                                <label>수량:</label>
                                <Input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    min="1"
                                />
                            </ListContainer>
                            <ListContainer>
                                <label>가격:</label>
                                <Input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </ListContainer>
                            <ListContainer>
                                <label>섹션:</label>
                                <Input
                                    type="number"
                                    name="sectionNumber"
                                    value={formData.sectionNumber}
                                    onChange={handleChange}
                                    placeholder="1번부터 4번 섹션중에 선택해주세요"
                                    />
                            </ListContainer>
                            <ListContainer>
                                <label>보관:</label>
                                <Input
                                    type="number"
                                    name="expirationDate"
                                    value={formData.expirationDate}
                                    onChange={handleChange}
                                    placeholder="최대 30일까지 보관가능합니다"
                                />
                            </ListContainer>
                            <ListContainer className="datetimeinputfield">
                                <label>시작:</label>
                                <Input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </ListContainer>
                            {/* 파일 업로드 버튼 */}
                            <ListContainer>
                            <UploadContainer>
                                <label>사진:</label>
                                <FileInput
                                    type="file"
                                    accept="image/*" // 이미지 파일만 허용
                                    onChange={handleFileChange} // 파일 변경 핸들러 호출
                                />
                                </UploadContainer>
                            </ListContainer>
                        </ul>
                        <ButtonContainer>
                        <CloseButton onClick={() => navigate(-1)}>닫기</CloseButton>
                                <Button type="submit" onClick={() => navigate(-1)}>제출하기</Button>
                        </ButtonContainer>
                    </form>
                </div>
            </div>
            </ModalContent>
            </ModalBackground>
            </Container>
        </div>
    );
};

export default StoredetailFlearequest;

const Title = styled.h2`
    margin: 12px;
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
`;

const Container = styled.div`
    font-family: 'Arial', sans-serif;
    background-color: #f4f7fc;
    padding: 20px;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

const ModalBackground = styled.div`
    width: 100%;
    height: 100%;
    position: fixed;
    top: 15px;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
    background-color: #ffffff;
    width: 80%;
    height: 80%;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
    overflow-y: auto;
    max-width: 800px;
`;

const Input = styled.input`
    width: 70%;
    padding: 10px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s ease;

    &:focus {
        border-color: #3f72af;
    }
`;

const ListContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    align-items: center;

    label {
        width: 30%;
        font-weight: bold;
        text-align: left;
    }
`;

const FileInput = styled.input`
    font-size: 0.8rem;
    width: 170px;
`;

const UploadContainer = styled.div`
    display: flex;
    gap: 15px;
    margin-top: 15px;    
    align-items: center;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap: 30px;
`;

const Button = styled.button`
    padding: 12px 20px;
    font-size: 1rem;
    background-color: rgb(117, 153, 202);
    color: white;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #3f72af;
    }
`;

const CloseButton = styled(Button)`
    background-color: rgb(82, 80, 80);

    &:hover {
        background-color: rgb(57, 57, 57);
    }
`;
