import '../styles/Certify.css'
import React,{useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api";

function Certify(){
  const labelRef1 = useRef(null);
  const labelRef2 = useRef(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  let [emailBtnActive, setEmailBtnActive] = useState(false);
  let [nextBtnActive, setNextBtnActive] = useState(false);
  // let [code , setCode] = useState('');
  let [pwCheck, setPwCheck] = useState('');
  // let [valid1, setValid1] = useState(false);
  // let [valid2, setValid2] = useState(false);

  useEffect(()=>{
    if(email!=='') setEmailBtnActive((EBA)=>EBA=true);
    else setEmailBtnActive((EBA)=>EBA=false);
  },[email])

  // useEffect(()=>{
  //   if(code===codekey){
  //     labelRef1.current.innerHTML='인증코드가 일치합니다.';
  //     labelRef1.current.style.fontSize='10px';
  //     labelRef1.current.style.color='green'
  //     setValid1(true);
  //   }
  //   else if(code!==codekey && code!==''){
  //     labelRef1.current.innerHTML='인증코드가 일치하지 않습니다.';
  //     labelRef1.current.style.fontSize='10px';
  //     labelRef1.current.style.color='red'
  //     setValid1(false);
  //   }
  //   else{
  //     labelRef1.current.innerHTML='';
  //     setValid1(false);
  //   }

  // },[code])

  
  useEffect(()=>{
    if(password===pwCheck && password!==''){
      labelRef2.current.innerHTML='인증코드가 일치합니다.';
      labelRef2.current.style.fontSize='10px';
      labelRef2.current.style.color='green'
      setIsChecked(true);
    }
    else if(password!==pwCheck && pwCheck!==''){
      labelRef2.current.innerHTML='비밀번호가 일치하지 않습니다.';
      labelRef2.current.style.fontSize='10px';
      labelRef2.current.style.color='red'
      setIsChecked(false);
    }
    else{
      labelRef2.current.innerHTML='';
      setIsChecked(false);
    }

  },[pwCheck])

  useEffect(()=>{
    if(isVerified&&isChecked) setNextBtnActive(true);
    else setNextBtnActive(false);
  },[isVerified,isChecked])



  function handleNext(){
    navigate('/register',{
      state: {
        email : email,
        password : password
      }
    });
  }
  // function handleBack(){
  //   navigate('/welcome');
  // }
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
      labelRef1.current.innerHTML='인증코드가 일치합니다.';
      labelRef1.current.style.fontSize='10px';
      labelRef1.current.style.color='green';
      setIsVerified(true);
      alert("이메일 인증 성공");
    }else if (verificationCode!==generatedCode && verificationCode!=='') {
      labelRef1.current.innerHTML='인증코드가 일치하지 않습니다.';
      labelRef1.current.style.fontSize='10px';
      labelRef1.current.style.color='red';
      setIsVerified(false);
    }
    else {
      labelRef1.current.innerHTML='';
      setIsVerified(false);
      alert("인증 코드가 일치하지 않습니다.");
    }
  };

  return(
    <div className='certify'>
      <div className='certify-back'>
        <button type="button" disabled={true}></button>
      </div>
      <h4>회원가입</h4>
      <label className='certify-label'>학교 이메일<br/></label>
      <div className='certify-email'>
        <input 
          type='text' 
          id='email' 
          placeholder=' 이메일 입력' 
          onChange={(e)=>setEmail(e.target.value)} 
          value={email}
          disabled={isVerified} // 이메일 인증 성공 시 필드를 비활성화
        />
        <button 
          type="button" 
          className='certify-emailBtn'
          disabled={!emailBtnActive || isVerified} // 이메일 인증 성공 시 버튼 비활성화
          onClick={handleSendCode}
        >인증코드 받기</button>
      </div>
      {codeSent && (
        <div className='certify-email'>
          <input 
            type='password' 
            className='certify-email' 
            placeholder=' 인증코드 입력' 
            onChange={(e)=>setVerificationCode(e.target.value)} 
            value={verificationCode}
            disabled={isVerified} // 이메일 인증 성공 시 인증코드 입력 필드를 비활성화
            required
          />
          <button 
            type="button" 
            className='certify-emailBtn'
            onClick={handleVerifyCode}
            disabled={isVerified} // 이메일 인증 성공 시 인증코드 확인 버튼을 비활성화
          >인증코드 확인</button>
        </div>
      )}
      <label ref={labelRef1}></label>
      <label className='certify-label' >비밀번호<br/></label>
      <input 
        type='password'
        className='certify-password'
        placeholder=' 비밀번호 입력'  
        onChange={(e)=>(setPassword(e.target.value))} 
        value={password}
      />
      <input 
        type='password' 
        className='certify-password' 
        placeholder=' 비밀번호 확인' 
        onChange={(e)=>(setPwCheck(e.target.value))} 
        value={pwCheck}
      />
      <label ref={labelRef2} ></label>
      <button 
        type='button' 
        className='certify-nextBtn' 
        disabled={!nextBtnActive} 
        onClick={handleNext}
      >다음</button>
    </div>
  );
}

export default Certify;
