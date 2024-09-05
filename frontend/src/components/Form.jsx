import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import LoginTeamblIcon from "../assets/loginteamblIcon.svg";
import redNotiIcon from "../assets/red_noti_icon.svg";

function Form({ route, method }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false); // 버튼 활성화 상태
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

  useEffect(() => {
    // 이메일과 비밀번호가 모두 입력되었을 때만 버튼 활성화
    setIsButtonEnabled(email.trim() !== "" && password.trim() !== "");
  }, [email, password]);
  
  const handleSubmit = async (e) => {
    // submit됐을때 처리
    e.preventDefault();

    // Check if both email and password are provided
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력하세요.");
      return;
    }

    setLoading(true);
    
    try {
      const res = await api.post(route, { email, password }); // request가 오류 없으면
      if (method === "login") {
        // access, refresh token 얻어서 저장하기
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        localStorage.setItem("userId", res.data.userId);
        console.log("Stored userId:", localStorage.getItem("userId"));
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (e) {
      // console.log(e.response);
      if (e.response) {  // Errors that come from the API response
          setError("이메일 또는 비밀번호가 일치하지 않습니다.");
      } else {  // Errors not related to the API response (network errors, etc.)
        setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
    <img
      src={LoginTeamblIcon}
      alt="팀블로고"
      className="login-teambl-icon"
    />
    <p className="login-subheader">팀원 찾기의 새로운 기준, 팀블!</p>
      <div className="login-form">
        <input
          type="text"
          placeholder="학교 이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={redNotiIcon} alt="Error icon" style={{ marginRight: '8px' }} />
          <p className="error">{error}</p>
        </div>
        {/* {loading && <LoadingIndicator />} */}
        <button
          className="login-button"
          onClick={handleSubmit}
          disabled={!isButtonEnabled}
        >
          로그인
        </button>
        <div className="links">
          <span onClick={() => navigate('/password-reset')}>비밀번호 재설정</span>
        </div>
      </div>
    </div>
  );
}

export default Form;
