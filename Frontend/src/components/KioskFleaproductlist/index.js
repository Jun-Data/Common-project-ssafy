import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import StoreDetailApi from "../../api/StoreDetailApi";
import "./style.css";

const FleaProductList = ({ onAddToCart }) => {
  const { storeNo } = useParams();
  const [productData, setProductData] = useState(null);
  const [fleaProducts, setFleaProducts] = useState([]);
  const parsedStoreNo = parseInt(storeNo, 10);

  // API 호출 부분
  useEffect(() => {
    StoreDetailApi(parsedStoreNo, setProductData);
  }, [parsedStoreNo]);

  // 상품 데이터 업데이트
  useEffect(() => {
    if (productData?.fliItems) {
      setFleaProducts(productData.fliItems);
    }
  }, [productData]);

  return (
    <div className="flea-product-container">
      <h2 className="fleanotice" style={{ fontSize: 40 }}>
        플리마켓 상품 목록
      </h2>
      {fleaProducts.length > 0 ? (
        <ul className="product-grid">
          {fleaProducts.map((product) => (
            <li key={product.fliItemId} className="product-card">
              <div className="image-container">
                <img
                  src={product.imagePath}
                  alt={product.fliItemName}
                  onError={(e) => {
                    e.target.src = "/logo.png";
                  }}
                />
              </div>
              <div className="product-details">
                <span
                  className="product-name"
                  style={{
                    fontSize: "30px",
                    alignContent: "center",
                    lineHeight: "30px",
                  }}
                >
                  {product.fliItemName}
                </span>
                <span className="product-price" style={{ fontSize: "30px" }}>
                  {product.price.toLocaleString()}원
                </span>
              </div>
              <button
                className="add-cart-btn"
                onClick={() =>
                  onAddToCart({
                    ...product,
                    itemName: product.fliItemName,
                    id: product.fliItemId,
                    stockQuantity: product.quantity,
                  })
                }
              >
                담기
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="fleaemptynotice">
          <br />
          <br />
          <br />
          <br />
          <h1>등록된 플리마켓 제품이 없습니다.</h1>
        </div>
      )}
    </div>
  );
};

export default FleaProductList;
