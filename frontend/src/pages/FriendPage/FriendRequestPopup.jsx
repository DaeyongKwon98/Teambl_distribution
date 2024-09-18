import React from "react";
import "../../styles/FriendPage/FriendDeletePopup.css"; // 기존 스타일 가져오기
import blueXIcon from "../../assets/Friend/blue_x_icon.svg"; // 아이콘 가져오기

const FriendRequestPopup = ({ profile, closeFriendDeleteModal, addFriend }) => {
  return (
    <div className="fd-modal-overlay">
      <div className="fd-withdraw-modal-content">
        <div className="fd-modal-title">
          {/* <img
            src={blueXIcon} // 동일한 아이콘 사용
            alt="탈퇴 아이콘"
            className="fd-withdraw-icon"
          /> */}
          <p>1촌 신청</p>
        </div>
        <p className="fd-modal-description">
          {profile.user_name}님께 1촌을 신청하시겠습니까?
          <br />
          1촌은 최대 50명까지 가능하므로 신중히 결정해주세요.
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
            onClick={(e) => {
              addFriend(e); // 이벤트 객체 전달
              closeFriendDeleteModal(); // 모든 팝업 닫기
            }}
          >
            신청
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestPopup;
