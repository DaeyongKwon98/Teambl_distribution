import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "../styles/FriendOther.css";
import backIcon from "../assets/ProfileOther/left-arrow.svg";
import api from "../api";
import FriendOtherItem from "../components/FriendOtherItem";

export default function FriendOther() {
  const location = useLocation();
  const { id } = useParams(); /** id of the profile owner */

  /** loading, onerr states */
  const [isLoading, setIsLoading] = useState(true);
  const [isOnError, setIsOnError] = useState(false);
  /** data states */
  const [userInfo, setUserInfo] = useState({});
  const [friendList, setFriendList] = useState([]);

  /** fetch current user information (no state diff) */
  const fetchCurrentUser = async (callback) => {
    try {
      const res = await api.get("/api/current-user/");
      await callback(res.data?.id);
    } catch (error) {
      await setIsOnError(true);
      await setIsLoading(false);
      console.error("Failed to fetch current user:", error);
    }
  };

  /** fetch friend list of the user */
  const fetchFriendList = async (currentUserId) => {
    try {
      /** TODO : MUST be edited after API endpoint is made */
      const response = await api.get(`/api/friends/${id}/`, {});

      const friend_list = response.data
        .map((friend) => {
          // "accept"이 아닌 상태는 제외
          if (friend.status !== "accepted") {
            return null;
          }

          // from_user와 to_user 중 프로필 유저와 ID가 다른 유저만 선택
          if (friend.from_user.id !== Number(id)) {
            return friend.from_user;
          } else if (friend.to_user.id !== Number(id)) {
            return friend.to_user;
          }
          return null;
        })
        .filter((user) => user !== null); // null 값을 필터링하여 제거

      /** 본인이 포함된 경우 맨 앞으로 순서 변경 */
      const withoutMeList = friend_list.filter((friendData) => {
        if (friendData["id"] === currentUserId) {
          return false;
        } else {
          return true;
        }
      });
      const withMeList = friend_list.filter((friendData) => {
        if (friendData["id"] === currentUserId) {
          return true;
        } else {
          return false;
        }
      });
      const new_friend_list = [...withMeList, ...withoutMeList];

      await setFriendList(new_friend_list);
      await setIsLoading(false);
    } catch (e) {
      console.error(e);
      await setIsOnError(true);
      await setIsLoading(false);
    }
  };

  /** fetch friend list of the user */
  /** callback function MUST be provided */
  const fetchUserInfo = async (callback) => {
    await setIsLoading(true);
    try {
      const res = await api.get(`/api/user/${id}/`);
      await setUserInfo(res.data.profile);
      await callback();
    } catch (e) {
      console.error(e);
      await setIsOnError(true);
      await setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo(() => fetchCurrentUser(fetchFriendList));
  }, []);

  /** loading */
  if (isLoading) {
    return (
      <div className="friendOther-loader-container">
        <div className="friendOther-loader" />
      </div>
    );
  }

  /** error */
  if (isOnError) {
    return (
      <div className="friendOther-body">
        <div className="friendOther-container">
          {/** Backward button and Title */}
          <div className="friendOther-title-container">
            <button
              className="friendOther-backbutton"
              onClick={() => window.history.back()}
            >
              <img src={backIcon} />
            </button>
          </div>
        </div>
        <div className="friendOther-error-container">
          {"일촌 정보를 불러오는 데 실패했습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className="friendOther-body">
      <div className="friendOther-container">
        {/** top fixed area */}
        <div className="friendOther-toparea-container top-sticky top-0px">
          {/** Backward button and Title */}
          <div className="friendOther-title-container">
            <button
              className="friendOther-backbutton"
              onClick={() => window.history.back()}
            >
              <img src={backIcon} />
            </button>
            <span className="friendOther-title margin-left-15px">
              {`${userInfo["user_name"] ? userInfo["user_name"] : ""}님의 1촌`}
            </span>
          </div>
          {/** Number of friends */}
          <div className="friendOther-friend-number-container">
            <span className="friendOther-friend-number">
              {`${friendList.length}명`}
            </span>
          </div>
        </div>
        {/** actual list view */}
        <div className="friendOther-item-container">
          {friendList.map((friendInfo) => {
            return (
              <FriendOtherItem
                key={friendInfo["id"]}
                id={friendInfo["id"]}
                friendInfo={friendInfo.profile}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
