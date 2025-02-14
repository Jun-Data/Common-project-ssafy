import { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import './style.css';

const FleaProductList = ({ onAddToCart }) => {
    const [fleaProducts, setFleaProducts] = useState([]);

    const fetchFleaProduct = async (section) => {
        try {
            const storeNo = 1;
            const sectionId= 1;

            const response = await apiClient.get('api/kiosk/flea-item', {
                params: { storeNo, sectionId },
            });

            if (response.status === 200) {
                setFleaProducts(response.data);
            } else {
                console.error('API 요청 실패:', product.message || '알 수 없는 오류');
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);

            if (error.response && error.response.data) {
                alert(`API 호출 중 오류가 발생했습니다: ${error.response.data.message}`);
            } else {
                alert('API 호출 중 알 수 없는 오류가 발생했습니다.');
            }
        }
    };

    useEffect(() => {
        fetchFleaProduct();
    }, []); // 빈 배열 사용

    return (
        <div className="kioskfleamarketsection">
            {fleaProducts.map((fleaProduct) => (
                <div key={fleaProduct.id} className="fleaproduct-item">
                    <div className="image-container">
                        <img src={fleaProduct.imageUrl} alt={fleaProduct.itemName} />
                    </div>
                    <div className="fleaproduct-info">
                        <div className="fleaproduct-name">{fleaProduct.itemName}</div>
                        <div className="fleaproduct-price">{fleaProduct.price.toLocaleString()}원</div>
                        <button
                            className="add-to-cart-btn"
                            onClick={() => buttonclicksuccess(fleaProduct.section)}
                        >
                            장바구니에 추가
                        </button>
                    </div>
                </div>
            ))}
        </div>    );
};

export default FleaProductList;
