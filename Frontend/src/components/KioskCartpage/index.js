import React from 'react';
import './style.css'


const CartPage = ({ cartItems, onIncrement, onDecrement, onRemove }) => {
    return (
        <div className="cartpagedom">
            <div className="cartpagelist">
                {cartItems.length === 0 ? (
                    <div className="cartpageemptynotice"><h1>장바구니가 비어 있습니다.<br/> 바코드를 스캔하여 물건을 담아보세요!</h1></div>
                    ) : (
                    <ul>
                        {cartItems.map((item) => (
                            <li key={item.id} className="cartpageli">
                                <div className="image-container">
                                    <img src={item.imageUrl} alt={item.itemName} />
                                    <button onClick={() => onRemove(item.itemName)} className="cartpagedelete">×</button>
                                </div>

                                <div className="item-info">
                                    <div className="item-name">{item.itemName}</div>

                                    <div className="price-quantity">
                                        <div className="eachitemtotal">{(item.price * item.quantity).toLocaleString()}원</div>
                                        <div className="quantity-controls">
                                            <button onClick={() => onDecrement(item.itemName)} className="cartpageplmi1">-</button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button onClick={() => onIncrement(item.itemName)} className="cartpageplmi2">+</button>
                                        </div>
                                    </div>
                                </div>
                            </li>

                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CartPage;