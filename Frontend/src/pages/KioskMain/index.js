import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BarcodeScannerComponent from "../../components/KioskBarcodeScanner";
import Cartpage from "../../components/KioskCartpage";
import KioskFleaproductlist from "../../components/KioskFleaproductlist";
import PaymentPopup from "../../components/KioskPaymentPopup";
import KioskCouponPopup from "../../components/KioskCouponPopup";
import KioskPaymentFinishPopup from "../../components/KioskPaymentFinishPopup";
import KioskPaymentApi from "../../api/KioskPaymentApi";
import "./style.css";
import Swal from "sweetalert2";

const KioskMainScreen = () => {
  const [state, setState] = useState({
    cartItems: [],
    couponId: null,
    discountRate: 0,
    isPaymentPopupOpen: false,
    isCouponPopupOpen: false,
    isPaymentFinish: false,
    isCouponPromptOpen: false,
  });

  const navigate = useNavigate();
  const storeNo = Number(useParams().storeNo);

  const updateState = (newState) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const handleCartOperation = (operation) => {
    setState((prev) => ({
      ...prev,
      cartItems: operation(prev.cartItems),
    }));
  };

  const handleAddToCart = (product) => {
    handleCartOperation((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        // Check if adding more exceeds stock
        if (existing.quantity + 1 > product.quantity) {
          // alert(`재고가 부족합니다. 최대 ${product.quantity}개까지 담을 수 있습니다.`);
          Swal.fire({
            icon: "warning",
            title: "재고 부족!",
            text: `재고가 부족합니다. 최대 ${product.quantity}개까지 담을 수 있습니다`,
          });
          return prevItems; // Return without changes
        }
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Check if initial quantity exceeds stock
        if (product.quantity < 1) {
          // alert(`재고가 부족합니다.`);
          Swal.fire({
            icon: "error",
            title: "재고 부족!",
            text: "현재 재고가 없습니다.",
          });
          return prevItems;
        }
        return [
          ...prevItems,
          {
            ...product,
            quantity: 1,
            itemName: product.itemName || product.fliItemName,
          },
        ];
      }
    });
  };

  const handleIncrement = (itemName) => {
    handleCartOperation((prevItems) =>
      prevItems.map((item) => {
        if (item.itemName === itemName) {
          // Check if increment exceeds stock
          if (item.quantity + 1 > item.stockQuantity) {
            // alert(`재고가 부족합니다. 최대 ${item.stockQuantity}개까지 담을 수 있습니다.`);
            Swal.fire({
              icon: "warning",
              title: "재고 부족!",
              text: `재고가 부족합니다. 최대 ${item.stockQuantity}개까지 담을 수 있습니다`,
            });
            return item; // No change to the item
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };
  const handleDecrement = (itemName) => {
    handleCartOperation((prevItems) =>
      prevItems.map((item) =>
        item.itemName === itemName && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemove = (itemName) => {
    handleCartOperation((prevItems) =>
      prevItems.filter((item) => item.itemName !== itemName)
    );
  };

  // 동적 할인율 적용 계산
  const calculateTotalPrice = () => {
    const subtotal = state.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    return subtotal - Math.floor(subtotal * (state.discountRate / 100));
  };

  const handleConfirmPayment = async (method) => {
    try {
      // 데이터 분류 로직
      const itemsForPayment = [];
      const fliItemsForPayment = [];

      state.cartItems.forEach((item) => {
        const subtotal = item.price * item.quantity;

        if (item.fliItemId) {
          // 플리마켓 상품
          fliItemsForPayment.push({
            fliItemId: item.fliItemId,
            fliItemName: item.fliItemName || item.itemName,
            quantity: item.quantity,
            price: item.price,
            subtotal: subtotal,
          });
        } else {
          // 일반 상품
          itemsForPayment.push({
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.price,
            subtotal: subtotal,
          });
        }
      });

      const subtotal =
        itemsForPayment.reduce((sum, item) => sum + item.subtotal, 0) +
        fliItemsForPayment.reduce((sum, item) => sum + item.subtotal, 0);

      const requestData = {
        storeNo: storeNo,
        itemsForPayment,
        fliItemsForPayment,
        couponId: state.couponId,
        totalPrice:
          subtotal - Math.floor(subtotal * (state.discountRate / 100)),
      };

      // API 호출
      await KioskPaymentApi(requestData);

      // 성공 시 상태 업데이트
      updateState({
        isPaymentPopupOpen: false,
        cartItems: [],
        couponId: null,
        discountRate: 0,
        isPaymentFinish: true,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "결제 실패",
        text: "결제 처리 중 오류가 발생했습니다.",
      });
      console.error("Payment error:", error);
    }
  };

  // 수정된 handleApplyCoupon 함수
  const handleApplyCoupon = (couponData) => {
    const currentSubtotal = state.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    updateState({
      couponId: couponData.couponId,
      discountRate: couponData.discountRate,
      isCouponPopupOpen: false,
      isPaymentPopupOpen: true,
    });
  };

  return (
    <div className="kioskmainscreen">
      <div className="mainscreencartpage">
        <Cartpage
          cartItems={state.cartItems}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onRemove={handleRemove}
        />
      </div>
      <div className="kioskpleaproductlist">
        <KioskFleaproductlist onAddToCart={handleAddToCart} />
      </div>
      <div className="barcodebuttoncontainer">
        <div className="mainscreenbarcodescanner">
          <BarcodeScannerComponent onAddToCart={handleAddToCart} />
        </div>
        <div className="buttonzonecontainer">
          <div className="cartpagetotal">
            총 금액: {calculateTotalPrice().toLocaleString()}원
          </div>
          <div className="buttonzone">
            <button
              className="mainscreenpayment"
              onClick={() => updateState({ isCouponPromptOpen: true })}
            >
              결제하기
            </button>
            <button
              className="mainscreentohome"
              onClick={() => navigate("/kiosk")}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>

      {/* 쿠폰 적용 확인 팝업 추가 */}
      {state.isCouponPromptOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>
              쿠폰을
              <br />
              <br />
              적용하시겠습니까?
            </h2>
            <div className="coupon-prompt-buttons">
              <button
                onClick={() => {
                  updateState({
                    isCouponPromptOpen: false,
                    isCouponPopupOpen: true,
                  });
                }}
              >
                예
              </button>
              <button
                onClick={() =>
                  updateState({
                    isCouponPromptOpen: false,
                    isPaymentPopupOpen: true,
                  })
                }
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}

      {state.isCouponPopupOpen && (
          <div className="popup-overlay">
            <div className="popup-content">
              <KioskCouponPopup
                  onClose={() =>
                      updateState({
                        isCouponPopupOpen: false,
                        isPaymentPopupOpen: true,
                      })
                  }
                  onApplyCoupon={(couponData) => {
                    handleApplyCoupon(couponData);
                    updateState({ isPaymentPopupOpen: true, isCouponPopupOpen: false });
                  }}
              />
            </div>
          </div>
      )}

      {/* 수정된 결제 팝업 호출 방식 */}
      {state.isPaymentPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <PaymentPopup
              total={calculateTotalPrice()}
              onClose={() => updateState({ isPaymentPopupOpen: false })}
              onConfirm={handleConfirmPayment}
            />
          </div>
        </div>
      )}

      {state.isPaymentFinish && (
        <div className="popup-overlay">
          <div className="popup-content">
            <KioskPaymentFinishPopup
              onClose={() => {
                updateState({ isPaymentFinish: false });
                navigate("/kiosk");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskMainScreen;
