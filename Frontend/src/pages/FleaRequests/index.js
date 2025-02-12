import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import BottomNav from "../../components/BottomNav/BottomNav";
import MyPageHeader from "../../components/MyPageHeader";
import { DummyFleaRequests } from '../../dummydata/flearequests';
import styled from 'styled-components';

// const email = "jun9048@naver.com"; 

const FleaRequests = () => {
  const [requests, setRequests] = useState([]); // 요청 목록을 배열로 저장

  useEffect(() => {
    // API 요청 대신 더미 데이터를 사용
    setRequests(DummyFleaRequests);
  }, []);



  // useEffect(() => {
  //   const fetchFleaMarketRequests = async () => {
  //     try {
  //       // API 요청 URL 수정
  //       const response = await axios.get(`http://i12a506.p.ssafy.io:8000/api/fli/list?email=${email}`);
  //       setRequests(response.data); // 배열 형태로 데이터 저장
  //     } catch (error) {
  //       console.error("플리마켓 요청 목록 가져오기 실패", error);
  //     }
  //   };
  //   fetchFleaMarketRequests();
  // }, []);

  return (
    <div>
      <HeaderContainer />
      <MyPageHeader />
      <Title>플리마켓 요청 목록</Title>
      <Container>
      {requests.length > 0 ? (
        requests.map((request, index) => ( // 요청 목록을 반복하여 출력
          <RequestCard key={index}>
            <RequestItem><strong>아이템 이름:</strong> {request.itemName}</RequestItem>
            <RequestItem><strong>수량:</strong> {request.quantity}</RequestItem>
            <RequestItem><strong>가격:</strong> {request.price}원</RequestItem>
            <RequestItem><strong>섹션 번호:</strong> {request.sectionNumber}</RequestItem>
            <RequestItem><strong>입고 날짜:</strong> {request.expirationDate}일</RequestItem>
            <RequestItem><strong>판매자 계좌 정보:</strong> {request.userAccount} ({request.userBank}, {request.accountName})</RequestItem>
          </RequestCard>
        ))
      ) : (
        <NoRequests>플리마켓 요청이 없습니다</NoRequests>
      )}
      </Container>
      <BottomNav />
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
  width: 100%;
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