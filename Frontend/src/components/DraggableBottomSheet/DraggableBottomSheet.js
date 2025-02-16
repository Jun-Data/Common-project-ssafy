import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomSheetApi from "../../api/BottomSheetApi";
import resultBottomSheetApi from "../../api/resultBottomsheetApi";
import "./DraggableBottomSheet.css";

// 성능 최적화를 위한 memoization
const DraggableBottomSheet = memo(({ coords, setStorelist, itemId = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [panelHeight, setPanelHeight] = useState(10);
  const panelRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const abortControllerRef = useRef(new AbortController());
  const [LocalStorelist, setLocalStorelist] = useState([]);

  // 검색 결과[2] 참조: 드래그 핸들러 최적화
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    panelRef.current.classList.add("dragging");
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const deltaY = (startYRef.current - e.clientY) / window.innerHeight * 100;
    setPanelHeight(prev => Math.max(10, Math.min(prev + deltaY, 85)));
    startYRef.current = e.clientY;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setPanelHeight(prev => prev > 70 ? 85 : prev > 20 ? 50 : 10);
    panelRef.current?.classList.remove("dragging");
  }, []);

  // 검색 결과[1][4] 참조: API 호출 최적화
  const fetchData = useCallback(async () => {
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const apiCall = location.pathname.startsWith('/search/results')
          ? resultBottomSheetApi
          : BottomSheetApi;

      await apiCall({
        coords,
        itemId,
        signal: abortControllerRef.current.signal,
        receivedData: (data) => {
          setLocalStorelist(data);
          setStorelist(data);
        }
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('API Error:', err);
    }
  }, [coords.lat, coords.lng, itemId, location.pathname]);

  useEffect(() => {
    fetchData();
    return () => abortControllerRef.current.abort();
  }, [fetchData]);

  // 검색 결과[5] 참조: CSS containment 적용
  return (
      <div
          ref={panelRef}
          className="bottom-sheet"
          style={{
            height: `${panelHeight}%`,
            contain: 'content',  // 렌더링 최적화
            transition: isDraggingRef.current ? "none" : "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
      >
        <div className="drag-handle" />

        <div className="bottom-sheet-content">
          <h3 style={{ marginTop: 30 }}>근처 매장 리스트</h3>
          {LocalStorelist.length ? (
              <ul style={{ contentVisibility: 'auto' }}>
                {LocalStorelist.map((store) => (
                    <li
                        key={store.storeNo}
                        onClick={() => navigate(`/storedetail/${store.storeNo}`)}
                    >
                      <span className="store-name">{store.storeName}</span>
                      <span className="store-distance">
                  {parseFloat(store.distance).toFixed(0)}m
                </span>
                    </li>
                ))}
              </ul>
          ) : (
              <p>근처에 매장이 없거나 검색한 제품을 가진 매장이 없어요. </p>
          )}
        </div>
      </div>
  );
});

export default DraggableBottomSheet;
