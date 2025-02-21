import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomSheetApi from "../../api/BottomSheetApi";
import resultBottomSheetApi from "../../api/resultBottomsheetApi";
import "./DraggableBottomSheet.css";

const DraggableBottomSheet = memo(({ coords, setStorelist, itemId = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [panelHeight, setPanelHeight] = useState(10);
  const panelRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const abortControllerRef = useRef(new AbortController());
  const [localStoreList, setLocalStoreList] = useState([]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    panelRef.current.classList.add("dragging");
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const deltaY = ((startYRef.current - e.clientY) / window.innerHeight) * 100;
    setPanelHeight((prev) => Math.max(10, Math.min(prev + deltaY, 85)));
    startYRef.current = e.clientY;
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setPanelHeight((prev) => (prev > 70 ? 85 : prev > 20 ? 50 : 10));
    panelRef.current?.classList.remove("dragging");
  }, []);

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
          setLocalStoreList(data);
          setStorelist(data);
        }
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('API Error:', err);
    }
  }, [coords.lat, coords.lng, itemId, location.pathname, setStorelist]);

  useEffect(() => {
    fetchData();
    return () => abortControllerRef.current.abort();
  }, [fetchData]);

  return (
      <div
          ref={panelRef}
          className="bottom-sheet"
          style={{
            height: `${panelHeight}%`,
            contain: 'content',
            transition: isDraggingRef.current
                ? "none"
                : "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
      >
        <div className="drag-handle" />

        <div className="bottom-sheet-content">
          <div className="fixed-header">
            <h3>근처 매장 리스트</h3>
          </div>
          <div className="scrollable-section">
            {localStoreList.length ? (
                <ul>
                  {localStoreList.map((store) => (
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
                <p>주변 매장이 없거나 검색한 제품이 근처에 없어요.<br/><br/>
                  <img src="/mylocation.png" className="bottomsheetimg"/>을 통해 위치를 바꾸거나 다른 제품은 어때요?
                </p>
            )}
          </div>
        </div>
      </div>
  );
});

export default DraggableBottomSheet;
