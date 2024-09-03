import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Notification.css";

const Notification = ({ updateUnreadCount }) => {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 알림 목록 불러오기
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/notifications/");
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  // // 알림 추가하기
  // const addNotification = async () => {
  //   try {
  //     const response = await api.post("/api/notifications/", {
  //       message: newMessage,
  //     });
  //     setNotifications([response.data, ...notifications]);
  //     setNewMessage("");
  //   } catch (error) {
  //     console.error("Failed to add notification", error);
  //   }
  // };

  // 알림 수정하기
  const updateNotification = async ({ id, isReadButtonClicked = false }) => {
    try {
      const newData = isReadButtonClicked
        ? { is_read: true }
        : { message: editMessage };

      const response = await api.patch(
        `/api/notifications/update/${id}/`,
        newData
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id ? response.data : notification
        )
      );

      if (!isReadButtonClicked) {
        setEditMessage("");
        setSelectedNotification(null);
      }
      
      // // 읽음 상태가 업데이트된 후 읽지 않은 알림 개수를 다시 계산하여 부모에게 전달
      // const unreadCount = notifications.filter(notification => !notification.is_read).length - 1;

      // 알림을 읽음으로 표시한 이후, 직접 읽지 않은 알림 개수를 다시 계산하여 부모에게 전달
      const unreadCount = notifications.reduce((count, notification) => {
        if (notification.id === id) {
          // 방금 읽은 알림은 읽음 처리로 가정
          return count;
        }
        return count + (notification.is_read ? 0 : 1);
      }, 0);
      
      updateUnreadCount(unreadCount);
      
    } catch (error) {
      console.error("Failed to update notification", error);
    }
  };

  // 알림 삭제하기
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/delete/${id}/`);
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  // 알림 시간 계산 함수
  const timeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / 60000);
  
    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes === 1) return "1분 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1시간 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
  
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1일 전";
    return `${diffInDays}일 전`;
  };

  const handleNotificationClick = async (notification) => {
    console.log("Notification Clicked: ", notification); // 로그 추가
    
    // 알림을 읽음 상태로 업데이트
    if (!notification.is_read) {
      try {
        await updateNotification({
          id: notification.id,
          isReadButtonClicked: true,
        });
  
        // 여기서 unreadCount를 다시 계산하여 업데이트
        const unreadCount = notifications.filter(n => !n.is_read).length - 1;
        updateUnreadCount(unreadCount);
        
      } catch (error) {
        console.error("Failed to mark notification as read", error);
        return; // 실패했을 경우 페이지 이동을 막습니다.
      }
    }
    
    switch (notification.notification_type) {
        case 'invitation_register':
            if (notification.related_user_id) {
                console.log("Navigating to profile with ID: ", notification.related_user_id);
                navigate(`/profile/${notification.related_user_id}`);
            } else {
                console.error("No related_user_id found for this notification");
            }
            break;
        case 'invitation_expired':
            navigate("/invite");
            break;
        case 'friend_accept':
            if (notification.related_user_id) {
                console.log("Navigating to profile with ID: ", notification.related_user_id);
                navigate(`/profile/${notification.related_user_id}`);
            } else {
                console.error("No related_user_id found for this notification");
            }
            break;
        case 'friend_request':
            navigate("/friends");
            break;
        default:
            break;
      }
  };

  // 메시지 줄바꿈 처리, 유저이름 굵게 표시하는 함수 (하드코딩)
  const formatMessage = (message) => {
    if (message.includes("님이 팀블에 가입했습니다.")) {
      const parts = message.split("님이 팀블에 가입했습니다.\n");
      const userName = parts[0].replace("내가 초대한 ", "");
      return (
        <>
          내가 초대한 <strong>{userName}</strong>님이 팀블에 가입했습니다.
          <br />
          <span><strong>{userName}</strong>님의 프로필을 지금 확인해보세요!</span>
        </>
      );
    } else if (message.includes("님의 초대 링크가 만료됐습니다.")) {
      const parts = message.split("님의 초대 링크가 만료됐습니다.\n");
      const userName = parts[0].replace("내가 초대한 ", "");
      return (
        <>
          내가 초대한 <strong>{userName}</strong>님의 초대 링크가 만료됐습니다.
          <br />
          <span>초대 링크를 다시 생성해주세요!</span>
        </>
      );
    } else if (message.includes("일촌 신청을 수락")) {
      const parts = message.split("님이 일촌 신청을 수락했습니다.\n");
      return (
        <>
          <strong>{parts[0]}</strong>님이 일촌 신청을 수락했습니다.
          <br />
          <span><strong>{parts[0]}</strong>님의 프로필을 확인해보세요!</span>
        </>
      );
    } else if (message.includes("일촌 신청이 도착")) {
      const parts = message.split("님의 일촌 신청이 도착했습니다.\n");
      return (
        <>
          <strong>{parts[0]}</strong>님의 일촌 신청이 도착했습니다.
          <br />
          <span><strong>{parts[0]}</strong>님의 일촌 리스트에서 확인해보세요!</span>
        </>
      );
    } else if (message.includes("일촌 신청을 거절")) {
      const parts = message.split("님이 일촌 신청을 거절했습니다.");
      return (
        <>
          <strong>{parts[0]}</strong>님이 일촌 신청을 거절했습니다.
        </>
      );
    } else {
      return <>{message}</>;
    }
  };
  
  return (
    <div className="notification-container">
      <div className="notification-back">
        <button type="button" onClick={() => window.history.back()}></button>
      </div>
      <h1>알림</h1>  
      <div>
        {/* <h2>Notification List</h2> */}
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.is_read ? "read" : "unread"}
              onClick={() => {
                if (!notification.is_read) {
                    updateNotification({
                        id: notification.id,
                        isReadButtonClicked: true,
                    });
                }
                handleNotificationClick(notification);
            }}
            > 
            <div className="notification-header">
              <span className="message">{formatMessage(notification.message)}</span>
                <button
                  className="delete"
                  onClick={(e) => {
                    e.stopPropagation(); // 클릭이 상위 요소로 전파되지 않도록 막음
                    deleteNotification(notification.id);
                  }}
                ></button>
              </div>
              <div className="created-at">{timeAgo(notification.created_at)}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Notification;
