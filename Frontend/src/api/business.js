import axios from "axios";

export const handleCheckRegistrationNumber = async (businessNumber) => {
  const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${process.env.REACT_APP_BUSINESS_API_KEY}`;

  try {
    const response = await axios.post(url, {
      b_no: [businessNumber],
    });

    return response.data.data[0].b_stt_cd;  
    // 📌 "01" : 정상 사업자, "02" : 휴업, "03" : 폐업
  } catch (error) {
    console.error("사업자등록번호 조회 오류:", error);
    throw new Error("사업자등록번호 조회에 실패했습니다.");
  }
};
