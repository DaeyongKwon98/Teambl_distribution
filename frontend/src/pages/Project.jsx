import { useState, useEffect } from "react";
import api from "../api";
import ProjectItem from "../components/ProjectItem";
import "../styles/Project.css";
import React from "react";

function Project() {
  const [currentUser, setCurrentUser] = useState(null);  // 로그인한 사용자 정보
  const [projects, setProjects] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    getCurrentUser();
    getProjects();
  }, []);

  // 현재 로그인한 사용자 정보 가져오기
  const getCurrentUser = () => {
    api
      .get("/api/current-user/")  // 'current-user' 엔드포인트 호출
      .then((res) => setCurrentUser(res.data))  // 사용자 정보 상태에 저장
      .catch((err) => alert("Failed to fetch current user info."));
  };

  const getProjects = () => {
    api
      // .get("/api/projects/")
      .get("/api/projects/every/")
      .then((res) => res.data)
      .then((data) => {
        setProjects(data.results);
        console.log(data);
      })
      .catch((err) => alert(err));
  };

  const deleteProject = (id) => {
    api
      .delete(`/api/projects/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) alert("Project deleted!");
        else alert("Failed to delete project.");
        getProjects();
      })
      .catch((error) => alert(error));
  };

  const createProject = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("content", content);
    formData.append("title", title);
  
    // 키워드를 배열로 전송할 때는 반복문을 통해 추가해야 함
    keywords.forEach((keyword) => {
      formData.append("keywords[]", keyword); // 'keywords[]'로 배열 형태로 전송
    });
  
    if (image) {
      formData.append("image", image); // 이미지가 있을 경우 추가
    }
  
    api
      .post("/api/projects/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 201) alert("Project created!");
        else alert("Failed to create project.");
        getProjects();
        setContent("");
        setTitle("");
        setKeywords([]);
        setImage(null); // 이미지 상태 초기화
      })
      .catch((error) => {
        console.log(error.response);
        if (error.response) {
          alert(`Failed to create project: ${error.response.data}`);
        } else {
          alert(`Failed to create project: ${error.message}`);
        }
      });
  };

  const addKeyword = () => {
    if (
      keywords.length < 3 &&
      keywordInput.trim() &&
      !keywords.includes(keywordInput)
    ) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    } else if (keywords.length >= 3) {
      alert("You can only add up to 3 keywords.");
    } else if (keywords.includes(keywordInput)) {
      alert("이미 등록한 키워드입니다.");
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="projects-section">
        <h2>Projects</h2>
        {projects.map((project) => (
          <ProjectItem
            project={project}
            onDelete={deleteProject}
            key={project.project_id}
            currentUser={currentUser}
          />
        ))}
      </div>
      <h2>Create a Project</h2>
      <form onSubmit={createProject}>
        <label htmlFor="title">Title:</label>
        <br />
        <input
          type="text"
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="content">Content:</label>
        <br />
        <textarea
          id="content"
          name="content"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <label htmlFor="image">Image:</label>
        <br />
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])} // Update state with selected image
        />
        <br />
        <label htmlFor="keywords">Keywords (add up to 3):</label>
        <br />
        <input
          type="text"
          id="keywordInput"
          name="keywordInput"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
        />
        <button type="button" onClick={addKeyword}>
          Add Keyword
        </button>
        <ul>
          {keywords.map((keyword, index) => (
            <li key={index}>
              {keyword}{" "}
              <button type="button" onClick={() => removeKeyword(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <br />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default Project;
