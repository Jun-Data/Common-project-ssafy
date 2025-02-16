import HeaderContainer from "../../components/HeaderContainer/HeaderContainer";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import styled from 'styled-components';


function SignUp() {
    return (
        <div>
            <HeaderContainer />

            <h2>당신은 어떤 사용자이신가요?</h2>

            <ImageWrapper> 
            <img src="/owner.png" alt="Muin Logo" />
            <img src="/customer.png" alt="Muin Logo" />
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
  margin-top: 50px;
  display: flex;
  gap: 35px;
  justify-content: center;
`;

const ImageWrapper = styled.div`
  margin-top: 50px;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

export default SignUp;