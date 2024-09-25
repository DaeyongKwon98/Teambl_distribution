import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import pendingIcon from "../assets/Friend/pending.svg";
import acceptIcon from "../assets/Friend/accept.svg";
import rejectIcon from "../assets/Friend/reject.svg";
import ProfileDefaultImg from "../assets/default_profile_image.svg";
import threeDotsImg from "../assets/three_dots.svg";
import FriendDeletePopup from "../pages/FriendPage/FriendDeletePopup";
import FriendAcceptPopup from "../pages/FriendPage/FriendAcceptPopup";
import "../styles/Friend.css";

const FriendItem = ({ activeTab, chon, currentUser, getChons }) => {
  const navigate = useNavigate();
  const user =
    chon.from_user.id === currentUser.id ? chon.to_user : chon.from_user;
  const otherUserProfile = user.profile;
  const [relationshipDegree, setRelationshipDegree] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isAcceptPopupOpen, setIsAcceptPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 현재 유저와 타겟 유저의 촌수를 가져오는 메소드
  const getRelationshipDegree = async (targetUserId) => {
    try {
      const response = await api.get(`/api/get-user-distance/${targetUserId}/`);
      const degree = response.data.distance;
      setRelationshipDegree(degree);
      console.log(degree);
    } catch (error) {
      console.error("Error fetching relationship degree:", error);
      return null;
    }
  };

  // 1촌 리스트를 업데이트 하는 함수 (1촌 요청 수락, 1촌 요청 거절)
  const updateFriendStatus = (id, status) => {
    setIsLoading(true);
    api
      .patch(`/api/friends/update/${id}/`, { status })
      .then((response) => {
        if (status === "accepted") {
          alert("1촌 신청 수락 완료");
        } else if (status == "rejected") {
          alert("1촌 신청 거절 완료");
        } else {
          alert("친구 업데이트 완료");
        }
        getChons();
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("There was an error updating the friend status!", error);
        setIsLoading(false);
      });
  };

  // 1촌을 삭제하는 함수
  const handleDeleteFriend = async () => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/api/friends/delete/${chon.id}/`);
      if (response.status === 204) {
        setIsDeletePopupOpen(false);
        getChons(); // 친구 목록을 다시 불러옴
      } else {
        alert("친구 삭제 실패");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error deleting friend:", error);
      setIsLoading(false);
    }
  };

  // 친구 정보를 표시하는 재사용 가능한 함수
  const renderFriendDetails = () => (
    <>
      <img
        src={otherUserProfile.image || ProfileDefaultImg}
        alt={otherUserProfile.user_name}
        className="friend-profile-image"
      />
      <div className="friend-member-info">
        <p className="friend-member-name-relation">
          <strong className="friend-member-name">
            {otherUserProfile.user_name}
          </strong>
          <span className="friend-member-relation">
            {" "}
            · {relationshipDegree ? `${relationshipDegree}촌` : "4촌 이상"}
          </span>
        </p>
        <p className="friend-member-details">
          {otherUserProfile.school} | {otherUserProfile.current_academic_degree}{" "}
          | {otherUserProfile.year % 100}학번
        </p>
        <p className="friend-member-details">
          {otherUserProfile.major1}
          {otherUserProfile.major2 && ` • ${otherUserProfile.major2}`}
        </p>
      </div>
    </>
  );

  useEffect(() => {
    getRelationshipDegree(user.id);
  }, [user]);


  if (isLoading) {
    return (
      <div className='friend-loader-container'>
        <div className='friend-loader'>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeTab === "myChons" && (
        <div
          className="friend-team-member"
          key={user.id}
          onClick={() => {
            if (!isDeletePopupOpen) {
              navigate(`/profile/${user.id}`);
            }
          }}
        >
          {renderFriendDetails()}
          <img
            src={threeDotsImg}
            alt="three dots image"
            className="friend-threedots-image"
            onClick={(e) => {
              e.stopPropagation(); // Prevents the parent div's onClick from firing
              setIsDeletePopupOpen(true);
            }}
          />
          {isDeletePopupOpen && (
            <FriendDeletePopup
              setIsPopupOpen={setIsDeletePopupOpen}
              handleDeleteFriend={handleDeleteFriend}
              friendName={otherUserProfile.user_name}
            />
          )}
        </div>
      )}

      {activeTab === "addChons" && (
        <div
          className="friend-team-member"
          key={user.id}
          onClick={() => {
            if (!isDeletePopupOpen) {
              navigate(`/profile/${user.id}`);
            }
          }}
        >
          {renderFriendDetails()}
          <div className="friend-wait-acceptance">
            <img src={pendingIcon}></img>
          </div>
        </div>
      )}

      {activeTab === "requestsToMe" && (
        <div
          className="friend-team-member"
          key={user.id}
          onClick={() => {
            if (!isDeletePopupOpen) {
              navigate(`/profile/${user.id}`);
            }
          }}
        >
          {renderFriendDetails()}
          <div className="friend-action-buttons">
            <button
              className="friend-reject-button"
              onClick={(e) => {
                e.stopPropagation(); // Stops event propagation to parent div
                updateFriendStatus(chon.id, "rejected");
              }}
            >
              <img src={rejectIcon}></img>
            </button>
            <button
              className="friend-accept-button"
              onClick={(e) => {
                e.stopPropagation(); // 팝업 외부 클릭 방지
                setIsAcceptPopupOpen(true); // 수락 팝업 열기
              }}
            >
              <img src={acceptIcon}></img>
            </button>
          </div>

          {isAcceptPopupOpen && (
            <FriendAcceptPopup
              setIsPopupOpen={setIsAcceptPopupOpen}
              handleConfirmAccept={() =>
                updateFriendStatus(chon.id, "accepted")
              } // 수락 처리 함수 호출
              friendName={otherUserProfile.user_name}
            />
          )}
        </div>
      )}
    </>
  );
};

export default FriendItem;
