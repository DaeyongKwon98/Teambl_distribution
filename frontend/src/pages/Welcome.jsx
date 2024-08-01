import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

const Welcome = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code');
  const navigate = useNavigate();

  const [inviterName, setInviterName] = useState('');
  const [inviteeName, setInviteeName] = useState('');
  const [error, setError] = useState(false); // 에러 상태 추가

  useEffect(() => {
    if (code) {
      axios.get(`http://127.0.0.1:8000/api/welcome/?code=${code}`)
        .then(response => {
          setInviterName(response.data.inviter_name);
          setInviteeName(response.data.invitee_name);
          localStorage.setItem('invited', 'true');
        })
        .catch(error => {
          console.error("There was an error fetching the invitation details:", error);
          setError(true); // 에러 상태 설정
        });
    } else {
      setError(true); // 코드가 없는 경우에도 에러 상태 설정
    }
  }, [code]);

  const handleRegister = () => {
    navigate('/register');
  };

  if (error) {
    return (
      <div className="error-container">
        <h1>유효하지 않은 초대 링크입니다.</h1>
        <p>올바른 링크를 사용해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <h1>환영합니다, {inviteeName}님.</h1>
      <p>{inviterName}님이 {inviteeName}님을 초대했습니다.</p>
      <button onClick={handleRegister}>회원가입</button>
    </div>
  );
}

export default Welcome;
