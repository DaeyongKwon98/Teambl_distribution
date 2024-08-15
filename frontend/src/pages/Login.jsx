// import Form from "../components/Form"

// function Login() {
//     return <Form route="/api/token/" method="login" />
// }

// export default Login

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const LoginPage = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!id || !password) {
      setError('아이디와 비밀번호를 입력하세요.');
    } else {
      // 로그인 로직 처리
      console.log('로그인 성공');
      navigate('/myprofile')
    }
  };

  return (
    <div className="login-container">
      <h1>TEAMBL</h1>
      <div className="login-form">
        <input
          type="text"
          placeholder="이메일"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="checkbox-container">
          <input type="checkbox" id="keep-login" />
          <label htmlFor="keep-login">로그인 상태 유지</label>
        </div>
        {error && <p className="error">{error}</p>}
        <button className="login-button" onClick={handleLogin}>로그인</button>
        <div className="links">
          <span onClick={() => navigate('/password-reset')}>비밀번호 찾기</span>
          <span onClick={() => navigate('/start')}>회원가입</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
