import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomSheetApi from "../../api/BottomSheetApi";
import resultBottomSheetApi from "../../api/resultBottomsheetApi";
import "./DraggableBottomSheet.css";

const DraggableBottomSheet = ({ coords, setStorelist, itemId=null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [panelHeight, setPanelHeight] = useState(10); // 기본 높이 10%
  const panelRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const NAV_HEIGHT = 0 // 네비게이션 높이
  const PANEL_WIDTH = "100%"; // 바텀시트 너비

  // 드래그 시작 핸들러
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    startYRef.current = e.clientY || e.touches?.[0]?.clientY;

    // 드래깅 클래스 추가
    panelRef.current.classList.add("dragging");
  };

  // 드래그 중 핸들러
  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const currentY = e.clientY || e.touches?.[0]?.clientY;
    const deltaY = startYRef.current - currentY;

    requestAnimationFrame(() => {
      let newHeight = panelHeight + (deltaY / window.innerHeight) * 100;
      newHeight = Math.max(10, Math.min(newHeight, 85)); // 최소 10%, 최대 85%
      setPanelHeight(newHeight);
      startYRef.current = currentY; // 현재 위치 업데이트
    });
  };

  // 드래그 종료 핸들러
  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    // 스냅 위치 설정
    setPanelHeight((prevHeight) => {
      if (prevHeight > 70) return 85; // 최대 위치로 스냅
      if (prevHeight > 20) return 50; // 중간 위치로 스냅
      return 10; // 최소 위치로 스냅
    });

    // 드래깅 클래스 제거
    panelRef.current.classList.remove("dragging");
  };

  // 이벤트 리스너 등록 및 해제
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDraggingRef.current) handlePointerUp();
    };

    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("touchend", handleGlobalPointerUp);

    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("touchend", handleGlobalPointerUp);
    };
  }, []);

  const [LocalStorelist, setLocalStorelist] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!coords) return;

      try {
        // 현재 경로에 따라 API 선택
        if (location.pathname.startsWith('/search/')) {
          await resultBottomSheetApi({
            coords,
            itemId: itemId,
            receivedData: (data) => {
              if (isMounted) {
                setLocalStorelist(data);
                setStorelist(data);
              }
            }
          });
        } else {
          await BottomSheetApi({
            coords,
            receivedData: (data) => {
              if (isMounted) {
                setLocalStorelist(data);
                setStorelist(data);
              }
            }
          });
        }
      } catch (error) {
        console.error('API 요청 실패:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [coords, itemId, setStorelist, location.pathname]); // itemID와 경로 변경 감지

  return (
      <div
          ref={panelRef}
          className="bottom-sheet"
          style={{
            height: `${panelHeight}%`,
            bottom: `${NAV_HEIGHT}px`,
            width: `${PANEL_WIDTH}`,
            transition: isDraggingRef.current ? "none" : "height 0.3s ease", // 드래그 중에는 트랜지션 비활성화
          }}
          onPointerMove={handlePointerMove}
          onTouchMove={handlePointerMove}
      >
        {/* 드래그 핸들 */}
        <div className="drag-handle" onPointerDown={handlePointerDown} onTouchStart={handlePointerDown}></div>

        {/* 바텀시트 내용 */}
        <div className="bottom-sheet-content">
          <h3 style={{ marginTop: 50 }}>근처 매장 리스트</h3>
          {LocalStorelist ? (
              <ul>
                {LocalStorelist.map((store, index) => (
                    <li
                        onClick={() => navigate(`/storedetail/${store.storeNo}`)}
                        key={index}
                    >
                      <span className="store-name">{store.storeName}</span>
                      <span className="store-distance">{parseFloat(store.distance).toFixed(0)}m</span>
                    </li>
                ))}
              </ul>
          ) : (
              <p>근처에 매장이 없습니다.</p>
          )}
        </div>
      </div>
  );
};

export default DraggableBottomSheet;
