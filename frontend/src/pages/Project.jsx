import { useState, useEffect } from "react";
import api from "../api";
import ProjectItem from "../components/ProjectItem";
import "../styles/Project.css";
import React from "react";

function Project() {
  const [projects, setProjects] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    getProjects();
  }, []);

  const getProjects = () => {
    api
      .get("/api/projects/")
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

    // 전송할 데이터 로그 확인
    console.log({ content, title, keywords });

    api
      .post("/api/projects/", {
        content,
        title,
        keywords,
      })
      .then((res) => {
        if (res.status === 201) alert("Project created!");
        else alert("Failed to create project.");
        getProjects();
        setContent(""); // 폼 초기화
        setTitle(""); // 폼 초기화
        setKeywords([]); // 폼 초기화
      })
      .catch((error) => {
        console.log(error.response);
        console.log(error.message);
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
