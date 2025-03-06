## 서비스 소개
![alt text](./Frontend/public/logo.png)<br>
>소비자와 점주가 함께 만들어가는 무인 판매점 플랫폼 Muinus!<br>
소비자들은 원하는 상품을 찾고 요청하고 판매하며, 
<br>점주들은 자신만의 매장을 창업하고 관리할 수 있습니다<br>
수많은 무인매장들 사이에서 차별화된 무인판매점을 경험해보세요!<br>

<br>

## 프로젝트 기획
### 기획 배경
코로나 이후 우후죽순 생겨난 무인 판매점들은 특색없이 비슷한 모습들을 보이고, <br>사용에 있어 불편함이 있었습니다.
- 사고자 하는 물건을 판매하는지 미리 알 수 없음
- 원하는 물건을 판매하는 판매점이 없음
- 점주와 소통을 위해선 전화번호 노출 필요
- 모두가 비슷한 모습으로 경쟁력이 없음

이를 개선하고자 자체 브랜드인 ‘Muinus’ 를 기획하게 되었습니다.<br>
<br>

### 프로젝트 진행 기간
2025.01.06 ~ 2025.02.21 (7주) SSAFY 12기 공통 프로젝트<br>
<br>

### 협업 툴
 `Gitlab` : 코드 버전 관리 및 이슈별 브랜치를 생성해서 진행 <br>
 `Notion` : 프로젝트 기획, 명세서 / 트러블 슈팅 정리 <br>
 `Jira` : 매주 작업 우선순위 설정 및 업무 분담, 개발 진행 상황을 기록<br>
<br>

### 프로젝트 산출물 
[피그마](https://www.figma.com/design/4HESwFhBPoCde9Om85k5YA/%EB%AC%B4%EC%9D%B8%EB%A7%A4%EC%9E%A5?node-id=0-1&p=f&t=sa69JoB7A9gCmkJC-0)<br>
[API 명세서](https://sweltering-outrigger-924.notion.site/17b335deddef80528298d116c3e8c086?v=764eee499b9042b98674705d435d2e32)<br>

## 주요 기능
### 1. 로그인 / 회원가입
- 소셜로그인으로 회원가입 진행(카카오)
- 비로그인자도 메인페이지에서의 검색 기능을 사용할 수 있도록 하고, 소셜 로그인 방식을 적용해 접근성을 높였습니다<br>

### 2. 무인매장 상품 검색
- 원하는 상품을 검색하면, 내 주변 해당 상품을 파는 매장을 조회할 수 있습니다
- 물품 이름, 당, 칼로리, 단백질 등의 카테고리로도 검색 가능합니다
- 엘라스틱 서치를 사용해서 검색어 자동 완성, 유사 검색 처리, 동의어 처리를 해줍니다<br>

### 3. 플리마켓
- 무인 판매점의 매대를 대여하여 개인의 상품을 거래할 수 있습니다
- 각 매장의 페이지에서 플리마켓 상품들을 조회할 수 있고 판매하고자 하는 물품을 등록할 수 있습니다<br>

### 4. 제품 입고 요청
- 원하는 상품이 매장에 없을 경우, 점주에게 입고 요청이 가능합니다
- 점주는 입고 요청 목록과 요청 수를 확인하여 매출 증대를 위한 전략을 수립할 수 있습니다<br>

### 5. 쿠폰
- 점주는 쿠폰을 발급하여 고객의 매장 방문을 유도할 수 있습니다
- 사용자는 발급받은 쿠폰을 QR코드 형태로 키오스크에서 스캔하여 할인 혜택을 받을 수 있습니다<br>

### 6. 화상 통화
- 전화번호 노출 없이 소비자와 점주 간 연락이 가능합니다<br>
<br>

## 아키텍처
![alt text](./Frontend/public/Architecture.png)

## ERD
![alt text](./Frontend/public/erd.png)
<br>

## 시연
### 📍회원가입 및 로그인

### 소셜 로그인 (카카오)
<video src="https://github.com/user-attachments/assets/c3f9682e-bad7-4019-8e66-62df6af45f44" autoplay loop muted width="200"></video>

### 회원가입 (점주/매장 이용자)
<video src="https://github.com/user-attachments/assets/57a5ca9e-1a5a-4cbf-896d-f422e4a05701" autoplay loop muted width="200"></video>
<br>

### 📍검색
<video src="https://github.com/user-attachments/assets/e96c48dc-599c-4d5c-ac8e-d37f01f8fdc5" autoplay loop muted width="200"></video>

#### 검색 전
\- 현재 위치를 기반으로 반경 1km에 있는 매장 리스트

#### 제품명으로 검색
\- 검색어 입력 시, 해당 검색어가 포함된 아이스크림 목록 표시

#### 영양성분으로 검색
\- 당 함유량과 칼로리 범위를 조정하여 해당 제품들 검색

#### 검색 완료
\- 근처 매장에 해당 제품이 있다면 지도 및 바텀 시트에 표시
<br>

### 📍무인 매장 상세
<video src="https://github.com/user-attachments/assets/a87aa49d-c5a3-439e-8aca-e93112277c7a" autoplay loop muted width="200"></video>

<br>

#### 제품정보
\- 매장 내 보유 중인 제품 정보 확인 가능
#### 플리마켓 
\- 플리마켓 제품 정보 확인 및 신청 가능
#### 쿠폰 수령
\- 쿠폰 수령 클릭 시, 해당 매장의 쿠폰 수령 가능
#### 입고 요청
\- 원하는 제품 검색 후 요청
#### 화상통화
\- 점주와 소비자 즉각적인 소통 창구
<br>

### 📍점주 마이페이지
<video src="https://github.com/user-attachments/assets/c6481cf9-cbda-4667-a816-e88cfb0f3067" autoplay loop muted width="200"></video>

#### 플리마켓 요청 
\- 요청된 플리 마켓 목록이 표시<br>
\- 수락/거절로 매장에 전시할지 결정 가능

#### 요청 상품 목록 확인
\- 입고 요청이 들어온 상품 리스트 확인

#### 쿠폰 등록
\- 원하는 종류의 쿠폰과 유효기간, 매수를 선택하여 등록 가능

#### 공지사항 등록
\- 공지사항 등록 및 수정이 가능
<br>

### 📍소비자 쿠폰
<video src="https://github.com/user-attachments/assets/72f02548-8b09-4ef6-ab2c-3e266d49fb1d" autoplay loop muted width="200"></video>

#### 쿠폰함
\- 보유 중인 쿠폰들 확인<br>
\- 쿠폰 클릭 시 쿠폰 QR 생성
<br>

### 📍키오스크
<video src="https://github.com/user-attachments/assets/9f120498-9db5-4028-9d38-404a05505bbe" autoplay loop muted width="200"></video>

#### 키오스크 결제 사용
\- 결제 화면, 플리마켓과 제품이 따로 나옴<br>
\- 화면이 보이는 스캐너에 제품 스캔시 목록에 올라옴<br>
\- 결제 클릭 시, 쿠폰을 사용할거면 스캔<br>
\- 후에 원하는 방식으로 결제<br>
