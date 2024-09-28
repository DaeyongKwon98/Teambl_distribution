import React, { useState, useEffect } from "react";
import api from "../api";
import ProjectItem from "../components/ProjectItem";
import Modal from "../components/Modal";
import "../styles/Project.css";

function Project() {
  const [currentUser, setCurrentUser] = useState(null);  // 로그인한 사용자 정보
  const [projects, setProjects] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [contact, setContact] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [image, setImage] = useState(null);
  const [allFriends, setAllFriends] = useState([]);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [searchInput, setSearchInput] = useState(""); // Search input state
  const [filteredFriends, setFilteredFriends] = useState([]); // Filtered friends list

  useEffect(() => {
    getCurrentUser();
    getProjects();
    fetchFriends();
  }, []);

  const openModal = () => {
    setSearchInput("");
    setFilteredFriends(allFriends.filter(friend => taggedUsers.includes(friend.id))); // Initially show only tagged users
    setSelectedUserIds([...taggedUsers]); // Set initial selected users
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    
    const filtered = allFriends.filter((friend) => 
      friend.user_name.toLowerCase().includes(input.toLowerCase()) ||
      selectedUserIds.includes(friend.id)  // Always include already selected friends
    );

    setFilteredFriends(filtered);
  };

  const toggleSelectUser = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId)); // Deselect if already selected
    } else {
      setSelectedUserIds([...selectedUserIds, userId]); // Select if not already selected
    }
  };

  const confirmTaggedUsers = () => {
    setTaggedUsers(selectedUserIds); // Save the selected users as tagged users
    setIsModalOpen(false);
  };

  const fetchFriends = () => {
    api
      .get("/api/friends/one-degree/")
      .then((res) => setAllFriends(res.data.results))
      .catch((err) => alert("Failed to fetch friends list."));
  };
  
  const removeTaggedUser = (index) => {
    setTaggedUsers(taggedUsers.filter((_, i) => i !== index));
  };

  // 현재 로그인한 사용자 정보 가져오기
  const getCurrentUser = () => {
    api
      .get("/api/current-user/")  // 'current-user' 엔드포인트 호출
      .then((res) => setCurrentUser(res.data))  // 사용자 정보 상태에 저장
      .catch((err) => alert("Failed to fetch current user info."));
  };

  const getProjects = () => {
    api
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
    formData.append("contact", contact);
  
    // 키워드를 배열로 전송할 때는 반복문을 통해 추가해야 함
    keywords.forEach((keyword) => {
      formData.append("keywords[]", keyword); // 'keywords[]'로 배열 형태로 전송
    });
    
    console.log("Tagged Users in createProject:", taggedUsers);

    if (taggedUsers.length > 0) {
      taggedUsers.forEach((userId) => {
          formData.append("tagged_users", userId);
      });
  }

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
        setContact("");
        setKeywords([]);
        setTaggedUsers([]);
        setImage(null);
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
            refreshProjects={getProjects}
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
        <label htmlFor="contact">Contact:</label>
        <br />
        <input
          type="text"
          id="contact"
          name="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <br />
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

        <label htmlFor="taggedUsers">Tag Users:</label>
        <button type="button" onClick={openModal}>
          Search and Tag Users
        </button>
        <ul>
          {taggedUsers.map((userId, index) => {
            const user = allFriends.find((u) => u.id === userId);
            return (
              <li key={index}>
                {user ? user.user_name : "Unknown User"}
                <button type="button" onClick={() => removeTaggedUser(index)}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
        <input type="submit" value="Submit" />
      </form>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h3>Select a User</h3>
        <input
          type="text"
          placeholder="Search for a friend..."
          value={searchInput}
          onChange={handleSearchChange}
        />
        <ul>
          {filteredFriends.map((friend) => (
            <li 
              key={friend.id} 
              onClick={() => toggleSelectUser(friend.id)}
              style={{ 
                cursor: "pointer", 
                backgroundColor: selectedUserIds.includes(friend.id) ? "#d3f9d8" : "white" 
              }}
            >
              {friend.user_name}
            </li>
          ))}
        </ul>
        <button onClick={confirmTaggedUsers}>Done</button>
      </Modal>

    </div>
  );
}

export default Project;
