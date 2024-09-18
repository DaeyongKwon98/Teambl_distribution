import React from "react";
import "../../styles/FriendPage/FriendDeletePopup.css"; // 기존 스타일 가져오기
import topBarIcon from "../../assets/popUpTopBar.svg";

const FriendRequestPopup = ({ setIsPopupOpen, handleConfirm }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsPopupOpen(false); // 팝업 외부 클릭 시 닫기
    }
  };

  return (
    <div className="fd-popup-overlay-wrapper" onClick={handleOverlayClick}>
      <div className="fd-popup-overlay">
        <div className="fd-popup-top">
          <img src={topBarIcon} alt="popup top bar" />
        </div>
        <div className="fd-popup-radio-container">
          <p>정말로 1촌을 신청하시겠습니까?</p>
          <div className="fd-popup-buttons">
            <button
              className="fd-cancel-button"
              onClick={() => setIsPopupOpen(false)}
            >
              취소
            </button>
            <button
              className="fd-confirm-button"
              onClick={handleConfirm}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestPopup;
