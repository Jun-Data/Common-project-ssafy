import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import Swal from "sweetalert2";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import MyPageHeader from "../../components/MyPageHeader";
import useAuth from "../../hooks/useAuth";

const Notice = () => {
    const {logindata} = useAuth();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [noticeTitle, setNoticeTitle] = useState("");
    const [noticeContent, setNoticeContent] = useState("");
    const [noticeImage, setNoticeImage] = useState(null);
    const [announcements, setAnnouncements] = useState([]); // 공지사항 목록 상태
    const [editingNoticeId, setEditingNoticeId] = useState(null); // 수정할 공지사항 ID 

    const modalBackground = useRef();
    
    useEffect(() => {
        // 내 매장 공지사항 목록
        const fetchAnnouncements = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/store/board/list`);
                console.log(response);
                setAnnouncements(response.data || []); // 받은 공지사항 데이터를 상태에 저장, 없으면 빈 배열
            } catch (error) {
                console.error("공지사항 목록을 가져오지 못했습니다", error);
            }
        };
        fetchAnnouncements();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Base64로 변환
            reader.onloadend = () => {
                setNoticeImage(reader.result); // 변환된 Base646 데이터 저장
            };
        } else {
            setNoticeImage(null); // 파일 선택 취소 시 이미지 초기화
        }
    };

    // 공지사항 등록
    const handleAddNotice = async () => {
        console.log(logindata)
        const formData = new FormData();
        // formData.append("userEmail", logindata.email);
        formData.append("title", noticeTitle);
        formData.append("content", noticeContent);
        formData.append("boardImageUrl", noticeImage ? noticeImage : null);            

        try {
            const response = await axios.post(
               `${process.env.REACT_APP_BACKEND_API_URL}/api/store/board`, formData, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(response);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: '공지사항 등록',
                    text: '공지사항이 성공적으로 등록되었습니다.',
                    confirmButtonText: '확인'
                });
                
                setNoticeTitle(""); // 입력 데이터 초기화
                setNoticeContent("");
                setNoticeImage(null); 
                setModalIsOpen(false);

                // 등록 후 목록 새로고침
                const updatedAnnouncements = await axios.get(
                   `${process.env.REACT_APP_BACKEND_API_URL}/api/store/board/list`);
                setAnnouncements(updatedAnnouncements.data || []);
                
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.error("공지사항 등록 실패:", errorMessage);
            Swal.fire({
                icon: 'error',
                title: '등록 실패',
                text: `공지사항 등록에 실패했습니다. (${errorMessage})`,
                confirmButtonText: '확인'
            });        }
    };

    const handleCloseModal = () => {
        setNoticeTitle(""); // 제목 초기화
        setNoticeContent(""); // 내용 초기화
        setNoticeImage(null); // 이미지 초기화
        setModalIsOpen(false); // 모달 닫기
        setEditingNoticeId(null); // 수정 상태 리셋

    };
    
    // 공지사항 수정 모달창
    const handleEditNotice = (announcement) => {
        setEditingNoticeId(announcement.boardId); // 수정할 공지사항 ID 설정
        setNoticeTitle(announcement.title);
        setNoticeContent(announcement.content);
        setNoticeImage(announcement.boardImageUrl || null); // 이미지 미리보기 URL 설정
        setModalIsOpen(true); // 모달 열기
    };

    // 공지사항 수정
    const handleSaveNotice = async () => {
        const formData = new FormData();
        formData.append("boardId", editingNoticeId);
        formData.append("title", noticeTitle);
        formData.append("content", noticeContent);
    
        // 이미지가 새로 첨부된 경우 (base64 데이터)
        if (noticeImage && noticeImage.startsWith("data:image")) {
            formData.append("boardImageUrl", noticeImage); // Base64 데이터
        } else if (noticeImage === null || noticeImage === "") {
            // 이미지를 삭제한 경우
            formData.append("boardImageUrl", null); // null로 보내기
        } else {
            // 기존 이미지가 있고 이미지를 변경하지 않은 경우
            // URL을 base64로 변환하여 보내기
            try {
                const response = await fetch(noticeImage);
                const blob = await response.blob();
                const reader = new FileReader();
    
                reader.onloadend = async () => {
                    const base64Image = reader.result.split(',')[1]; // base64 문자열 추출
    
                    // base64 문자열을 formData에 추가
                    formData.append("boardImageUrl", `data:image/png;base64,${base64Image}`);
    
                    try {
                        const updateResponse = await axios.put(
                            `${process.env.REACT_APP_BACKEND_API_URL}/api/store/board`, formData, {
                            headers: { 'Content-Type': 'application/json' }
                        });
    
                        if (updateResponse.status === 200) {
                            Swal.fire({
                                icon: 'success',
                                title: '공지사항 수정',
                                text: '공지사항이 성공적으로 수정되었습니다.',
                                confirmButtonText: '확인'
                            });
    
                            // 등록 후 목록 새로고침
                            const updatedAnnouncements = await axios.get(
                                `${process.env.REACT_APP_BACKEND_API_URL}/api/store/board/list`);
                            setAnnouncements(updatedAnnouncements.data || []);
                            handleCloseModal();
                        }
                    } catch (error) {
                        console.error("공지사항 수정 실패:", error);
                        Swal.fire({
                            icon: 'error',
                            title: '수정 실패',
                            text: '공지사항 수정에 실패했습니다.',
                            confirmButtonText: '확인'
                        });
                    }
                };
                reader.readAsDataURL(blob); // blob을 base64로 변환
            } catch (error) {
                console.error("이미지 변환 실패:", error);
                Swal.fire({
                    icon: 'error',
                    title: '이미지 변환 실패',
                    text: '이미지 변환 중 오류가 발생했습니다.',
                    confirmButtonText: '확인'
                });
            }
        }
    };
    

    return (
        <div>
            <HeaderContainer />
                <MyPageHeader />
                <Title>공지사항</Title>
                <ButtonWrapper>
                    <EditButton onClick={() => setModalIsOpen(true)}>공지 작성하기</EditButton>
                </ButtonWrapper>

            <Container>
                {/* 공지사항 목록 */}
                <NoticeList>
                    {announcements && announcements.length > 0 ? (
                        announcements.map((announcement) => (
                            <NoticeItem key={announcement.boardId} onClick={()=>handleEditNotice(announcement)}>
                                <h3>{announcement.title}</h3>
                                <p>{announcement.content}</p>
                                {announcement.boardImageUrl && (
                                    <img src={announcement.boardImageUrl} alt="공지사항 이미지" />
                                )}

                                <p><strong>작성일:</strong> {new Date(announcement.createdAt).toLocaleDateString()}</p>
                            </NoticeItem>
                        ))
                    ) : (
                        <p>공지사항이 없습니다.</p>
                    )}
                </NoticeList>

                {/* 모달 창 */}
                {modalIsOpen && (
                    <ModalBackground
                        ref={modalBackground}
                        onClick={(e) => {
                            if (e.target === modalBackground.current) {
                                setModalIsOpen(false);
                            }
                        }}
                    >
                        <ModalContent>
                            <h2>{editingNoticeId ? "공지 수정" : "공지 등록"}</h2>
                            <Input
                                type="text"
                                placeholder="공지 제목"
                                value={noticeTitle}
                                onChange={(e) => setNoticeTitle(e.target.value)}
                            />
                            <TextArea
                                placeholder="공지 내용"
                                value={noticeContent}
                                onChange={(e) => setNoticeContent(e.target.value)}
                            />
                            
                            {/* 이미지 업로드 */}
                            <UploadContainer>
                                <FileInput
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            {noticeImage && (
                                <ImagePreview>
                                    <img src={noticeImage} alt="Preview"/>
                                </ImagePreview>
                            )}
                            </UploadContainer>
                            <ButtonContainer>
                                <CloseButton onClick={handleCloseModal}>닫기</CloseButton>
                                <Button onClick={editingNoticeId? handleSaveNotice : handleAddNotice}>
                                    {editingNoticeId ? "수정" : "등록"}
                                    </Button>
                            </ButtonContainer>
                        </ModalContent>
                    </ModalBackground>
                )}
            </Container>
        </div>
    );
};

export default Notice;

const Title = styled.h2`
    margin: 12px;
`;

const Container = styled.div`
  font-family: 'Arial', sans-serif;
  background-color: #f4f7fc;
  padding: 20px;
  display: flex;
  flex-direction: column;
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
    height: 70%;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
`;

const Input = styled.input`
    width: 90%;
    padding: 10px;
    margin-top: 10px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s ease;

    &:focus {
        border-color: #3f72af;
    }
`;

const TextArea = styled.textarea`
    width: 90%;
    padding: 12px;
    font-size: 1rem;
    margin-top: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    min-height: 210px;
    outline: none;
    transition: border-color 0.3s ease;

    &:focus {
        border-color: #3f72af;
    }
`;

const FileInput = styled.input`
    margin: 10px 0px 20px 15px;
    font-size: 0.8rem;
    width: 170px;
`;

const ImagePreview = styled.div`
    img {
        max-width: 50px;
        height: auto;
        border-radius: 8px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }
`;

const UploadContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 15px;
    width: 60%;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 60px;
    gap: 30px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;  /* 버튼을 우측으로 정렬 */
  margin: 10px 5px;
`;

const Button = styled.button`
    padding: 12px 20px;
    font-size: 1rem;
    background-color:rgb(117, 153, 202);
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

const EditButton = styled(Button)`
    padding: 5px 10px;
    font-size: 0.9rem;
    background-color:rgb(130, 138, 150);
`;

const NoticeList = styled.div`
  margin-top: 20px;
`;

const NoticeItem = styled.div`
  background-color: white;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  h3 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  p {
    font-size: 16px;
    color: #555;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-top: 10px;
  }
`;
