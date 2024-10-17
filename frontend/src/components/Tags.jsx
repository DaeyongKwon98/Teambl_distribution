import React from "react";
import "../styles/NewProject/NewProject.css";

const Tags = ({ tags = [] }) => (
    <div className="project-tags-section">
        {tags.map((tag, index) => (
            <span key={index} className="project-tag">
                {tag}
            </span>
        ))}
    </div>
);

export default Tags;