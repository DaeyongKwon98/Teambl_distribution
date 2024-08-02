import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Friend.css";
import api from "../api";

function Friend() {
  const [friendList, setFriendList] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser();
    getFriends();
  }, []);

  const getCurrentUser = () => {
    api
      .get("/api/current-user/")
      .then((res) => res.data)
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((err) => alert(err));
  };

  const getFriends = () => {
    api
      .get("/api/friends/")
      .then((res) => res.data)
      .then((data) => {
        setFriendList(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };

  const goToInvitePage = () => {
    navigate("/invite");
  };

  const addFriend = (e) => {
    e.preventDefault();

    api
      .post("/api/friends/", {
        to_user_email: friendEmail,
      })
      .then((res) => {
        if (res.status === 201) alert("친구 추가 완료!");
        else alert("친구 추가 실패");
        getFriends();
        setFriendEmail("");
      })
      .catch((error) => {
        console.log(error.response);
        console.log(error.message);
        if (error.response) {
          alert(`친구 추가 실패: ${error.response.data}`);
        } else {
          alert(`친구 추가 실패: ${error.message}`);
        }
      });
  };

  const updateFriendStatus = (id, status) => {
    api
      .patch(`/api/friends/update/${id}/`, { status })
      .then((response) => {
        alert("친추 업데이트 완료");
        getFriends();
      })
      .catch((error) => {
        console.error("There was an error updating the friend status!", error);
      });
  };

  const deleteFriend = (id) => {
    api
      .delete(`/api/friends/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) alert("Friend deleted!");
        else alert("Failed to delete Friend.");
        getFriends();
      })
      .catch((error) => alert(error));
  };

  return (
    <div className="friend-container">
      <h1>This is friends page.</h1>
      <button onClick={goToInvitePage}>Go to Invite Page</button>

      <input
        type="text"
        id="email"
        name="email"
        placeholder="이메일을 입력해주세요."
        required
        value={friendEmail}
        onChange={(e) => setFriendEmail(e.target.value)}
      />
      <button onClick={addFriend}>1촌 맺기 요청</button>

      <div>
        <h2>친구 목록</h2>
        {friendList.map((friend) => (
          <div key={friend.id}>
            <p>
              {`${friend.from_user.email} 과 1촌인 친구 ${friend.to_user.email}`}{" "}
              (1촌 신청 상태: {friend.status})
            </p>
            {friend.status !== 'pending' && (
              <button onClick={() => deleteFriend(friend.id)}>1촌 삭제하기</button>
            )}
            {currentUser && currentUser.email === friend.to_user.email && friend.status === 'pending' && (
              <>
                <button onClick={() => updateFriendStatus(friend.id, "accepted")}>
                  수락
                </button>
                <button onClick={() => updateFriendStatus(friend.id, "rejected")}>
                  거절
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Friend;
