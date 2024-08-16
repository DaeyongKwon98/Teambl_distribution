import React,{useState, useEffect, useRef} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import '../styles/Profile.css'
import '../styles/ExperienceList.css';
import '../styles/IntroductionForm.css';
import '../styles/Tool.css';
import '../styles/Portfolio.css';
import api from '../api';

function Profile(){
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = {...location.state};

  const [user_name, setUserName] = useState('');
  const [school, setSchool] = useState('');
  const [current_academic_degree, setCurrentAcademicDegree] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [one_degree_count, setOneDegreeCount] = useState('');

  const [image, setImage] = useState('src/assets/student.png');
  const [tags, setTags] = useState(['Java', 'Python']);
  const [newTag, setNewTag] = useState('');
  const [tagFull, setTagFull] = useState(false)
  
  const [experiences, setExperiences] = useState([]);  
  const [newExperience, setNewExperience] = useState('');
  
  const [tools, setTools] = useState([]);
  const [newTool, setNewTool] = useState('');

  const [introduction, setIntroduction] = useState('');
  const [savedIntroduction, setSavedIntroduction] = useState('');

  const [portfolios, setPortfolios] = useState([]);
  const [newPortfolio, setNewPortfolio] = useState('');

  const [tagVisible, setTagVisible] = useState(false);
  const [experienceVisible, setExperienceVisible] = useState(false);
  const [toolVisible, setToolVisible] = useState(false);
  const [introductionVisible, setIntroductionVisible] = useState(false);
  const [portfVisible, setPortfVisible] = useState(false);

  const [prevPage, setPrevPage] = useState(userInfo.prevPage);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(()=>{
    if (tags.length>=5) setTagFull(true);
  },[tags])

  const { getRootProps, getInputProps } = useDropzone({ onDrop, noClick: true });

  const handleImageClick = () => {
    document.getElementById('fileInput').click();
  };

  useEffect(()=>{
    fetchProfile();
  },[])

  const fetchProfile = async () =>{
    try {
      const response = await api.get('/api/current-user/');
      // console.log(response.data.profile)
      if(prevPage==='editprofile'){
        setUserName(userInfo.user_name);
        setSchool(userInfo.school);
        setCurrentAcademicDegree(userInfo.current_academic_degree);
        setYear(userInfo.year);
        setMajor(userInfo.major);
      }
      else{
        setUserName(response.data.profile.user_name);
        setSchool(response.data.profile.school);
        setCurrentAcademicDegree(response.data.profile.current_academic_degree);
        setYear(response.data.profile.year);
        setMajor(response.data.profile.major);
      }
      setOneDegreeCount(response.data.profile.one_degree_count);

      if( response.data.profile.keywords.length!=0)
        setTags([...tags, response.data.profile.keywords]);
      if( response.data.profile.experiences.length!=0)
        setExperiences(response.data.profile.experiences);
      if( response.data.profile.tools.length!=0)
        setTools(response.data.profile.tools);
      if( response.data.profile.introduction)
        setSavedIntroduction(response.data.profile.introduction);
      if( response.data.profile.portfolio_links.length!=0)
        setPortfolios(response.data.profile.portfolio_links);
    }catch(error){
      console.error("Failed to fetch current user profile:", error);
    }
  };

  const handleAddTag = () => {
    if (newTag) {
      setTags([...tags, newTag]);
      setNewTag('');
      setTagVisible(false);
    }
  };

  const handleCancel = () => {
    setNewTag('');
    setTagVisible(false);
  };
  
  const handleTagDelete = (index) =>{
    const newtags = tags.filter((_, i)=>i!==index)
    setTags(newtags);
  };

  function handleEdit(){
    navigate('/editprofile', {
      state: {
        user_name : user_name,
        school : school,
        current_academic_degree : current_academic_degree,
        year : year,
        major : major
      }
    });
  }
  const handleAddExperience = () => {
    if (newExperience) {
      setExperiences([...experiences, {experience : newExperience}]);
      setNewExperience('');
      setExperienceVisible(false);
      // console.log(experiences)
    }
  };

  const handleExperienceCancel = () => {
    setNewExperience('');
    setExperienceVisible(false);
  };

  const handleExperienceDelete = (index) =>{
    const newExps = experiences.filter((_,i)=>i!==index)
    setExperiences(newExps);
  };

  const handleAddTool = () => {
    if (newTool) {
      setTools([...tools, {tool:newTool}]);
      setNewTool('');
      setToolVisible(false);
    }
  };

  const handleToolCancel = () => {
    setNewTool('');
    setToolVisible(false);
  };
  
  const handleToolDelete = (index) =>{
    const newtools = tools.filter((_,i)=>i!==index)
    setTools(newtools);
  };
  
  const handleIntroductionSave = () => {
    setSavedIntroduction(introduction);
    setIntroductionVisible(false);
  };  

  const handleAddPortfolio = () => {
    if (newPortfolio) {
      setPortfolios([...portfolios, {portfolioLink:newPortfolio}]);
      setNewPortfolio('');
      setPortfVisible(false);
    }
  };
  
  const handlePortfolioCancel = () => {
    setNewPortfolio('');
    setPortfVisible(false);
  };

  const handlePortfolioDelete = (index) =>{
    const newportfs = portfolios.filter((_,i)=>i!==index)
    setPortfolios(newportfs);
  };


  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/api/profile/update/", {
            
        user_name, 
        school,
        current_academic_degree,
        year,
        major,
        introduction:savedIntroduction,
        experiences,
        tools,
        portfolio_links:portfolios
        
      });
      const newUser = response.data;
      console.log("User registered successfully:", newUser);
      navigate('/profile');
      
    } catch (error) {
      alert("회원가입 실패");
      console.error("Registration error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
    }
  };

  return(
    <form onSubmit={handleSave} className='profile'>
      <div className='profile-back'>
        <button type="button" disabled={true}></button>
      </div>
      <h4>내 프로필</h4>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-imageContainer" {...getRootProps()}>
            <img src={image} alt="Profile" onClick={handleImageClick} />
            <input {...getInputProps()} id="fileInput" type="file" style={{ display: 'none' }} />
          </div>
          <div className="profile-info">
            <div className='profile-name'>
              <h2>{user_name}</h2>
              <button className='profile-editBtn' onClick={handleEdit}></button>
            </div>
            <div className='profile-line'></div>
            <p>{`${school} · ${year} · ${current_academic_degree}`}</p>
            <p>{major}</p>
            <div className='profile-friend'>
              <img src='src/assets/friend.png' alt="friend-icon" />
              <span className='profile-oneDegree'>{`1촌 ${one_degree_count}명`}</span>
            </div>
          </div>
        </div>
        <div className="profile-tags">
          <div className='profile-feature'>
            키워드
            <label className='profile-definition'>키워드는 5개까지 입력 가능합니다.</label>
          </div>
          {tags.map((tag, index) => (
            <span key={index} className="profile-tag">
              {tag}
              <button type='button' onClick={()=>(handleTagDelete(index))}>X</button>
            </span>
          ))}
          {tagVisible && (
            <div className="profile-tagInput">
              <input
                type="text"
                placeholder="태그"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <button onClick={handleAddTag}>추가</button>
              <button onClick={handleCancel}>삭제</button>
            </div>
          )}
          {!tagFull && !tagVisible && (
            <span className="profile-addTag" onClick={() => setTagVisible(true)}>
              + 추가
            </span>
          )}
        </div>
      </div> 
      
      <div className="ex">
        <div className='ex-feature'>
          경험
          <label className='ex-definition'>본인의 경험을 추가해보세요.</label>
        </div>
        <div className="ex-lists">
          {experiences.map((exp , index) => (
            <div key={index} className="ex-item">
              <span className="ex-description">{exp.experience}</span>
              {/* <span className="ex-period">{exp.period}</span> */}
              <button onClick={()=>(handleExperienceDelete(index))}>X</button>
            </div>
          ))}
          {experienceVisible ? (
            <div className="ex-input">
              <input
                type="text"
                placeholder="경험"
                value={newExperience.description}
                onChange={(e) => setNewExperience(e.target.value)}
              />
              {/* <input
                type="text"
                placeholder="기간"
                value={newExperience.period}
                onChange={(e) => setNewExperience({ ...newExperience, period: e.target.value })}
              /> */}
              <div className="ex-btnGroup">
                <button type='button' className="ex-addBtn" onClick={handleAddExperience}>추가</button>
                <button type='button' className="ex-cancelBtn" onClick={handleExperienceCancel}>삭제</button>
              </div>
            </div>
          ) : (
            <div className="ex-addExperience" onClick={() => setExperienceVisible(true)}>
              + 추가하기
            </div>
          )}
        </div>
      </div>

      <div className="tool">
        <div className='tool-feature'>
          툴
          <label className='tool-definition'>본인이 다룰 수 있는 툴을 추가해보세요.</label>
        </div>
        <div className="tool-lists">
          {tools.map((t, index) => (
            <div key={index} className="tool-item">
              <span className="tool-description">{t.tool}</span>
              {/* <span className="tool-period">{exp.period}</span> */}
              <button onClick={()=>(handleToolDelete(index))}>X</button>
            </div>
          ))}
          {toolVisible ? (
            <div className="tool-input">
              <input
                type="text"
                placeholder="경험"
                value={newTool.description}
                onChange={(e) => setNewTool(e.target.value)}
              />
              {/* <input
                type="text"
                placeholder="기간"
                value={newTool.period}
                onChange={(e) => setNewTool({ ...newTool, period: e.target.value })}
              /> */}
              <div className="tool-btnGroup">
                <button type='button' className="tool-addBtn" onClick={handleAddTool}>추가</button>
                <button type='button' className="tool-cancelBtn" onClick={handleToolCancel}>삭제</button>
              </div>
            </div>
          ) : (
            <div className="tool-addTool" onClick={() => setToolVisible(true)}>
              + 추가하기
            </div>
          )}
        </div>
      </div>
      
      <div className="introduction-form">
        <div className='intro-feature'>
          소개
        </div>
        {introductionVisible ? (
          <div className="textwithbutton">
            <textarea
              placeholder=""
              value={introduction}
              onChange={(e)=>setIntroduction(e.target.value)}
            />
            <button onClick={handleIntroductionSave}>저장하기</button>
          </div>
        ) : (
          <div className="saved-introduction" onClick={() => setIntroductionVisible(true)}>
            {savedIntroduction || (
              <p className="placeholder">
                관심 있는 분야, 이루고자 하는 목표, 전문성을 알기 위해 하고 있는 활동 등 본인을 설명하는 글을 자유롭게 작성해 보세요.
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="portf">
        <div className='portf-feature'>
          포트폴리오
          <label className='portf-definition'>포트폴리오 링크를 추가해보세요.</label>
        </div>
        <div className="portf-lists">
          {portfolios.map((p,index) => (
            <div key={index} className="portf-item" >
              <span className="portf-description"><a href={p.portfolioLink} target='_blank'>{p.portfolioLink}</a></span>
              {/* <span className="portf-period">{exp.period}</span> */}
              <button onClick={()=>(handlePortfolioDelete(index))}>X</button>
            </div>
          ))}
          {portfVisible ? (
            <div className="portf-input">
              <input
                type="text"
                placeholder="경험"
                value={newPortfolio.description}
                onChange={(e) => setNewPortfolio(e.target.value)}
              />
              {/* <input
                type="text"
                placeholder="기간"
                value={newPortfolio.period}
                onChange={(e) => setNewPortfolio({ ...newPortfolio, period: e.target.value })}
              /> */}
              <div className="portf-btnGroup">
                <button type='button' className="portf-addBtn" onClick={handleAddPortfolio}>추가</button>
                <button type='button' className="portf-cancelBtn" onClick={handlePortfolioCancel}>삭제</button>
              </div>
            </div>
          ) : (
            <div className="portf-addPortfolio" onClick={() => setPortfVisible(true)}>
              + 추가하기
            </div>
          )}
        </div>
      </div>

      <button 
        type='submit' 
        className='profile-submitBtn' 
      >저장</button>
    </form>
  );
}

export default Profile
