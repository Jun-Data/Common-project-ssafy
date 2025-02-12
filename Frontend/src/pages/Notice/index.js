import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import BottomNav from "../../components/BottomNav/BottomNav";
import MyPageHeader from "../../components/MyPageHeader";
import { DummyNotices } from "../../dummydata/notice";

const email = "jun9048@naver.com"; 

const Notice = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [noticeTitle, setNoticeTitle] = useState("");
    const [noticeContent, setNoticeContent] = useState("");
    const [noticeImage, setNoticeImage] = useState(null);
    // const [announcements, setAnnouncements] = useState([]); // 공지사항 목록 상태 추가
    const [announcements, setAnnouncements] = useState(DummyNotices[0]?.announcements || []); // 더미데이터 공지사항 목록 상태 추가

    const modalBackground = useRef();

    // 서버에서 데이터를 받아오는 대신 더미 데이터 활용
    useEffect(() => {
        setAnnouncements(DummyNotices[0]?.announcements || []);
    }, []);
    

    // useEffect(() => {
    //     const fetchAnnouncements = async () => {
    //         try {
    //             const response = await axios.get(`http://i12a506.p.ssafy.io:8000/api/store/board/list?email=${email}`);
    //             setAnnouncements(response.data.announcements || []); // 받은 공지사항 데이터를 상태에 저장, 없으면 빈 배열
    //         } catch (error) {
    //             console.error("공지사항 목록을 가져오지 못했습니다", error);
    //         }
    //     };
    //     fetchAnnouncements();
    // }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file); // 이미지 URL로 변환
            setNoticeImage(imageUrl); // URL을 상태에 저장
        }
    };

    const handleAddNotice = async () => {
        const formData = new FormData();
        formData.append("userEmail", email);
        formData.append("title", noticeTitle);
        formData.append("content", noticeContent);
        formData.append("boardImageUrl", noticeImage ? noticeImage : null);            

        // 더미데이터 공지
        const newAnnouncement = {
            boardId: announcements.length + 1,
            title: noticeTitle,
            content: noticeContent,
            boardImageUrl: noticeImage ? URL.createObjectURL(noticeImage) : null, // 이미지 미리보기 URL 저장
            createdAt: new Date().toISOString(),
        };

        // 더미 데이터에 추가
        setAnnouncements([...announcements, newAnnouncement]);
        alert("공지사항이 등록되었습니다.");
        setNoticeTitle("");
        setNoticeContent("");
        setNoticeImage(null);
        setModalIsOpen(false);

        // try {
        //     const response = await axios.post("http://i12a506.p.ssafy.io:8000/api/store/board", formData, {
        //         headers: { 'Content-Type': 'application/json' }
        //     });

        //     if (response.status === 200) {
        //         alert("공지사항이 등록되었습니다.");
        //         setNoticeTitle(""); // 입력 데이터 초기화
        //         setNoticeContent("");
        //         setNoticeImage(null); 
        //         setModalIsOpen(false);
        //         // 공지사항 목록을 다시 불러옵니다.
        //         const updatedAnnouncements = await axios.get(`http://i12a506.p.ssafy.io:8000/api/store/board/list?email=${email}`);
        //         setAnnouncements(updatedAnnouncements.data.announcements || []);
        //     }
        // } catch (error) {
        //     const errorMessage = error.response?.data?.message || error.message;
        //     console.error("공지사항 등록 실패:", errorMessage);
        //     alert(`공지사항 등록에 실패했습니다. (${errorMessage})`);
        // }
    };

    const handleCloseModal = () => {
        setNoticeTitle(""); // 제목 초기화
        setNoticeContent(""); // 내용 초기화
        setNoticeImage(null); // 이미지 초기화
        setModalIsOpen(false); // 모달 닫기
    };
    
    return (
        <div>
            <HeaderContainer />
            <Container>
                <MyPageHeader />
                <Title>공지사항</Title>
                <Button onClick={() => setModalIsOpen(true)}>공지사항 작성하기</Button>

                {/* 공지사항 목록 */}
                <NoticeList>
                    {announcements && announcements.length > 0 ? (
                        announcements.map((announcement) => (
                            <NoticeItem key={announcement.boardId}>
                                <h3>{announcement.title}</h3>
                                <p>{announcement.content}</p>
                                {announcement.boardImageUrl && (
                                    <img src={announcement.boardImageUrl} alt="Notice" />
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
                            <h2>공지 등록</h2>
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
                                        <img src={URL.createObjectURL(noticeImage)} alt="Preview" />
                                    </ImagePreview>
                                )}
                            </UploadContainer>
                            <ButtonContainer>
                                <CloseButton onClick={handleCloseModal}>닫기</CloseButton>
                                <Button onClick={handleAddNotice}>등록</Button>
                            </ButtonContainer>
                        </ModalContent>
                    </ModalBackground>
                )}
                <BottomNav />
            </Container>
        </div>
    );
};

export default Notice;

// Styled Components
const Title = styled.h2`
    margin: 12px;
`;

const Container = styled.div`
    background-color: #f8f9fa;
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
    width: 70%;
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
    margin-top: 10px;
    width: 60%;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 70px;
    gap: 30px;
`;

const Button = styled.button`
    padding: 10px 20px;
    font-size: 1rem;
    background-color: #3f72af;
    color: white;
    border: none;
    border-radius: 8px;
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

const NoticeList = styled.div`
    margin-top: 20px;
`;

const NoticeItem = styled.div`
    padding: 12px;
    margin-bottom: 15px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;
