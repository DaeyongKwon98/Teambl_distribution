import React, { useState, useEffect } from "react";
import "../styles/ProjectItem.css";
import api from "../api";
import Modal from "./Modal";

function ProjectItem({ project, onDelete, currentUser, refreshProjects }) {
  const formattedDate = new Date(project.created_at).toLocaleDateString("en-US");
  const [likeCount, setLikeCount] = useState(project.like_count); // 프로젝트의 초기 좋아요 수를 상태로 설정
  const [liked, setLiked] = useState(false); // 사용자가 좋아요를 눌렀는지 추적하는 상태
  const [comments, setComments] = useState([]); // 댓글 목록 상태
  const [newComment, setNewComment] = useState(""); // 새 댓글 상태
  const [editingComment, setEditingComment] = useState(null); // 수정 중인 댓글
  const [editContent, setEditContent] = useState(""); // 수정된 댓글 내용

  const [isEditingProject, setIsEditingProject] = useState(false); // 프로젝트 수정 모드
  const [editTitle, setEditTitle] = useState(project.title); // 수정된 제목
  const [editContentProject, setEditContentProject] = useState(project.content); // 수정된 내용
  const [editKeywords, setEditKeywords] = useState(Array.isArray(project.keywords) ? project.keywords : []); // 수정된 키워드
  const [newKeyword, setNewKeyword] = useState(""); // 새로 추가할 키워드
  const [editImage, setEditImage] = useState(null);
  const [editContact, setEditContact] = useState(project.contact || "");

  const [allFriends, setAllFriends] = useState([]);
  const [editTaggedUsers, setEditTaggedUsers] = useState(Array.isArray(project.tagged_users) ? project.tagged_users : []);
  const [selectedUser, setSelectedUser] = useState("");
  const [originalTaggedUsers, setOriginalTaggedUsers] = useState([]);
  
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredFriends, setFilteredFriends] = useState([]);

  useEffect(() => { // 프로젝트의 댓글 목록을 불러오는 함수
    api.get(`/api/projects/${project.project_id}/comments/`)
      .then((res) => setComments(res.data.results))
      .catch((err) => console.error(err));

    // 좋아요 여부를 백엔드에서 불러오는 함수
    const fetchLikedStatus = async () => {
      try {
        const response = await api.get(`/api/projects/${project.project_id}/liked-status/`);
        setLiked(response.data.liked);
      } catch (error) {
        console.error("Failed to fetch liked status", error);
      }
    };
    fetchLikedStatus();

    const fetchFriends = () => {
      api.get("/api/friends/one-degree/")
        .then((res) => setAllFriends(res.data.results))
        .catch((err) => console.error("Failed to fetch friends", err));
    };
    fetchFriends();

    setOriginalTaggedUsers([...project.tagged_users]);
    setEditTaggedUsers([...project.tagged_users]);

  }, [project.project_id]);

  const openModal = () => {
    setSearchInput("");
    setFilteredFriends(allFriends.filter(user => editTaggedUsers.some(taggedUser => taggedUser.id === user.id)));
    setSelectedUserIds(editTaggedUsers.map(user => user.id)); 
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    
    const filtered = allFriends.filter((user) => 
      user.user_name.toLowerCase().includes(input.toLowerCase()) ||
      selectedUserIds.includes(user.id) 
    );

    setFilteredFriends(filtered);
  };

  const toggleSelectUser = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const confirmTaggedUsers = () => {
    const updatedTaggedUsers = allFriends.filter(user => selectedUserIds.includes(user.id));
    setEditTaggedUsers(updatedTaggedUsers);
    setIsModalOpen(false);
  };

  // Displaying Tagged Users
  const displayTaggedUsers = () => {
    if (project.tagged_users && project.tagged_users.length > 0) {
      return (
        <ul>
          {project.tagged_users.map((user) => (
            <li key={user.id}>
              {user.user_name ? user.user_name : "Unknown User"}
            </li>
          ))}
        </ul>
      );
    } else {
      return <p>No tagged users.</p>;
    }
  };

  // Add a tagged user
  const addTaggedUser = () => {
    if (selectedUser && !editTaggedUsers.some(user => user.id === selectedUser)) {
      const userObj = allFriends.find(user => user.id === Number(selectedUser));
      setEditTaggedUsers([...editTaggedUsers, userObj]);
      setSelectedUser("");
    }
  };

  // Remove a tagged user
  const removeTaggedUser = (userId) => {
    const updatedTaggedUsers = editTaggedUsers.filter(user => user.id !== userId);
    setEditTaggedUsers(updatedTaggedUsers);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    setEditImage(e.target.files[0]);
  };

  // 키워드 삭제
  const removeKeyword = (index) => {
    const updatedKeywords = [...editKeywords];
    updatedKeywords.splice(index, 1); // 해당 키워드 삭제
    setEditKeywords(updatedKeywords);
  };

  // 키워드 추가
  const addKeyword = () => {
    if (newKeyword.trim() && !editKeywords.includes(newKeyword.trim())) {
      setEditKeywords([...editKeywords, newKeyword.trim()]);
      setNewKeyword(""); // 추가 후 입력 필드 초기화
    }
  };

  // 댓글 작성 함수
  const submitComment = () => {
    if (!newComment.trim()) return;
    api.post(`/api/projects/${project.project_id}/comments/create/`, { content: newComment })
      .then((res) => {
        setComments([...comments, res.data]); // 댓글 목록 업데이트
        setNewComment(""); // 입력 필드 초기화
      })
      .catch((err) => {
        console.error("Failed to submit comment", err);
        console.log("Error response:", err.response.data);  // 서버에서 반환된 오류 메시지를 로그로 확인
      });
  };

  // 댓글 수정 함수
  const updateComment = (commentId) => {
    if (!editContent.trim()) return;
    api.patch(`/api/comments/${commentId}/edit/`, { content: editContent })
      .then((res) => {
        setComments(comments.map((comment) => (comment.id === commentId ? res.data : comment)));
        setEditingComment(null);
        setEditContent("");
      })
      .catch((err) => console.error(err));
  };

  // 댓글 삭제 함수
  const deleteComment = (commentId) => {
    api.delete(`/api/comments/${commentId}/delete/`)
      .then(() => setComments(comments.filter((comment) => comment.id !== commentId)))
      .catch((err) => console.error(err));
  };

  // 수정 취소 (Undo)
  const undoEdit = (originalContent) => {
    setEditContent(originalContent);
    setEditingComment(null);
  };

  // 좋아요를 토글하는 함수
  const toggleLike = () => {
    api
      .post(`/api/projects/${project.project_id}/like-toggle/`)
      .then((res) => {
        if (res.status === 200) {
          setLikeCount(res.data.like_count); // 좋아요 수 업데이트
          setLiked(!liked); // 좋아요 상태 반전
        }
      })
      .catch((error) => console.error(error));
  };

  // 프로젝트 수정 저장 함수
  const saveProject = () => {
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("content", editContentProject);
    formData.append("contact", editContact);
    editKeywords.forEach((keyword) => {
      formData.append("keywords[]", keyword);
    });
    editTaggedUsers.forEach((user) => {
      formData.append("tagged_users", user.id);
    });

    // Add the image to formData if a new image was selected
    if (editImage) {
      formData.append("image", editImage);
    }

    api.patch(`/api/projects/${project.project_id}/edit/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        setIsEditingProject(false);
        setEditTitle(res.data.title);
        setEditContentProject(res.data.content);
        setEditKeywords(res.data.keywords);
        setEditTaggedUsers(res.data.tagged_users);
        setOriginalTaggedUsers(res.data.tagged_users);
        setEditContact(res.data.contact);
        project.image = res.data.image;

        if (refreshProjects) {
          refreshProjects();
        }
      })
      .catch((err) => console.error("Failed to update project", err));
  };

  const cancelEdit = () => {
    setIsEditingProject(false);
    setEditTitle(project.title);
    setEditContentProject(project.content);
    setEditKeywords(project.keywords);
    setEditTaggedUsers(originalTaggedUsers);
    setEditContact(project.contact || "");
  };

  return (
    <div className="project-container">
      {isEditingProject ? (
        <div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <textarea
            value={editContentProject}
            onChange={(e) => setEditContentProject(e.target.value)}
          />
          <input
            type="text"
            value={editContact}
            onChange={(e) => setEditContact(e.target.value)}
            placeholder="Enter contact information"
          />
          <div className="image-edit-section">
            <label htmlFor="image">Edit Image:</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="keyword-edit-section">
            {editKeywords.map((keyword, index) => (
              <div key={index} className="keyword-item">
                <span>{keyword}</span>
                <button onClick={() => removeKeyword(index)}>Remove</button>
              </div>
            ))}

            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Add new keyword"
            />
            <button onClick={addKeyword}>Add Keyword</button>
          </div>
          <div className="tagged-users-section">
            <h4>Edit Tagged Users:</h4>
            <button type="button" onClick={openModal}>
              Search and Tag Users
            </button>
            <ul>
              {editTaggedUsers.map((user) => (
                <li key={user.id}>
                  {user.user_name}
                  <button type="button" onClick={() => removeTaggedUser(user.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={saveProject}>Save</button>
          <button onClick={cancelEdit}>Cancel</button>
        </div>
      ) : (
        <div>
          <p className="project-title">{project.title}</p>
          {project.image && (
            <img
              src={project.image}
              alt={project.title}
              className="project-image"
            />
          )}
          <p className="project-content">{project.content}</p>
          <p className="project-contact">Contact: {project.contact || "No contact info provided"}</p>
          <p className="project-keywords">
            {editKeywords.map((keyword, index) => (
              <span key={index} className="keyword-item">
                #{keyword}
              </span>
            ))}
          </p>
          <p className="project-user">
            작성자: {project.user && project.user.profile ? project.user.profile.user_name : "Unknown User"}
          </p>
          <p className="project-date">작성일: {formattedDate}</p>

          <div className="tagged-users">
            <h4>Tagged Users:</h4>
            {displayTaggedUsers()}
          </div>
        </div>
      )}

      <p className="project-likes">좋아요 수: {likeCount}</p>
      <button className="like-button" onClick={toggleLike}>
        {liked ? "좋아요 취소" : "좋아요"}
      </button>

      {currentUser && currentUser.email === project.user.email && (
        <div>
          <button
            className="delete-button"
            onClick={() => onDelete(project.project_id)}
          >
            삭제하기
          </button>
          {!isEditingProject && (
            <button onClick={() => setIsEditingProject(true)}>수정하기</button>
          )}
        </div>
      )}

      <div className="comments-section">
        <h4>댓글</h4>
        {comments.length === 0 ? (
          <p>아직 댓글이 없어요.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              {editingComment === comment.id ? (
                // 댓글 수정 중일 때
                <div>
                  <textarea
                    className="comment-textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <button onClick={() => updateComment(comment.id)}>저장</button>
                  <button onClick={() => undoEdit(comment.content)}>취소</button>
                </div>
              ) : (
                // 수정 중이 아닐 때
                <div>
                  <p><strong>{comment.user_name}</strong>: {comment.content}</p>
                  {currentUser && currentUser.id === comment.user && (
                    <div>
                      <button onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content); // 현재 댓글 내용을 편집 필드에 넣음
                      }}>수정하기</button>
                      <button onClick={() => deleteComment(comment.id)}>삭제하기</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="comment-input">
        <textarea
          className="comment-input-textarea"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글 쓰기"
        />
        <button onClick={submitComment}>Submit</button>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h3>Select Users</h3>
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

export default ProjectItem;
