import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../components/Button";

const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

function UserSignUp() {
    const navigate = useNavigate(); 

    // 상태 관리 (폼 데이터)
    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
        userTelephone: '',
        userBirth: '',
        userType : "U",
        userPoint : 0
    });

    // 오류 메시지 상태 관리
    const [errors, setErrors] = useState({
        userName: '',
        userEmail: '',
        userTelephone: '',
        userBirth: '',
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
        }  else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };
    
    // 실시간 유효성 검사 함수
    const validateField = (name, value) => {
        let formErrors = { ...errors };
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
            case "userBirth":
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;  // YYYY-MM-DD 형식 정규 표현식
                formErrors.userBirth = !value || !dateRegex.test(value)
                    ? "생년월일은 'YYYY-MM-DD' 형식으로 입력해주세요."
                    : "";
                break;
            default:
                break;
        }

        setErrors(formErrors);
    };

    // onBlur 이벤트를 통해 유효성 검사 실행
    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    // 폼 제출 처리 함수
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
                    `${apiUrl}/api/users/consumer`,
                    formData, // JSON 데이터 전달
                    {
                        headers: {
                            'Content-Type': 'application/json', // JSON 형식으로 보내기 위해 설정
                        },
                    }
                );
                    console.log('서버 응답:', response.data);
                    if (response.status === 200) {
                        Swal.fire({
                            icon: "success",
                            title: "가입 완료!",
                            text: "가입이 성공적으로 완료되었습니다!",
                            confirmButtonText: "확인",
                        }).then(() => {
                            navigate("/");
                        });
                  }
                } catch (error) {
                    console.error('가입 실패:', error);
                    Swal.fire({
                        icon: "error",
                        title: "가입 실패!",
                        text: "가입 중 오류가 발생했습니다. 다시 시도해주세요!",
                        confirmButtonText: "확인",
                    }) 
                }
            } else {
                console.log("입력값에 오류가 있습니다.");
                Swal.fire({
                    icon: "error",
                    title: "가입 실패!",
                    text: "가입 중 오류가 발생했습니다. 다시 시도해주세요!",
                    confirmButtonText: "확인",
                }) 
            }
    };

    const handleBack = (e) => {
        e.preventDefault();  // 기본 동작인 폼 제출을 막는다.
        navigate(-1);  // 이전 페이지로 이동
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
                        type="text"
                        name="userTelephone"
                        value={formData.userTelephone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="예: 010-1234-5678"
                        required
                        style={{ borderColor: errors.userTelephone ? 'red' : '#ccc' }}
                    />
                    {errors.userTelephone && <ErrorMessage>{errors.userTelephone}</ErrorMessage>}
                </InputGroup>

                <InputGroup>
                    <label>생년월일 <span>*</span></label>
                    <input
                        type="date"  // 날짜 선택기를 사용
                        name="userBirth"
                        value={formData.userBirth}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        max="9999-12-31"  // 최대값을 9999-12-31로 설정
                        min="1900-01-01"  // 최소값을 1900-01-01로 설정
                        style={{ borderColor: errors.userBirth ? 'red' : '#ccc' }}
                    />
                    {errors.userBirth && <ErrorMessage>{errors.userBirth}</ErrorMessage>}
                </InputGroup>
                <ButtonContainer>
                <Button type="TERTIARY" onClick={handleBack}>
                        뒤로가기
                    </Button>
                    <Button type="PRIMARY" onClick={handleSubmit}>
                        가입하기
                    </Button>
                </ButtonContainer>
            </form>
        </div>
    );
}

const InputGroup = styled.div`
  margin-bottom: 15px; /* 항목 간 간격 */
  margin-top: 30px;
  label {
    display: block;
    margin-bottom: 8px; /* label과 input 간 간격 */
    font-weight: bold;

    span {
      color: red; 
      font-size: 18px;
    }
  }

  input {
    width: 80%;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    &:focus {
      border-color: #007bff;
    }
  }
`;

const ButtonContainer = styled.div`
display: flex;
justify-content: center; 
gap: 20px;
margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 12px;
  margin-top: 5px;
`;

export default UserSignUp;
