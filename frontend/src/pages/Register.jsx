import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Register.css";
import MajorPopUp from "./NewSearchPage/MajorPopUp";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = { ...location.state };

  const current_year = new Date().getFullYear();
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState(userInfo.password);
  const [user_name, setUserName] = useState("");
  const [school, setSchool] = useState("카이스트");
  const [current_academic_degree, setCurrentAcademicDegree] = useState("학사");
  const [year, setYear] = useState(current_year);
  const [majors, setMajors] = useState([]);
  // const [verificationCode, setVerificationCode] = useState("");
  // const [generatedCode, setGeneratedCode] = useState("");
  // const [codeSent, setCodeSent] = useState(false);
  // const [isVerified, setIsVerified] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [nextBtnActive, setNextBtnActive] = useState(false);
  const majors = [
    "물리학과",
    "수리과학과",
    "화학과",
    "나노과학기술대학원",
    "양자대학원",
    "생명과학과",
    "뇌인지과학과",
    "의과학대학원",
    "공학생물학대학원",
    "줄기세포및재생생물학대학원",
    "기계공학과",
    "항공우주공학과",
    "전기및전자공학부",
    "전산학부",
    "건설및환경공학과",
    "바이오및뇌공학과",
    "산업디자인학과",
    "산업시스템공학과",
    "생명화학공학과",
    "신소재공학과",
    "원자력및양자공학과",
    "반도체시스템공학과",
    "조천식모빌리티대학원",
    "김재철AI대학원",
    "녹색성장지속가능대학원",
    "반도체공학대학원",
    "인공지능반도체대학원",
    "메타버스대학원",
    "시스템아키텍트대학원",
    "디지털인문사회과학부",
    "문화기술대학원",
    "문술미래전략대학원",
    "과학기술정책대학원",
    "경영공학부",
    "기술경영학부",
    "KAIST경영전문대학원",
    "금융전문대학원",
    "경영자과정",
    "기술경영전문대학원",
    "글로벌디지털혁신대학원",
    "바이오혁신경영전문대학원",
    "융합인재학부",
    "안보과학기술대학원",
    "사이버안보기술대학원",
    "새내기과정학부",
  ];

  // setEmail(userInfo.email);
  // setPassword(userInfo.password);

  function handleBack() {
    navigate("/certify");
  }

  // function handleNext(){
  //   navigate('/end',{state:{username: name}});
  // }

  function handleDegree() {
    var degreeList = document.getElementById("list");
    var value = degreeList.options[degreeList.selectedIndex].text;
    setCurrentAcademicDegree(value);
  }

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
          major1: majors[0] || "",
          major2: majors[1] || "",
        },
        code: inviteCode, // 초대 코드를 서버로 전달
      });
      const newUser = response.data;
      console.log("User registered successfully:", newUser);

      // 회원가입에 성공한 경우, end 화면으로 가기
      navigate("/end", {
        state: {
          user_name: user_name,
        },
      });
    } catch (error) {
      alert("회원가입 실패");
      console.error("Registration error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
    }
  };

  const handleMajorChange = (selectedMajors) => {
    if (selectedMajors.length <= 2) {
      setMajors(selectedMajors);
    } else {
      alert("전공은 최대 2개까지 선택할 수 있습니다.");
    }
  };

  
  // const handleSendCode = async () => {
  //   const code = Math.floor(100000 + Math.random() * 900000).toString();
  //   setGeneratedCode(code);
  //   try {
  //     await api.post("/api/send_code/", { email, code });
  //     setCodeSent(true);
  //     alert(`인증 코드가 이메일로 전송되었습니다.\n 인증코드는: ${code}`);
  //   } catch (error) {
  //     console.error(error);
  //     alert("인증 코드 전송 실패");
  //   }
  // };

  // const handleVerifyCode = () => {
  //   if (verificationCode === generatedCode) {
  //     setIsVerified(true);
  //     alert("이메일 인증 성공");
  //   } else {
  //     alert("인증 코드가 일치하지 않습니다.");
  //   }
  // };

  useEffect(() => {
    if (
      user_name !== "" &&
      school !== "" &&
      current_academic_degree !== "" &&
      year !== "" &&
      majors.length > 0
    )
      setNextBtnActive(true);
    else setNextBtnActive(false);
  }, [user_name, school, current_academic_degree, year, majors]);

  useEffect(() => {
    const invite_code = localStorage.getItem("invite_code");
    console.log("Invite Code from localStorage:", invite_code);
    setInviteCode(invite_code);

    const invited = localStorage.getItem("invited");
    console.log("Invited status in Register component:", invited);
    if (invited !== "true") {
      console.log("Redirecting to /login because invited is not true");
      navigate("/login");
    }
  }, [navigate]);

  const [isMajorPopupOpen, setIsMajorPopupOpen] = useState(false); // major popup이 보이는지 여부

  return (
    <>
      <form className="register" onSubmit={handleRegister}>
        <div className="register-back">
          <button type="button" onClick={handleBack}></button>
        </div>
        <h4>프로필 작성하기</h4>
        <div className="register-container">
          <label className="register-label">
            이름
            <br />
          </label>
          <input
            type="text"
            placeholder=" 이름 입력"
            className="register-input"
            onChange={(e) => setUserName(e.target.value)}
            value={user_name}
            required
          />
          <label className="register-label">
            학교
            <br />
          </label>
          <input
            type="text"
            placeholder=" 학교 입력"
            className="register-input"
            onChange={(e) => setSchool(e.target.value)}
            value={school}
            required
          />
          <label className="register-label">
            학력
            <br />
          </label>
          <select onChange={handleDegree} id="list">
            <option>학사</option>
            <option>석사</option>
            <option>박사</option>
          </select>
          <label className="register-label">
            입학년도
            <br />
          </label>
          <input
            type="number"
            placeholder=" 입학년도 입력(4자리)"
            className="register-input"
            onChange={(e) => setYear(e.target.value)}
            value={year}
            required
            min="1900"
            max={new Date().getFullYear()} // 현재 연도까지 입력 가능
          />
          <label className="register-label">
            전공
            <br />
          </label>
          <input
            type="text"
            placeholder=" 전공을 선택해주세요."
            value={majors.join(", ")}
            readOnly
            className="register-input"
            onClick={() => {
              setIsMajorPopupOpen(true);
            }}
            required
          />
          <button
            type="submit"
            className="register-nextBtn"
            disabled={!nextBtnActive}
          >
            완료
          </button>
        </div>
      </form>
      <div>
        {isMajorPopupOpen && (
          <>
            <div
              className="newSearch-overlay"
              onClick={() => setIsMajorPopupOpen(false)}
            ></div>
            <MajorPopUp
              userSelectedMajors={majors}
              handleMajorChange={handleMajorChange}
              setIsMajorPopupOpen={setIsMajorPopupOpen}
              doSearchUsers={() => {}}
              buttonText="확인"
            />
          </>
        )}
      </div>
    </>
  );
}

export default Register;
