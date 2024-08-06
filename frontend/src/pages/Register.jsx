import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate , useLocation} from "react-router-dom";
import '../styles/Register.css'

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = {...location.state};

  const current_year = new Date().getFullYear();
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState(userInfo.password);
  const [user_name, setUserName] = useState("");
  const [school, setSchool] = useState("카이스트");
  const [current_academic_degree, setCurrentAcademicDegree] = useState("학사");
  const [year, setYear] = useState(current_year);
  const [major, setMajor] = useState("");
  // const [verificationCode, setVerificationCode] = useState("");
  // const [generatedCode, setGeneratedCode] = useState("");
  // const [codeSent, setCodeSent] = useState(false);
  // const [isVerified, setIsVerified] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [nextBtnActive, setNextBtnActive] = useState(false);


  // setEmail(userInfo.email);
  // setPassword(userInfo.password);

  function handleBack(){
    navigate('/certify');
  }

  // function handleNext(){
  //   navigate('/end',{state:{username: name}});
  // }

  function handleDegree(){
    var degreeList = document.getElementById('list');
    var value = (degreeList.options[degreeList.selectedIndex].text);
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
          major,
        },
        code: inviteCode,  // 초대 코드를 서버로 전달
      });
      const newUser = response.data;
      console.log("User registered successfully:", newUser);

      // 회원가입에 성공한 경우, 로그인 화면으로 가기
      localStorage.removeItem('invited'); // 초대받은 경우에만 초대 상태 초기화
      localStorage.removeItem('invite_code'); // 초대 코드를 삭제
      navigate("/login");
    } catch (error) {
      alert("회원가입 실패");
      console.error("Registration error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
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

  
  useEffect(()=>{
    if((user_name!=='') && (school!=='') && (current_academic_degree!=='') && (year!=='') && (major!=='')) setNextBtnActive(true);
    else setNextBtnActive(false);
  },[user_name,school,current_academic_degree,year,major])

  useEffect(() => {
    const invite_code = localStorage.getItem('invite_code');
    console.log("Invite Code from localStorage:", invite_code);
    setInviteCode(invite_code);

    const invited = localStorage.getItem('invited');
    console.log("Invited status in Register component:", invited);
    if (invited !== 'true') {
      console.log("Redirecting to /login because invited is not true");
      navigate('/login');
    }
  }, [navigate]);

  return (
    <form className='register' onSubmit={handleRegister}>  
      <div className='register-back'>
        <button type="button" onClick={handleBack}></button>
      </div>
      <h4>프로필 작성하기</h4>
      <div className="register-container">
        <label className='register-label'>이름<br/></label>
        <input 
          type='text' 
          placeholder=' 이름 입력' 
          className='register-input'
          onChange={(e)=>(setUserName(e.target.value))} 
          value={user_name}
          required
        />
        <label className='register-label'>학교<br/></label>
        <input 
          type='text' 
          placeholder=' 학교 입력' 
          className='register-input' 
          onChange={(e)=>(setSchool(e.target.value))} 
          value={school}
          required
        />
        <label className='register-label'>학력<br/></label>
        <select onChange={handleDegree} id='list'>
          <option>학사</option>
          <option>석사</option>
          <option>박사</option>
        </select >
        <label className='register-label'>입학년도<br/></label>
        <input 
          type='number' 
          placeholder=' 입학년도 입력(4자리)' 
          className='register-input' 
          onChange={(e)=>(setYear(e.target.value))} 
          value={year}
          required
          min='1900'
          max={new Date().getFullYear()} // 현재 연도까지 입력 가능
        />
        <label className='register-label'>전공<br/></label>
        <input 
          type='search' 
          placeholder='전공 입력' 
          className='register-input' 
          onChange={(e)=>(setMajor(e.target.value))} 
          value={major}
          required
        />
        <button 
          type='submit' 
          className='register-nextBtn'
          disabled={!nextBtnActive}
        >완료</button>
      </div>
    </form>

    // <form onSubmit={handleRegister}>
    //   <input
    //     type="email"
    //     placeholder="이메일"
    //     value={email}
    //     onChange={(e) => setEmail(e.target.value)}
    //     required
    //   />
    //   <button type="button" onClick={handleSendCode}>
    //     인증 코드 전송
    //   </button>
    //   {codeSent && (
    //     <>
    //       <input
    //         type="text"
    //         placeholder="인증 코드"
    //         value={verificationCode}
    //         onChange={(e) => setVerificationCode(e.target.value)}
    //         required
    //       />
    //       <button type="button" onClick={handleVerifyCode}>
    //         인증 코드 확인
    //       </button>
    //     </>
    //   )}
    //   <input
    //     type="password"
    //     placeholder="비밀번호"
    //     value={password}
    //     onChange={(e) => setPassword(e.target.value)}
    //     required
    //   />
    //   <input
    //     type="text"
    //     placeholder="이름"
    //     value={user_name}
    //     onChange={(e) => setUserName(e.target.value)}
    //     required
    //   />
    //   <input
    //     type="text"
    //     placeholder="대학교"
    //     value={school}
    //     onChange={(e) => setSchool(e.target.value)}
    //     required
    //   />
    //   <input
    //     type="text"
    //     placeholder="현재 학력"
    //     value={current_academic_degree}
    //     onChange={(e) => setCurrentAcademicDegree(e.target.value)}
    //     required
    //   />
    //   <input
    //     type="text"
    //     placeholder="전공"
    //     value={major}
    //     onChange={(e) => setMajor(e.target.value)}
    //     required
    //   />
    //   <input
    //     type="number"
    //     placeholder="입학 연도"
    //     value={year}
    //     onChange={(e) => setYear(e.target.value)}
    //     required
    //     min="1900"
    //     max={new Date().getFullYear()} // 현재 연도까지 입력 가능
    //   />
    //   <button type="submit" disabled={!isVerified}>
    //     회원가입
    //   </button>
    // </form>
  );
}

export default Register;
