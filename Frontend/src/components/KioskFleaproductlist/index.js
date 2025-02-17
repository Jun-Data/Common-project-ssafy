import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StoreDetailApi from "../../api/StoreDetailApi";
import './style.css';

const FleaProductList = ({ onAddToCart }) => {
    const { storeNo } = useParams(); // URL 파라미터 추출
    const [productData, setProductData] = useState(null);
    const [fleaProducts, setFleaProducts] = useState([]);
    const parsedStoreNo = parseInt(storeNo, 10);

    // API 초기 데이터 가져오기
    useEffect(() => {
        StoreDetailApi(parsedStoreNo, setProductData);
    }, []);

    // 상품 데이터 업데이트 시 처리
    useEffect(() => {
        if(productData?.fliItems) {
            setFleaProducts(productData.fliItems);
        }
    }, [productData]);

    return (
        <div className="flea-product-container">
            <h2 className="fleanotice">플리마켓 상품 목록</h2>
            {fleaProducts?.length > 0 ? (<ul className="product-grid">
                {fleaProducts.map((product) => (
                    <li key={product.itemCode} className="product-card">
                        <div className="image-container">
                            <img
                                src={product.imagePath}
                                alt={product.itemName}
                                onError={(e) => {
                                    e.target.src = '/logo.png'; // 이미지 로드 실패 시 대체 이미지
                                }}
                            />
                        </div>
                        <div className="product-details">
                            <span className="product-name">{product.itemName}</span>
                            <span className="product-price">
                                {product.price.toLocaleString()}원
                            </span>
                        </div>
                        <button
                            className="add-cart-btn"
                            onClick={() => onAddToCart(product)}
                        >
                            담기
                        </button>
                    </li>
                ))}
            </ul>) : <div className="fleaemptynotice">등록된 플리마켓 제품이 없습니다.</div>
            }
        </div>
    );
};
export default FleaProductList;
