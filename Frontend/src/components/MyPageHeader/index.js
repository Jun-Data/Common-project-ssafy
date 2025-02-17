import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";

function MyPageHeader() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith("/mypage/admin"); // 관리자 페이지 여부 확인

    return (
        <Header>
            <Nav isAdmin={isAdmin}>
                {isAdmin ? (
                    <>
                        <NavLink to="/mypage/admin/flea" isActive={location.pathname === "/mypage/admin/flea"}>
                            플리마켓
                        </NavLink>
                        <NavLink to="/mypage/admin/stock" isActive={location.pathname === "/mypage/admin/stock"}>
                            입고
                        </NavLink>
                        <NavLink to="/mypage/admin/coupon" isActive={location.pathname === "/mypage/admin/coupon"}>
                            쿠폰
                        </NavLink>
                        <NavLink to="/mypage/admin/notice" isActive={location.pathname === "/mypage/admin/notice"}>
                            공지사항
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/mypage/user/coupons" isActive={location.pathname === "/mypage/user/coupons"}>
                            쿠폰함
                        </NavLink>
                    </>
                )}
            </Nav>
        </Header>
    );
}

const Header = styled.header`
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 17px;
  display: flex;
  justify-content: center;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ isAdmin }) => (isAdmin ? '30px' : '70px')}; /* gap 스타일 적용 */
`;

const NavLink = styled(Link)`
  text-decoration: none;
  font-size: 0.94rem;
  font-weight: 500;
  color: ${({ isActive }) => (isActive ? "#3f72af" : "#000")}; /* 동적으로 스타일링 */
  &:hover {
    text-decoration: underline;
  }
`;

export default MyPageHeader;
