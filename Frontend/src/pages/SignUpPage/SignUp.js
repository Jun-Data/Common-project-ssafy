import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import styled from 'styled-components';


function SignUp() {
    return (
        <div>
            <HeaderContainer />
            <br/><br/><br/>
            <h1>당신은 어떤 사용자인가요?</h1>

            <ImageWrapper>
            <Link to="/owner-signup">
            <img src="/owner.png" alt="Muin Logo" />
            </Link>

            <Link to="/user-signup">
            <img src="/customer.png" alt="Muin Logo" />
            </Link>

            </ImageWrapper>

            <ButtonsWrapper>
            <Link to="/owner-signup">
                <Button type="TERTIARY">점주 이용자</Button>
            </Link>
            
            <Link to="/user-signup">
                <Button type="TERTIARY">매장 이용자</Button>
            </Link>
            </ButtonsWrapper>
        </div>
    );
}

const ButtonsWrapper = styled.div`
  margin-top: 30px;
  display: flex;
  gap: 55px;
  justify-content: center;
`;

const ImageWrapper = styled.div`
  margin-top: 60px;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

export default SignUp;