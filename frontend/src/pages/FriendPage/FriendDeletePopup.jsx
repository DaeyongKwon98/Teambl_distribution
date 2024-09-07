import React from "react";
import "../../styles/FriendPage/FriendDeletePopup.css";
import topBarIcon from "../../assets/popUpTopBar.svg";

const FriendDeletePopup = ({ setIsPopupOpen, handleDeleteFriend }) => {
  // Handle clicking outside the popup to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsPopupOpen(false); // Close popup
    }
  };
  
  return (
    <div className="fd-popup-overlay-wrapper" onClick={handleOverlayClick}>
      <div className="fd-popup-overlay">
        <div className="fd-popup-top">
          <img src={topBarIcon} alt="popup top bar" />
        </div>
        <div className="fd-popup-description">
          <p>이 친구를 삭제하시겠습니까?</p>
        </div>

        <div className="fd-popup-radio-container">
          <button
            className="fd-delete-confirm-button"
            onClick={() => {
              handleDeleteFriend();
              setIsPopupOpen(false); // Close popup after deletion
            }}
          >
            1촌 끊기
          </button>
          {/* <button
            className="delete-cancel-button"
            onClick={() => setIsPopupOpen(false)}
          >
            아니오
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default FriendDeletePopup;
