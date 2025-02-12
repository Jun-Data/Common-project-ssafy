import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import BottomNav from "../../components/BottomNav/BottomNav";
import RegisterButtons from "../../components/RegisterButtons";
import { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RegisterMap from "../../components/RegisterMap";

function OwnerSignUp() {
    const navigate = useNavigate(); 

    const [formData, setFormData] = useState({
        userName: '', 
        userEmail: '', 
        userTelephone: '',
        userType: 'A',
        userPoint: 0,
        locationX: 37.5665,
        locationY: 126.9783,
        userBirth: '',
        isFliMarketAllowed: 'N',
        storeName: '',
        storeAddress: '',
        registrationNumber: '', 
        fliMarketSectionCount: '0',
    });

    const [errors, setErrors] = useState({
        userName: '', 
        userEmail: '', 
        userTelephone: '',   
        userBirth: '',  
        isFliMarketAllowed: '', 
        storeName: '',
        storeAddress: '',
        registrationNumber: '',
        fliMarketSectionCount: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (name === "userTelephone") {
            let formattedValue = value.replace(/[^0-9]/g, '');  // 숫자만 남기기
        
            // 전화번호가 11자리를 초과하면 초과된 부분을 잘라내기
            if (formattedValue.length > 11) {
                formattedValue = formattedValue.slice(0, 11);  // 11자리까지만 입력
             }
            // 전화화번호 하이픈 추가 로직
            if (formattedValue.length <= 3) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: formattedValue
                }));
            } else if (formattedValue.length <= 7) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: formattedValue.replace(/(\d{3})(\d{0,4})/, '$1-$2')
                }));
            } else if (formattedValue.length <= 11) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: formattedValue.replace(/(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3')
                }));
            } else {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: formattedValue.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
                }));
            }
        } else if (name === "registrationNumber") {
            let formattedValue = value.replace(/[^0-9]/g, '');  // 숫자만 남기기

            // 사업자 등록번호가 10자리를 초과하면 초과된 부분을 잘라내기
             if (formattedValue.length > 10) {
                formattedValue = formattedValue.slice(0, 10);  // 10자리까지만 입력
             }

            // 사업자 등록번호 하이픈 추가 로직
            if (formattedValue.length <= 3) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: formattedValue
                }));
            } else if (formattedValue.length <= 5) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: formattedValue.replace(/(\d{3})(\d{0,2})/, '$1-$2')
                }));
            } else if (formattedValue.length <= 10) {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: formattedValue.replace(/(\d{3})(\d{2})(\d{0,4})/, '$1-$2-$3')
                }));
            } else {
                setFormData((prevData) => ({
                    ...prevData,
                    [name]: formattedValue.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3')
                }));
            }
        } else if (name === "fliMarketSectionCount") {
            let newValue = value.replace(/[^0-9]/g, '');  // 숫자만 남기기
            if (newValue > 4) {
                newValue = 4; // 최대 4까지 입력 가능
            }
            if (newValue <= 0) {
                newValue = 1; // 음수 값은 입력하지 않도록 처리
            }
            setFormData((prevData) => ({
                ...prevData,
                [name]: newValue
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };
    
    const handleCheckboxChange = () => {
        setFormData((prevData) => ({
            ...prevData,
            isFliMarketAllowed: prevData.isFliMarketAllowed === "Y" ? "N" : "Y",
        }));
    };

    const checkregistrationNumber = async () => {
        // 하이픈 제거한 후 숫자만 남기기
        const registrationNumberWithoutHyphens = formData.registrationNumber.replace(/[^0-9]/g, '');
    
        if (registrationNumberWithoutHyphens.length !== 10) {
            setErrors((prev) => ({
                ...prev,
                registrationNumber: "사업자등록번호는 숫자 10자리여야 합니다.",
            }));
            return;
        }
    
        const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${process.env.REACT_APP_Service_API_KEY}`;
    
        try {
            const response = await axios.post(url, { b_no: [registrationNumberWithoutHyphens] });
    
            if (response.data.status_code === "OK") {
                const businessStatusCode = response.data.data[0].b_stt_cd;
                if (businessStatusCode === "01") {
                    // 성공적인 인증 후 처리
                    alert("✅ 사업자등록번호가 정상입니다.");
                    setErrors((prev) => ({
                        ...prev,
                        registrationNumber: "", // 에러 메시지 초기화
                    }));
                } else {
                    alert("❌ 사업자등록번호 유효하지 않음.");
                }
            } else {
                alert("❓ 알 수 없는 응답 상태입니다.");
            }
        } catch (error) {
            alert("사업자등록번호 조회에 실패했습니다.");
        }
    };
    
    const validateField = (name, value) => {
        let formErrors = { ...errors };
        // 필드가 비어있을 때는 에러 메시지를 설정하지 않도록 함
        if (!value) {
            return formErrors;
        }
        switch (name) {
            case "userTelephone":
                const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
                formErrors.userTelephone = !value || !phoneRegex.test(value)
                    ? "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)"
                    : "";
                break;
            case "registrationNumber":
                const registrationNumberRegex = /^\d{3}-\d{2}-\d{5}$/;  // 하이픈 포함 형식으로 검사
                formErrors.registrationNumber = !value || !registrationNumberRegex.test(value)
                    ? "사업자등록번호는 숫자 10자리로 입력해주세요. (하이픈 포함)"
                    : "";
                break;
            case "storeAddress":
                formErrors.storeAddress = !value ? "매장 주소는 필수 입력입니다." : "";
                break;
            default:
                break;
        }
    
        setErrors(formErrors);
    };
    

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleLocationSelect = (lat, lng, storeName, storeAddress) => {
        setFormData((prevData) => ({
            ...prevData,
            locationX: lat,
            locationY: lng,
            storeName: storeName || prevData.storeName,  // 가게명 자동 입력
            storeAddress: storeAddress || prevData.storeAddress, // 주소 자동 입력
        }));
        console.log(`선택한 위치 - 위도: ${lat}, 경도: ${lng}, 가게명: ${storeName}, 주소: ${storeAddress}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("폼 제출 데이터:", formData);
    
        // 데이터 유효성 검사
        const formErrors = { ...errors };
        Object.keys(formData).forEach((key) => {
            validateField(key, formData[key]);
        });
    
        // 유효성 검사에서 오류가 없다면
        if (!Object.values(formErrors).some(error => error !== '')) {
            try {
                // JSON 형식으로 데이터를 변환
                const response = await axios.post(
                    'http://i12a506.p.ssafy.io:8000/api/users/store-owner',
                    formData, // JSON 데이터 전달
                    {
                        headers: {
                            'Content-Type': 'application/json', // JSON 형식으로 보내기 위해 설정
                        },
                    }
                );
                console.log('서버 응답:', response.data);
            if (response.status ===200) {
                alert("가입이 완료되었습니다!")
                navigate("/")
            }
            
            } catch (error) {
                console.error('가입 실패:', error);
                alert("가입 중 오류가 발생했습니다!")
            }
        } else {
            console.log("입력값에 오류가 있습니다.");
        }
    };
    
    return (
        <div>
            <HeaderContainer />
            <form onSubmit={handleSubmit}>
                <InputGroup>
                    <label>이름 <span>*</span></label>
                    <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        style={{ borderColor: errors.userName ? 'red' : '#ccc' }}
                    />
                    {errors.userName && <ErrorMessage>{errors.userName}</ErrorMessage>}
                </InputGroup>

                <InputGroup>
                    <label>이메일 <span>*</span></label>
                    <input
                        type="text"
                        name="userEmail"
                        value={formData.userEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        style={{ borderColor: errors.userEmail ? 'red' : '#ccc' }}
                    />
                    {errors.userEmail && <ErrorMessage>{errors.userEmail}</ErrorMessage>}
                </InputGroup>

                <InputGroup>
                    <label>전화번호 <span>*</span></label>
                    <input
                        type="tel"
                        name="userTelephone"
                        value={formData.userTelephone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="숫자만 입력해주세요"
                        required
                        style={{ borderColor: errors.userTelephone ? 'red' : '#ccc' }}
                    />
                    {errors.userTelephone && <ErrorMessage>{errors.userTelephone}</ErrorMessage>}
                </InputGroup>

                <InputGroup>
                    <label>생년월일 <span>*</span></label>
                    <input
                        type="date"  
                        name="userBirth"
                        value={formData.userBirth}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        max="9999-12-31"  
                        min="1900-01-01"  
                        style={{ borderColor: errors.userBirth ? 'red' : '#ccc' }}
                    />
                    {errors.userBirth && <ErrorMessage>{errors.userBirth}</ErrorMessage>}
                </InputGroup>

                <InputGroup>
                    <label>가게명 <span>*</span></label>
                    <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        style={{ borderColor: errors.storeName ? 'red' : '#ccc' }}
                    />
                    {errors.storeName && <ErrorMessage>{errors.storeName}</ErrorMessage>}
                </InputGroup>

                <InputGroup>
                    <label>매장 주소 <span>*</span></label>
                    <input
                        type="text"
                        name="storeAddress"
                        value={formData.storeAddress}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="예: 서울시 강남구 역삼동 123-45"
                        required
                        style={{ borderColor: errors.storeAddress ? 'red' : '#ccc' }}
                    />
                    {errors.storeAddress && <ErrorMessage>{errors.storeAddress}</ErrorMessage>}
                </InputGroup>

                <InputGroup>
                    <label>사업자등록번호 <span>*</span></label>
                    <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="예: 123-45-67890"
                        required
                        style={{ borderColor: errors.registrationNumber ? 'red' : '#ccc' }}
                    />
                    {errors.registrationNumber && <ErrorMessage>{errors.registrationNumber}</ErrorMessage>}
                    <button type="button" onClick={checkregistrationNumber}>인증하기</button>
                </InputGroup>

                <CheckboxWrapper>
                    <label>플리마켓 허용여부</label>
                    <input
                        type="checkbox"
                        checked={formData.isFliMarketAllowed === "Y"}
                        onChange={handleCheckboxChange}
                    />
                </CheckboxWrapper>

                {formData.isFliMarketAllowed ==="Y" && (
                    <InputGroup>
                        <label>플리마켓 섹션 개수</label>
                        <input
                        type="number"
                            name="fliMarketSectionCount"
                            value={formData.fliMarketSectionCount}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="최대 4개까지 등록가능합니다"
                            required
                            style={{ borderColor: errors.fliMarketSectionCount ? 'red' : '#ccc' }}
                        />
                        {errors.fliMarketSectionCount && <ErrorMessage>{errors.fliMarketSectionCount}</ErrorMessage>}
                    </InputGroup>
                )}
                    <RegisterMap
                        onLocationSelect={handleLocationSelect}
                    />

                <RegisterButtonsWrapper>
                    <RegisterButtons />
                </RegisterButtonsWrapper>
            </form>
            <BottomNavWrapper>
                <BottomNav />
            </BottomNavWrapper>
        </div>
    );
}

const InputGroup = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  label {
    font-weight: bold;
    
    span {
      color: red;
      font-size: 18px;
    }
  }

  input {
    width: 60%;
    padding: 9px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    &:focus {
      border-color: #007bff;
    }
  }

  button {
    width:30%;
    margin-left: 10px;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
  font-size: 15px;
  font-weight: bold;
`;


const RegisterButtonsWrapper = styled.div`
    margin-bottom: 90px; /* 하단 버튼과 구분을 위한 간격 */
    padding: 10px;
    display: flex;
    justify-content: center;
`;

const BottomNavWrapper = styled.div`
    margin-top: 20px;
    
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;



export default OwnerSignUp;