import { useState } from "react";
import "./style.css";

export const StoreDetailbar = ({ onTabClick }) => {
  // 현재 활성화된 탭을 추적하는 state
  const [activeTab, setActiveTab] = useState("storeItems");

  // 버튼 클릭 시 state 업데이트 및 onTabClick 호출
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    onTabClick(tabName);
  };

  return (
    <div className="box">
      <button
        className={`storedetailbarbutton ${activeTab === "storeItems" ? "active" : ""}`}
        onClick={() => handleTabClick("storeItems")}
      >
        제품정보
      </button>
      <button
        className={`storedetailbarbutton ${activeTab === "fliItems" ? "active" : ""}`}
        onClick={() => handleTabClick("fliItems")}
      >
        플리마켓
      </button>
      <button
        className={`storedetailbarbutton ${activeTab === "announcements" ? "active" : ""}`}
        onClick={() => handleTabClick("announcements")}
      >
        공지사항
      </button>
    </div>
  );
};

export default StoreDetailbar;
