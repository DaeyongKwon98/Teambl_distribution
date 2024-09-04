import React from "react";
import "../styles/Friend.css";

const FriendItem = ({ activeTab, user }) => {
  const otherUserProfile = user.profile;
  const [relationshipDegree, setRelationshipDegree] = useState(null);

  // 현재 유저와 타겟 유저의 촌수를 가져오는 메소드
  const getRelationshipDegree = async (targetUserId) => {
    try {
      const response = await api.get(`/api/get-user-distance/${targetUserId}/`);
      const degree = response.data.distance;
      setRelationshipDegree(degree);
    } catch (error) {
      console.error("Error fetching relationship degree:", error);
      return null;
    }
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
                · {getRelationshipDegree(otherUser.id)}촌
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
                · {getRelationshipDegree(otherUser.id)}촌
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
                · {getRelationshipDegree(otherUser.id)}촌
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
          </div>
        </div>
      )}
    </>
  );
};

export default FriendItem;
