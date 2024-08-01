import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Register() {
  const current_year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user_name, setUserName] = useState("");
  const [school, setSchool] = useState("");
  const [current_academic_degree, setCurrentAcademicDegree] = useState("");
  const [year, setYear] = useState(current_year);
  const [major, setMajor] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const invited = localStorage.getItem('invited');
    console.log("Invited status in Register component:", invited);
    if (invited !== 'true') {
      console.log("Redirecting to /login because invited is not true");
      navigate('/login'); // 초대받지 않은 경우 로그인 페이지로 리다이렉트
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/user/register/", {
        email,
        password,
        profile: {
          user_name,
          school,
          current_academic_degree,
          year,
          major,
        },
      });
      // 회원가입에 성공한 경우, 로그인 화면으로 가기
      console.log(response.data);
      localStorage.removeItem('invited'); // 초대받은 경우에만 초대 상태 초기화
      navigate("/login");
    } catch (error) {
      alert("회원가입 실패");
      console.error(error);
    }
  };

  const handleSendCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    try {
      await api.post("/api/send_code/", { email, code });
      setCodeSent(true);
      alert(`인증 코드가 이메일로 전송되었습니다.\n 인증코드는: ${code}`);
    } catch (error) {
      console.error(error);
      alert("인증 코드 전송 실패");
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode === generatedCode) {
      setIsVerified(true);
      alert("이메일 인증 성공");
    } else {
      alert("인증 코드가 일치하지 않습니다.");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="button" onClick={handleSendCode}>
        인증 코드 전송
      </button>
      {codeSent && (
        <>
          <input
            type="text"
            placeholder="인증 코드"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <button type="button" onClick={handleVerifyCode}>
            인증 코드 확인
          </button>
        </>
      )}
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="이름"
        value={user_name}
        onChange={(e) => setUserName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="대학교"
        value={school}
        onChange={(e) => setSchool(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="현재 학력"
        value={current_academic_degree}
        onChange={(e) => setCurrentAcademicDegree(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="전공"
        value={major}
        onChange={(e) => setMajor(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="입학 연도"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        required
        min="1900"
        max={new Date().getFullYear()} // 현재 연도까지 입력 가능
      />
      <button type="submit" disabled={!isVerified}>
        회원가입
      </button>
    </form>
  );
}

export default Register;
