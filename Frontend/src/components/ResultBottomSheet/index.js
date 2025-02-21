import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import resultBottomSheetApi from "../../api/resultBottomsheetApi";
import './style.css'

const ResultBottomSheet = ({ coords, itemId, setStorelist }) => {
    const navigate = useNavigate();

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
        const deltaY = startY - currentY; // 방향 반대로 수정

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

    useEffect(() => {
        if (isDragging) {
            panelRef.current.classList.add("dragging");
        } else {
            panelRef.current.classList.remove("dragging");
        }
    }, [isDragging]);



    const [localstorelist, setLocalStorelist] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (coords) {
                try {
                    await resultBottomSheetApi({
                        coords, itemId,
                        receivedData: (data) => {
                            if (isMounted && data) {
                                setLocalStorelist(data);
                                setStorelist(data);
                            }
                        },
                    });
                } catch (error) {
                    console.error('데이터를 가져오는 중 오류 발생:', error);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

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
                <h2>근처 매장</h2>
                {localstorelist ? (
                    <ul>
                        {localstorelist.map((store, index) => (
                            <li
                                onClick={() => navigate(`/storedetail/${store.storeNo}`)}
                                key={index}
                            >
                                {store.storeName}
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

export default ResultBottomSheet;
