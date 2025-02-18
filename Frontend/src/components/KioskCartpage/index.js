import React from 'react';
import './style.css'


const CartPage = ({ cartItems, onIncrement, onDecrement, onRemove }) => {
    return (
        <div className="cartpagedom">
                {cartItems.length === 0 ? (
                    <div className="cartpageemptynotice"><h1>장바구니가 비어 있습니다.<br/> 바코드를 스캔하여 물건을 담아보세요!</h1></div>
                    ) : (
                    <ul className="cartpageul">
                        {cartItems.map((item) => (
                            <li key={item.id} className="cartpageli">
                                <div className="item-name">{item.itemName}</div>
                                <div className="eachitemprice">{item.price}원</div>
                                <div className="pricecontrol">
                                    <button onClick={() => onDecrement(item.itemName)} className="cartpageplmi1">-</button>
                                    <span className="item-quantity">{item.quantity}</span>
                                    <button onClick={() => onIncrement(item.itemName)} className="cartpageplmi2">+</button>
                                </div>
                                <button onClick={() => onRemove(item.itemName)} className="cartpagedelete">×</button>
                            </li>

                        ))}
                    </ul>
                )}
        </div>
    );
};

export default CartPage;