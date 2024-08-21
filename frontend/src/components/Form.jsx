import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    // submit됐을때 처리
    setLoading(true);
    e.preventDefault();
    
    try {
      const res = await api.post(route, { email, password }); // request가 오류 없으면
      if (method === "login") {
        // access, refresh token 얻어서 저장하기
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>TEAMBL</h1>
      <div className="login-form">
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="checkbox-container">
          <input type="checkbox" id="keep-login" />
          <label htmlFor="keep-login">로그인 상태 유지</label>
        </div>
        {error && <p className="error">{error}</p>}
        {/* {loading && <LoadingIndicator />} */}
        <button className="login-button" onClick={handleSubmit}>로그인</button>
        <div className="links">
          <span onClick={() => navigate('/password-reset')}>비밀번호 찾기</span>
          <span onClick={() => navigate('/start')}>회원가입</span>
        </div>
      </div>
    </div>
  );
}

export default Form;
