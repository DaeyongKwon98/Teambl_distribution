import React from "react";
import "../../styles/FriendPage/FriendDeletePopup.css"; // 기존 스타일 가져오기
import topBarIcon from "../../assets/popUpTopBar.svg";
import blueXIcon from "../../assets/Friend/blue_x_icon.svg";

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
          <p>
            1촌은 최대 50명까지만 신청할 수 있습니다.<br />
            함께하는 신뢰 커뮤니티를 위해 신중하게 결정해 주세요.
          </p>
          <div className="fd-popup-buttons">
            <button
              className="fd-delete-confirm-button"
              onClick={handleConfirm} // 최종 확인 팝업으로 이동
            >
              <img src={blueXIcon} alt="blue x icon" className="fd-bluex-icon" />
              1촌 신청
            </button>
            <button
              className="fd-cancel-button"
              onClick={() => setIsPopupOpen(false)}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestPopup;
