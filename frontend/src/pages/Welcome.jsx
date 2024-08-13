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

  useEffect(() => {
    if (code) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // Vercel 환경 변수에서 백엔드 URL 가져오기
      console.log("API URL:", apiUrl);
      axios.get(`${apiUrl}/api/welcome/?code=${code}`)
        .then(response => {
          setInviterName(response.data.inviter_name);
          setInviteeName(response.data.invitee_name);
          localStorage.setItem('invited', 'true');
          localStorage.setItem('invite_code', code);  // 초대 코드를 로컬 스토리지에 저장
        })
        .catch(error => {
          console.error("There was an error fetching the invitation details:", error);
          setError(true);
        });
    } else {
      setError(true);
    }
  }, [code]);

  const handleRegister = () => {
    navigate('/certify');
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
    // <div className="welcome-container">
    //   <h1>환영합니다, {inviteeName}님.</h1>
    //   <p>{inviterName}님이 {inviteeName}님을 초대했습니다.</p>
    //   <button onClick={handleRegister}>회원가입</button>
    // </div>
  );
}

export default Welcome;
