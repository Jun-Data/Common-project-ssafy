import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import BottomNav from "../../components/BottomNav/BottomNav";
import RegisterButtons from "../../components/RegisterButtons";
import { useState,useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import KakaoPostcodePopup from "../../components/KakaoPostcodePopup";
import useGeocoding from "../../hooks/useGeocoding";

function OwnerSignUp() {
    const navigate = useNavigate(); 
    const [coords, setCoords] = useState({lat: 37.5015376, lng: 127.0397208});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const { addressToCoord } = useGeocoding();
    const [inputValue, setInputValue] = useState('');
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

    const handleAddressComplete = async (data) => {
        try {
            const newAddress = data.fullAddress;
            
            //주소 업데이트 
            setFormData(prevFormData => ({
                ...prevFormData,
                storeAddress: newAddress // storeAddress에 자동입력력
            }))

            // 좌표 업데이트트
            const newCoords = await addressToCoord(newAddress);
            if (newCoords) {
                console.log('좌표:', newCoords)
                setFormData(prevFormData => ({
                    ...prevFormData,
                    locationX: newCoords.lat,
                    locationY: newCoords.lng
                }));
                setCoords(prevCoords => ({ 
                    ...prevCoords,
                    ...newCoords
                }));
            }
        } catch (error) {
            console.error("지오코딩 실패:", error);
        }
    };

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
            setFormData((prevData) => ({
                ...prevData,
                [name]: value, // 입력값을 그대로 상태에 반영
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }};
    
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

                    // 사업자등록번호 유효성 검사를 통과한 후, 폼에 값 반영
                    setFormData((prevFormData) => ({
                    ...prevFormData,
                    registrationNumber: registrationNumberWithoutHyphens, // 폼에 사업자 등록번호 입력
                }));
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
            case "userName":
                // 이름은 한글 또는 영문으로만 입력을 허용
                const nameRegex = /^[a-zA-Z가-힣]{2,20}$/;  // 2~20자 범위, 영문 또는 한글만
                formErrors.userName = !value || !nameRegex.test(value)
                    ? "이름은 한글 또는 영문으로 2~20자만 입력 가능합니다."
                    : "";
                break;
            case "userEmail":
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                formErrors.userEmail = !value || !emailRegex.test(value)
                    ? "이메일 형식이 올바르지 않습니다. (예: lee@ssafy.com)"
                    : "";
                break;
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
            case "fliMarketSectionCount":
                if (formData.isFliMarketAllowed === 'N') {
                    formData.fliMarketSectionCount = 0;
                    formErrors.fliMarketSectionCount="";
                } else {
                    const sectionCount = parseInt(value, 10);
                    if (isNaN(sectionCount) || sectionCount < 1 || sectionCount > 4) {
                        formErrors.fliMarketSectionCount = "플리마켓 섹션 개수는 1부터 4까지 입력 가능합니다.";
                    } else {
                        formErrors.fliMarketSectionCount = ""; // 에러 메시지 초기화
                    }
                }
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
                    `${process.env.REACT_APP_BACKEND_API_URL}users/store-owner`,
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
                    // 각 필드에 대한 오류 메시지 확인
        Object.keys(formErrors).forEach((key) => {
            if (formErrors[key]) {
                console.log(`${key} 필드 오류: ${formErrors[key]}`);
            }
        });
        }
    };
    
    useEffect(() => {
        console.log('formData 업데이트:', formData);  // formData 변경 시마다 출력
    }, [formData]);  // formData가 변경될 때마다 실행
    


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
                        placeholder="예: 서울 강남구 테헤란로 212"
                        required
                        style={{ borderColor: errors.storeAddress ? 'red' : '#ccc' }}
                    />
                    {errors.storeAddress && <ErrorMessage>{errors.storeAddress}</ErrorMessage>}

                    <button onClick={() => setIsPopupOpen(true)}>
                        주소 찾기
                    </button>
                    {isPopupOpen && (
                    <KakaoPostcodePopup
                        onClose={() => setIsPopupOpen(false)}
                        onComplete={handleAddressComplete}
                    />
                )}
                </InputGroup>

                <InputGroup>
                    <label>사업자 등록번호 <span>*</span></label>
                    <RegistrationNumberInput
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
                    <FleaAllow>플리마켓 허용여부</FleaAllow>
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

                <RegisterButtonsWrapper>
                    <RegisterButtons />
                </RegisterButtonsWrapper>
                <br/>
            </form>
            <BottomNavWrapper>
                <BottomNav />
            </BottomNavWrapper>
        </div>
    );
}

const InputGroup = styled.div`
  margin-top: 15px;
  margin-left: 15px;
  display: flex;
  align-items: ;
  flex-direction: column;
  gap: 10px;
  
  label {
    font-weight: bold;
    display: flex;
    gap: 5px;
    width: 200px;
    
    span {
      color: red;
      font-size: 17px;
    }
  }

  input {
    width: 80%;
    padding: 9px;
    font-size: 13px;
    border: 1px solid #ccc;
    border-radius: 4px;
    &:focus {
      border-color: #007bff;
    }
  }

  button {
    width:25%;
    margin-left: 5px;
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
    margin-bottom: 50px; /* 하단 버튼과 구분을 위한 간격 */
    padding: 15px;
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

const RegistrationNumberInput = styled.input`
  width: 1px; /* 사업자 등록번호 입력창의 너비를 줄이기 */
`;

const FleaAllow = styled.label`
    margin-left: 15px; /* 원하는 만큼 조절 가능 */
    font-weight: bold;

`;

export default OwnerSignUp;