import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FleaRequestApi from "../../api/FleaRequestApi";
// import './style.css';
import styled from "styled-components";
import Swal from "sweetalert2";
import Button from "../../components/Button";

const StoredetailFlearequest = () => {
  const navigate = useNavigate();
  const { storeNo } = useParams();
  const nStoreNo = Number(storeNo);
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
    expirationDate: 30, // 필드명 통일
    imageUrl: "",
  });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantity" && value < 0) {
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
    // 입력값 검사
    if (
      !formData.userBank ||
      !formData.userAccount ||
      !formData.accountName ||
      !formData.itemName ||
      !formData.quantity ||
      !formData.price ||
      !formData.sectionNumber ||
      !formData.expirationDate ||
      !formData.startDate ||
      !formData.imageUrl
    ) {
      Swal.fire({
        icon: "warning",
        title: "입력 오류",
        text: "모든 필드를 입력해 주세요.",
        confirmButtonText: "확인",
      });
      return; // 제출을 막음
    }
    // API 호출부
    FleaRequestApi(formData);
    navigate(-1); // 제출 후 이전 페이지로 이동
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // 내일 날짜로 설정

    // 내일 날짜를 로컬 시간대 기준으로 "YYYY-MM-DDTHH:mm" 형식으로 반환
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0"); // 월을 2자리로 맞추기
    const day = String(tomorrow.getDate()).padStart(2, "0");
    const hours = String(tomorrow.getHours()).padStart(2, "0");
    const minutes = String(tomorrow.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 내일 날짜로 초기화
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      startDate: getTomorrowDate(),
    }));
  }, []);

  const handleBack = (e) => {
    e.preventDefault(); // 기본 동작인 폼 제출을 막는다.
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <div>
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
                      <label>계좌:</label>
                      <Input
                        type="text"
                        name="userAccount"
                        value={formData.userAccount}
                        onChange={handleChange}
                        placeholder="계좌번호를 입력하세요"
                      />
                    </ListContainer>
                    <ListContainer>
                      <label>소유주:</label>
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
                        placeholder="1 ~ 4번 섹션중에 선택해주세요"
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
                        min={getTomorrowDate()} // 최소값을 내일로 설정
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
                    <Button type="PRIMARY" onClick={handleBack}>
                      닫기
                    </Button>
                    <Button type="SECONDARY">신청하기</Button>
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
  font-family: "Arial", sans-serif;
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
  top: 0;
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
  max-height: 80vh;
  overflow-y: auto; /* 세로 스크롤 허용 */
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

// const Button = styled.button`
//     padding: 12px 20px;
//     font-size: 1rem;
//     background-color: rgb(117, 153, 202);
//     color: white;
//     border: none;
//     border-radius: 7px;
//     cursor: pointer;
//     transition: background-color 0.3s ease;

//     &:hover {
//         background-color: #3f72af;
//     }
// `;

// const CloseButton = styled(Button)`
//     background-color: rgb(82, 80, 80);

//     &:hover {
//         background-color: rgb(57, 57, 57);
//     }
// `;
