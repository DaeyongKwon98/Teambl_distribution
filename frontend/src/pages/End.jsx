import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/End.css';

function End(){
  const location = useLocation();
  const navigate = useNavigate();
  const name ={...location.state}.user_name;

  function handleProfile(){
    navigate('/')
  }
  function handleLogin(){
    navigate('/login')
  }



  return(
    <div className='end'>
      <div className='end-container'>
        <span className='end-name' style={{color: '#0000b3'}}>{name}</span><span className='end-nim'>님,<br/></span>
        <span  className='end-name'>가입을 축하합니다!</span>
        <label className='end-label1'>이제 팀블과 함께 최적의 팀원을 탐색해 보세요!</label>
        <label className='end-label2'>프로필을 더 자세히 작성할수록 다른 회원들과 더 쉽게 연결될 수 있습니다. 이어서 프로필을 작성해 볼까요?</label>
        <button type='button' className='end-profileBtn' onClick={handleProfile} disabled={true}>프로필 추가로 작성하기</button>
        <button type='button' className='end-loginBtn' onClick={handleLogin}>팀블 시작하기</button>
        
      </div>
    </div>
  );
}

export default End