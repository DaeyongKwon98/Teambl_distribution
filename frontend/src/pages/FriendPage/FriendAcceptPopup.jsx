import React from "react";
import "../../styles/FriendPage/FriendDeletePopup.css"; // 기존 스타일 가져오기
import blueXIcon from "../../assets/Friend/blue_x_icon.svg";

const FriendAcceptPopup = ({ setIsPopupOpen, handleConfirmAccept, friendName }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsPopupOpen(false); // 팝업 외부 클릭 시 닫기
    }
  };

  return (
    <div className="fd-popup-overlay-wrapper" onClick={handleOverlayClick}>
      <div className="fd-modal-overlay">
        <div className="fd-withdraw-modal-content">
          <div className="fd-modal-title">
            {/* <img src={blueXIcon} alt="수락 아이콘" className="fd-withdraw-icon" /> */}
            <p>1촌 수락</p>
          </div>
          <p className="fd-modal-description">
            {friendName}님의 1촌 신청을 수락하시겠습니까? <br />
            1촌은 최대 50명까지 가능하므로 신중히 결정해주세요.
          </p>
          <div className="fd-modal-buttons">
            <button
              className="fd-modal-button fd-cancel-button"
              onClick={(e) => {
                e.stopPropagation(); // 부모로의 이벤트 전파 막기
                setIsPopupOpen(false);
              }}
            >
              취소
            </button>
            <button
              className="fd-modal-button fd-confirm-button"
              onClick={(e) => {
                e.stopPropagation(); // 부모로의 이벤트 전파 막기
                handleConfirmAccept(); // 수락 처리
                setIsPopupOpen(false); // 팝업 닫기
              }}
            >
              수락
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendAcceptPopup;
