import React from "react";
import "../../styles/ProfilePage/CurrentAcademicDegreePopUp.css";
import topBarIcon from "../../assets/popUpTopBar.svg";

const FriendDeletePopup = ({ setIsPopupOpen, handleDeleteFriend }) => {
  // Handle clicking outside the popup to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsPopupOpen(false); // Close popup
    }
  };

  return (
    <div className="cad-popup-overlay-wrapper" onClick={handleOverlayClick}>
      <div className="cad-popup-overlay">
        <div className="cad-popup-top">
          <img src={topBarIcon} alt="popup top bar" />
        </div>
        <div className="cad-popup-description">
          <h3>친구 삭제</h3>
          <p>이 친구를 삭제하시겠습니까?</p>
        </div>

        <div className="cad-popup-radio-container">
          <button
            className="delete-confirm-button"
            onClick={() => {
              handleDeleteFriend();
              setIsPopupOpen(false); // Close popup after deletion
            }}
          >
            예, 삭제합니다
          </button>
          <button
            className="delete-cancel-button"
            onClick={() => setIsPopupOpen(false)}
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendDeletePopup;
