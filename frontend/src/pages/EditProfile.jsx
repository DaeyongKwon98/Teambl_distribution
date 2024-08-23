import React, { useState, useEffect } from "react";
import { useNavigate , useLocation } from "react-router-dom";
import '../styles/EditProfile.css'

function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = {...location.state};

  // const [savedUser_name, setSavedUserName] = useState(userInfo.user_name);
  // const [savedSchool, setSavedSchool] = useState(userInfo.school);
  // const [savedCurrent_academic_degree, setSavedCurrentAcademicDegree] = useState(userInfo.current_academic_degree);
  // const [savedYear, setSavedYear] = useState(userInfo.year);
  // const [savedMajor, setSavedMajor] = useState(userInfo.major);

  // const [user_name, setUserName] = useState(savedUser_name);
  // const [school, setSchool] = useState(savedSchool);
  // const [current_academic_degree, setCurrentAcademicDegree] = useState(savedCurrent_academic_degree);
  // const [year, setYear] = useState(savedYear);
  // const [major, setMajor] = useState(savedMajor);

  // location.state에서 userId 및 초기 프로필 데이터를 가져옴
  const { userId, user_name: initialUserName, school: initialSchool, current_academic_degree: initialDegree, year: initialYear, major: initialMajor } = location.state || {};

  // 가져온 값을 상태로 관리
  const [user_name, setUserName] = useState(initialUserName || '');
  const [school, setSchool] = useState(initialSchool || '');
  const [current_academic_degree, setCurrentAcademicDegree] = useState(initialDegree || '');
  const [year, setYear] = useState(initialYear || '');
  const [major, setMajor] = useState(initialMajor || '');

  // function handleBack(){
  //   navigate(`/profile/${userInfo.id}`, {
  //     state: {
  //       user_name : savedUser_name,
  //       school : savedSchool,
  //       current_academic_degree : savedCurrent_academic_degree,
  //       year : savedYear,
  //       major : savedMajor,
  //       prevPage : 'editprofile'
  //     }
  //   });
  // }

  function handleBack(){
    navigate(`/profile/${userId}`, {
      state: {
        user_name: initialUserName,
        school: initialSchool,
        current_academic_degree: initialDegree,
        year: initialYear,
        major: initialMajor,
        prevPage: 'editprofile'
      }
    });
  }

  function handleDegree(){
    var degreeList = document.getElementById('list');
    var value = (degreeList.options[degreeList.selectedIndex].text);
    setCurrentAcademicDegree(value);
  }

  function handleSave(){
    // setSavedUserName(user_name);
    // setSavedSchool(school);
    // setSavedCurrentAcademicDegree(current_academic_degree);
    // setSavedYear(year);
    // setSavedMajor(major);
    
    // 수정된 정보를 저장하고 프로필 페이지로 돌아갑니다.
    navigate(`/profile/${userId}`, {
      state: {
        user_name: user_name,
        school: school,
        current_academic_degree: current_academic_degree,
        year: year,
        major: major,
        prevPage: 'editprofile'
      }
    });
  }

  return (
    <form className='edit' >  
      <div className='edit-back'>
        <button type="button" onClick={handleBack}></button>
      </div>
      <h4>프로필 작성하기</h4>
      <div className="edit-container">
        <label className='edit-label'>이름<br/></label>
        <input 
          type='text' 
          placeholder=' 이름 입력' 
          className='edit-input'
          onChange={(e)=>(setUserName(e.target.value))} 
          value={user_name}
          required
        />
        <label className='edit-label'>학교<br/></label>
        <input 
          type='text' 
          placeholder=' 학교 입력' 
          className='edit-input' 
          onChange={(e)=>(setSchool(e.target.value))} 
          value={school}
          required
        />
        <label className='edit-label'>학력<br/></label>
        <select onChange={handleDegree} id='list' defaultValue={current_academic_degree}>
          <option value='학사'>학사</option>
          <option value='석사'>석사</option>
          <option value='박사'>박사</option>
        </select >
        <label className='edit-label'>입학년도<br/></label>
        <input 
          type='number' 
          placeholder=' 입학년도 입력(4자리)' 
          className='edit-input' 
          onChange={(e)=>(setYear(e.target.value))} 
          value={year}
          required
          min='1900'
          max={new Date().getFullYear()} // 현재 연도까지 입력 가능
        />
        <label className='edit-label'>전공<br/></label>
        <input 
          type='search' 
          placeholder='전공 입력' 
          className='edit-input' 
          onChange={(e)=>(setMajor(e.target.value))} 
          value={major}
          required
        />
        <button 
          type='button' 
          className='edit-nextBtn'
          onClick={handleSave}
        >저장</button>
      </div>
    </form>
  );
}

export default EditProfile;
