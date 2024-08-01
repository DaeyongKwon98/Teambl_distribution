import React, { useState, useEffect } from "react";
import api from "../api"; // Axios 인스턴스 import
import "../styles/Invite.css"; // CSS 파일 임포트

function Invite() {
  const [name, setName] = useState("");
  const [links, setLinks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [linkToRemove, setLinkToRemove] = useState(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await api.get('/api/invitation-links/');
      setLinks(response.data);
    } catch (error) {
      console.error("Failed to fetch invite links:", error);
    }
  };

  const handleInputChange = (e) => {
    setName(e.target.value);
  };

  const generateLink = async () => {
    if (name.trim() !== "") {
      try {
        const response = await api.post('/api/create-invitation-link/', { name });
        const newLink = { invitee_name: name, inviter_name: response.data.inviter_name, link: response.data.link, id: response.data.id }; // ID와 이름을 포함하여 newLink 객체 생성
        setLinks([...links, newLink]);
        setName(""); // 입력 필드를 초기화
      } catch (error) {
        console.error("Failed to generate invite link:", error);
        console.log("Error response data:", error.response.data);
      }
    } else {
      alert("Please enter a name.");
    }
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      alert("Invite link copied to clipboard!");
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleRemoveLink = (linkObj) => {
    setLinkToRemove(linkObj); // linkToRemove에 링크 객체를 설정
    setShowPopup(true);
  };

  const confirmRemoveLink = async () => {
    try {
      await api.delete(`/api/delete-invitation-link/${linkToRemove.id}/`); // linkToRemove.id 사용
      setLinks(links.filter(link => link.id !== linkToRemove.id));
      setShowPopup(false);
      setLinkToRemove(null);
    } catch (error) {
      console.error("Failed to delete invite link:", error);
    }
  };

  const cancelRemoveLink = () => {
    setShowPopup(false);
    setLinkToRemove(null);
  };

  return (
    <div className="invite-container">
      <h1>Invite Friends</h1>
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={handleInputChange}
      />
      <button onClick={generateLink}>Generate Invite Link</button>
      <h2>Generated Links</h2>
      <ul>
        {links.map((linkObj, index) => (
          <li key={index}>
            <p>{linkObj.invitee_name}: <a href={linkObj.link}>{linkObj.link}</a></p>
            <button onClick={() => copyToClipboard(linkObj.link)}>Copy Link</button>
            <button onClick={() => handleRemoveLink(linkObj)}>Revoke Invite</button>
          </li>
        ))}
      </ul>

      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <h2>초대를 회수할까요?</h2>
            <button onClick={confirmRemoveLink}>회수</button>
            <button onClick={cancelRemoveLink}>취소</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invite;
