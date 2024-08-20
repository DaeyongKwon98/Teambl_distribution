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
  const [error, setError] = useState(false);
  const [errorType, setErrorType] = useState('');  // 에러 타입을 저장하기 위한 상태

  useEffect(() => {
    if (code) {
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log("API URL:", apiUrl);
      axios.get(`${apiUrl}/api/welcome/?code=${code}`)
        .then(response => {
          console.log("API response:", response.data);
          setInviterName(response.data.inviter_name);
          setInviteeName(response.data.invitee_name);
          localStorage.setItem('invited', 'true');
          localStorage.setItem('invite_code', code);  // 초대 코드를 로컬 스토리지에 저장
        })
        .catch(error => {
          console.error("There was an error fetching the invitation details:", error);
          if (error.response && error.response.data.error_type) {
            setErrorType(error.response.data.error_type);  // error_type 상태 업데이트
          } else {
            setErrorType('unknown');  // 알 수 없는 오류의 경우
          }
          setError(true);
        });
    } else {
      setErrorType('invalid');
      setError(true);
    }
  }, [code]);

  const handleRegister = () => {
    navigate('/certify');
  };

  if (error) {
    if (errorType === 'expired') {
      return (
        <div className="error-container">
          <h1>초대 링크가 만료되었습니다.</h1>
          <p>새로운 링크를 요청해 주세요.</p>
        </div>
      );
    } else if (errorType === 'invalid') {
      return (
        <div className="error-container">
          <h1>유효하지 않은 초대 링크입니다.</h1>
          <p>올바른 링크를 사용해 주세요.</p>
        </div>
      );
    } else {
      return (
        <div className="error-container">
          <h1>알 수 없는 오류가 발생했습니다.</h1>
          <p>다시 시도해 주세요.</p>
        </div>
      );
    }
  }

  return (
    <div className='welcome'>
      <div className='welcome-container'>
        <div className='welcome-intro'>
          <span className='welcome-name' style={{color: '#0000b3'}}>{inviterName}</span><span className='welcome-name'>님이&nbsp; </span>
          <span className='welcome-name' style={{color: '#0000b3'}} >{inviteeName}</span><span className='welcome-name'>님을 팀블에 초대했습니다.</span>
        </div>
        <div className='welcome-teambl'>팀원 찾기의 새로운 기준, 팀블!</div>
        <label className='welcome-outro'>지인 네트워크를 통해 최적의 팀원을 구하세요.</label>
        <button type='button' className='welcome-nextBtn' onClick={handleRegister}>회원가입 시작하기</button>
      </div>
    </div>
  );
}

export default Welcome;
