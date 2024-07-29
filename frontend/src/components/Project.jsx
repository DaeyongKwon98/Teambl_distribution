import React from "react";
import "../styles/Project.css";

function Project({ project, onDelete }) {
  const formattedDate = new Date(project.created_at).toLocaleDateString(
    "en-US"
  );

  const keywordsString = project.keywords.join(", "); // 문자열 배열을 콤마로 구분된 문자열로 변환

  return (
    <div className="project-container">
      <p className="project-title">Title: {project.title}</p>
      <p className="project-content">Content: {project.content}</p>
      <p className="project-keywords">Keyword: {keywordsString}</p>
      <p className="project-user">
        Created by: {project.user.profile.user_name}
      </p>
      <p className="project-date">Created at: {formattedDate}</p>
      <button
        className="delete-button"
        onClick={() => onDelete(project.project_id)}
      >
        Delete
      </button>
    </div>
  );
}

export default Project;
