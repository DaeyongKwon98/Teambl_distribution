import React, { useState } from "react";
import "../../styles/FriendPage/FriendDeletePopup.css";
import topBarIcon from "../../assets/popUpTopBar.svg";
import blueXIcon from "../../assets/Friend/blue_x_icon.svg";

const FriendDeletePopup = ({ setIsPopupOpen, handleDeleteFriend }) => {
  const [showFinalDelete, setShowFinalDelete] = useState(false);
  
  // Handle clicking outside the popup to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsPopupOpen(false); // Close popup
    }
  };

  // Close the final delete confirmation popup
  const closeFriendDeleteModal = () => {
    setShowFinalDelete(false);
    setIsPopupOpen(false); // Also close the main popup
  };
  
  return (
    <div className="fd-popup-overlay-wrapper" onClick={handleOverlayClick}>
      <div className="fd-popup-overlay">
        <div className="fd-popup-top">
          <img src={topBarIcon} alt="popup top bar" />
        </div>
        <div className="fd-popup-radio-container">
          <button
            className="fd-delete-confirm-button"
            onClick={() => {
              setShowFinalDelete(true);
              setIsPopupOpen(false); // Close popup after deletion
            }}
          >
            <img src={blueXIcon} alt="blue x icon" className="fd-bluex-icon" />
            1촌 끊기
          </button>
          {/* <button
            className="delete-cancel-button"
            onClick={() => setIsPopupOpen(false)}
          >
            아니오
          </button> */}

          {showFinalDelete && (
            <div className="fd-modal-overlay">
              <div className="fd-withdraw-modal-content">
                <div className="fd-modal-title">
                  <img
                    src={WithdrawIcon}
                    alt="탈퇴 아이콘"
                    className="fd-withdraw-icon"
                  />
                  <p>1촌 끊기</p>
                </div>
                <p className="fd-modal-description">
                  000님과 1촌을 끊으시겠습니까?
                  <br />
                  1촌의 맺고 끊음은 신중히 결정해주세요.
                </p>
                <div className="fd-modal-buttons">
                  <button
                    className="fd-modal-button fd-cancel-button"
                    onClick={closeFriendDeleteModal}
                  >
                    취소
                  </button>
                  <button
                    className="fd-modal-button fd-confirm-button"
                    onClick={() => {
                      handleDeleteFriend(); // Call delete function
                      closeWithdrawModal(); // Close modal after deleting
                    }}
                  >
                    끊기
                  </button>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default FriendDeletePopup;
