import React, { useState, useEffect } from "react";
import api from "../api";
import pendingIcon from "../assets/Friend/pending.svg";
import acceptIcon from "../assets/Friend/accept.svg";
import rejectIcon from "../assets/Friend/reject.svg";
import ProfileDefaultImg from "../assets/default_profile_image.svg";
import "../styles/Friend.css";

const FriendItem = ({ activeTab, chon, currentUser }) => {
  const user =
    chon.from_user.id === currentUser.id ? chon.to_user : chon.from_user;
  const otherUserProfile = user.profile;
  const [relationshipDegree, setRelationshipDegree] = useState(null);

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
    api
      .patch(`/api/friends/update/${id}/`, { status })
      .then((response) => {
        alert("친구 업데이트 완료");
        getChons();
      })
      .catch((error) => {
        console.error("There was an error updating the friend status!", error);
      });
  };

  useEffect(() => {
    getRelationshipDegree(user.id);
  }, [user]);

  return (
    <>
      {activeTab === "myChons" && (
        <div className="friend-team-member" key={user.id}>
          <img
            src={
              otherUserProfile.image
                ? otherUserProfile.image
                : ProfileDefaultImg
            }
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
                · {relationshipDegree}촌
              </span>
            </p>
            <p className="friend-member-details">
              {otherUserProfile.school} |{" "}
              {otherUserProfile.current_academic_degree} |{" "}
              {otherUserProfile.year % 100}학번
            </p>
            <p className="friend-member-details">
              {otherUserProfile.major1}
              {otherUserProfile.major2 && ` • ${otherUserProfile.major2}`}
            </p>
            {/* <p className="friend-member-keywords">
            {otherUserProfile.keywords.join(" / ")}
          </p> */}
          </div>
        </div>
      )}

      {activeTab === "addChons" && (
        <div className="friend-team-member" key={user.id}>
          <img
            src={
              otherUserProfile.image
                ? otherUserProfile.image
                : ProfileDefaultImg
            }
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
                · {relationshipDegree}촌
              </span>
            </p>
            <p className="friend-member-details">
              {otherUserProfile.school} |{" "}
              {otherUserProfile.current_academic_degree} |{" "}
              {otherUserProfile.year % 100}학번
            </p>
            <p className="friend-member-details">
              {otherUserProfile.major1}
              {otherUserProfile.major2 && ` • ${otherUserProfile.major2}`}
            </p>
            {/* <p className="friend-member-keywords">
            {otherUserProfile.keywords.join(" / ")}
          </p> */}
          </div>
          <div className="friend-wait-acceptance">
            <img src={pendingIcon}></img>
          </div>
        </div>
      )}

      {activeTab === "requestsToMe" && (
        <div className="friend-team-member" key={user.id}>
          <img
            src={
              otherUserProfile.image
                ? otherUserProfile.image
                : ProfileDefaultImg
            }
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
                · {relationshipDegree}촌
              </span>
            </p>
            <p className="friend-member-details">
              {otherUserProfile.school} |{" "}
              {otherUserProfile.current_academic_degree} |{" "}
              {otherUserProfile.year % 100}학번
            </p>
            <p className="friend-member-details">
              {otherUserProfile.major1}
              {otherUserProfile.major2 && ` • ${otherUserProfile.major2}`}
            </p>
            {/* <p className="friend-member-keywords">
            {otherUserProfile.keywords.join(" / ")}
          </p> */}
          </div>
          <div className="friend-action-buttons">
            <button
              className="friend-reject-button"
              onClick={() => updateFriendStatus(chon.id, "rejected")}
            >
              <img src={rejectIcon}></img>
            </button>
            <button
              className="friend-accept-button"
              onClick={() => updateFriendStatus(chon.id, "accepted")}
            >
              <img src={acceptIcon}></img>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FriendItem;
