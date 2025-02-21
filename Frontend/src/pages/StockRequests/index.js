import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import MyPageHeader from "../../components/MyPageHeader";
import styled from 'styled-components';

const StockRequests = () => { 
  const [items, setItems] = useState([]); // 요청 아이템들을 배열로 저장

  useEffect(() => {
    const fetchStockRequests = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/item/regist_list`);
        setItems(response.data); 
      } catch (error) {
        console.error("데이터 가져오기 실패", error);
      }
    };
    fetchStockRequests();
  }, []);

  return (
    <div>
      <HeaderContainer />
      <MyPageHeader />
      <Title>상품 요청 목록</Title>
      <p>매장 이용자들이 원하는 제품들이에요!</p>

      <Container>
      {items.length > 0 ? ( // 아이템 배열이 비어있지 않으면 출력
        items.map((item, index) => ( // 아이템 배열을 반복하여 출력
          <ItemCard key={index}>
            <ItemDetails>
              <strong>아이템 이름:</strong> {item.itemName}
            </ItemDetails>
            <ItemDetails>
              <strong>요청 수:</strong> {item.requestCount}
            </ItemDetails>
          </ItemCard>
        ))
      ) : (
        <NoRequests>입고 요청 내역이 없습니다</NoRequests>
      )}
      </Container>
    </div>
  );
};

export default StockRequests;

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

const ItemCard = styled.div`
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

const ItemDetails = styled.p`
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
