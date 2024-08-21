import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/Notification.css";

const Notification = () => {
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

  // 알림 추가하기
  const addNotification = async () => {
    try {
      const response = await api.post("/api/notifications/", {
        message: newMessage,
      });
      setNotifications([response.data, ...notifications]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to add notification", error);
    }
  };

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

  return (
    <div className="notification-container">
      <h1>Notifications</h1>

      {/* 알림 추가 기능 주석처리 */}
      {/* <div className="notification-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Enter notification message"
        />
        <button onClick={addNotification}>추가</button>
      </div> */}

      <div>
        <h2>Notification List</h2>
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={notification.is_read ? "read" : "unread"}
            >
              {selectedNotification === notification.id ? (
                <>
                  <input
                    type="text"
                    className="edit-input-text"
                    value={editMessage}
                    onChange={(e) => setEditMessage(e.target.value)}
                    placeholder="Edit notification message"
                  />
                  <div className="edit-buttons">
                    {/* 주석 처리된 부분 - 수정 관련 버튼들 */}
                    {/* <button
                      className="save"
                      onClick={() =>
                        updateNotification({ id: notification.id })
                      }
                    >
                      저장
                    </button>
                    <button
                      className="cancel"
                      onClick={() => setSelectedNotification(null)}
                    >
                      취소
                    </button> */}
                  </div>
                </>
              ) : (
                <>
                  <div className="notification-header">
                    <span className="message">{notification.message}</span>
                    <span className="status">
                      {notification.is_read ? "읽음" : "읽지 않음"}
                    </span>
                  </div>

                  <div className="notification-buttons">
                    {/* 읽음 표시 버튼은 그대로 남겨둠 */}
                    {!notification.is_read && (
                      <button
                        className="mark-read"
                        onClick={() =>
                          updateNotification({
                            id: notification.id,
                            isReadButtonClicked: true,
                          })
                        }
                      >
                        읽음 표시
                      </button>
                    )}
                    {/* 주석 처리된 부분 - 수정 버튼 */}
                    {/* <button
                      className="edit"
                      onClick={() => {
                        setSelectedNotification(notification.id);
                        setEditMessage(notification.message);
                      }}
                    >
                      수정
                    </button> */}
                    <button
                      className="delete"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      삭제
                    </button>
                  </div>

                  <div className="created-at">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Notification;
