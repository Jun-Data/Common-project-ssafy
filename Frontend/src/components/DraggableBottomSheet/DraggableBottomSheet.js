import React, { useState, useRef, useEffect, useCallback } from "react";
import MainpageStoreDetailApi from "../../api/MainpageStorelistApi";
import "./DraggableBottomSheet.css";

const DraggableBottomSheet = ({ coords }) => {
  const [mainpageStorelist, setMainpageStorelist] = useState(null);
  const [panelHeight, setPanelHeight] = useState(10); // 기본 높이 10%
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef(null);

  const NAV_HEIGHT = 69; // 네비게이션 높이
  const PANEL_WIDTH = "100%"; // 바텀시트 너비

  // 드래그 시작 핸들러
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY || e.touches?.[0]?.clientY;
    setStartY(startY);
    setIsDragging(true);
  };

  // 드래그 중 핸들러
  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();

    const currentY = e.clientY || e.touches?.[0]?.clientY;
    const deltaY = currentY - startY;

    requestAnimationFrame(() => {
      let newHeight = panelHeight + (deltaY / window.innerHeight) * 100;
      newHeight = Math.max(10, Math.min(newHeight, 85)); // 최소 10%, 최대 85%
      setPanelHeight(newHeight);
    });
  }, [isDragging, startY, panelHeight]);

  // 드래그 종료 핸들러
  const handlePointerUp = () => {
    setIsDragging(false);
    if (panelHeight > 20) {
      setPanelHeight(50); // 중간 위치로 스냅
    } else {
      setPanelHeight(10); // 최소 위치로 스냅
    }
  };

  // coords가 변경될 때 API 호출
  useEffect(() => {
    let isMounted = true; // 컴포넌트가 마운트 상태인지 확인
    if (coords) {
      MainpageStoreDetailApi({
        coords,
        receivedData: (data) => {
          if (isMounted) setMainpageStorelist(data);
        },
      });
    }
    return () => {
      isMounted = false; // 언마운트 시 상태 업데이트 방지
    };
  }, [coords]);

  // 드래그 중 transition 비활성화
  useEffect(() => {
    if (isDragging) {
      panelRef.current.classList.add("dragging");
    } else {
      panelRef.current.classList.remove("dragging");
    }
  }, [isDragging]);

  return (
      <div
          ref={panelRef}
          className="bottom-sheet"
          style={{
            height: `${panelHeight}%`,
            bottom: `${NAV_HEIGHT}px`,
            width: `${PANEL_WIDTH}`,
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
      >
        {/* 드래그 핸들 */}
        <div className="drag-handle" onPointerDown={handlePointerDown}></div>

        {/* 바텀시트 내용 */}
        <div className="bottom-sheet-content">
          <h2>매장 리스트</h2>
          <p>위도: {coords?.lat}</p>
          <p>경도: {coords?.lng}</p>
          {mainpageStorelist ? (
              <ul>
                {mainpageStorelist.map((store, index) => (
                    <li key={index}>{store.name}</li>
                ))}
              </ul>
          ) : (
              <p>데이터를 불러오는 중...</p>
          )}
        </div>
      </div>
  );
};

export default DraggableBottomSheet;
