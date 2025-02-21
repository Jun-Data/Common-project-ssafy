import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import MyPageHeader from "../../components/MyPageHeader";
import styled from 'styled-components';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';

const FleaRequests = () => {
  const {logindata} = useAuth();
  const [requests, setRequests] = useState([]); // 요청 목록을 배열로 저장
  const [selectedRequest, setSelectedRequest] = useState(null); //단일 요청 목록

  useEffect(() => {
    const fetchFleaMarketRequests = async () => {
      try {
        if (logindata) {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/fli/list`);
          setRequests(response.data); // API 응답 데이터를 requests 상태에 저장
        }
      } catch (error) {
        console.error("플리마켓 요청 목록 가져오기 실패", error);
      }
    };
    fetchFleaMarketRequests();
  }, [logindata]); // logindata가 변경될 때마다 API를 다시 호출

  const handleAccept = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/fli/check`,{
        itemName: selectedRequest.itemName,
        userId : selectedRequest.userId,
      });
      console.log("승인된 요청:", selectedRequest.itemName, selectedRequest.userId);
      // 요청 목록에서 승인된 요청 제거
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.itemName !== selectedRequest.itemName || request.userId !== selectedRequest.userId)
      );
      Swal.fire({
        title: "승인 완료!",
        text: `${selectedRequest.itemName} 요청이 승인되었습니다.`,
        icon: "success",
        confirmButtonText: "확인"
      });
      setSelectedRequest(null);
    } catch (error) {
      console.error("요청 승인 실패",error);
      Swal.fire({
        title: "승인 실패!",
        text: "요청 승인 중 오류가 발생했습니다.",
        icon: "error",
        confirmButtonText: "확인"
      });
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/fli/reject`,{
        itemName: selectedRequest.itemName,
        userId : selectedRequest.userId,
      });
      console.log("거절된 요청:", selectedRequest.itemName, selectedRequest.userId);
      // 요청 목록에서 거절된 요청 제거
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.itemName !== selectedRequest.itemName || request.userId !== selectedRequest.userId)
      );
      Swal.fire({
        title: "거절 완료!",
        text: `${selectedRequest.itemName} 요청이 거절되었습니다.`,
        icon: "warning",
        confirmButtonText: "확인"
      });
      setSelectedRequest(null);
    } catch (error) {
      console.error("요청 거절 실패",error);
      Swal.fire({
        title: "거절 실패!",
        text: "요청 거절 중 오류가 발생했습니다.",
        icon: "error",
        confirmButtonText: "확인"
      });
    }
  };

  return (
    <div>
      <HeaderContainer />
      <MyPageHeader />
      <Title>플리마켓 요청 목록</Title>
      <p>플리마켓 판매 요청을 검토하고 승인 또는 거절하세요!</p>

      <Container>
      {requests.length > 0 ? (
        requests.map((request, index) => ( // 요청 목록을 반복하여 출력
          <RequestCard key={index} onClick={()=> setSelectedRequest(request)}>
            <RequestItem><strong>판매 물품:</strong> {request.itemName}</RequestItem>
            <RequestItem><strong>수량:</strong> {request.quantity}</RequestItem>
            <RequestItem><strong>섹션 번호:</strong> {request.sectionNumber}</RequestItem>
            <RequestItem><img src={request.imageUrl} alt={request.itemName} style={{ width: '100px', height: '100px', objectFit: 'cover' }} /></RequestItem>
          </RequestCard>
        ))
      ) : (
        <NoRequests>플리마켓 요청이 없습니다</NoRequests>
      )}
      </Container>
      {selectedRequest && (
        <ModalOverlay>
          <ModalContent>
            <h3>플리리 요청 상세</h3>
            <RequestItem><strong>아이템 이름:</strong> {selectedRequest.itemName}</RequestItem>
            <RequestItem><strong>수량:</strong> {selectedRequest.quantity}</RequestItem>
            <RequestItem><strong>가격:</strong> {selectedRequest.price}원</RequestItem>
            <RequestItem><strong>입고 기간:</strong> {selectedRequest.expirationDate}일</RequestItem>
            <RequestItem><strong>판매자 계좌 정보:</strong> {selectedRequest.userAccount} ({selectedRequest.userBank}, {selectedRequest.accountName})</RequestItem>
            <RequestItem><img src={selectedRequest.imageUrl} alt={selectedRequest.itemName} style={{ width: '100px', height: '100px', objectFit: 'cover' }} /></RequestItem>

            <ButtonContainer>
            <ActionButtons>
              <AcceptButton onClick={handleAccept}>수락</AcceptButton>
              <RejectButton onClick={handleReject}>거절</RejectButton>
            </ActionButtons>
            <CloseButtonContainer>
              <CloseButton onClick={() => setSelectedRequest(null)}>닫기</CloseButton>
            </CloseButtonContainer>
            </ButtonContainer>
          </ModalContent>
        </ModalOverlay>
      )}
      </div>
  );
};

export default FleaRequests;

const Container = styled.div`
  font-family: 'Arial', sans-serif;
  background-color: #f4f7fc;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
`;

const RequestCard = styled.div`
  background-color: white;
  padding: 15px;
  margin-bottom: 15px;
  width: 97%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const RequestItem = styled.p`
  font-size: 16px;
  color: #555;
  margin: 8px 0;
`;

const NoRequests = styled.p`
  font-size: 18px;
  color: #888;
  text-align: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 100%;
  max-width: 600px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 85%;
  max-width: 500px;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
  max-width: 300px; /* 버튼 최대 너비 설정 */
  margin-bottom: 10px; /* 닫기 버튼과 간격 */
`;

const CloseButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const AcceptButton = styled.button`
  background: #4CAF50;
  color: white;
  padding: 10px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: #45a049;
  }
`;

const RejectButton = styled.button`
  background: #f44336;
  color: white;
  padding: 10px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: #e53935;
  }
`;

const CloseButton = styled.button`
  background: #f8f9fa;
  color: black;
  padding: 7px 85px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;

  &:hover {
    background: #b0b0b0;
  }
`;


