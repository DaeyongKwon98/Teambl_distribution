import React, { useState, useEffect } from "react";
// import "../styles/ProjectItem.css";
import api from "../api";
import Modal from "./Modal";
import BottomSheet from "./BottomSheet";
import ProfileComponent from "./ProfileComponent";
import Tags from "./Tags";
import Description from "./Description";
import ImageSection from "./ImageSection";
import Reactions from "./Reactions";
import CommentSection from "./CommentSection";

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
  const [editImages, setEditImages] = useState([]); // 수정된 이미지 배열
  const [imagePreviews, setImagePreviews] = useState([]); // 이미지 미리보기
  const [existingImages, setExistingImages] = useState(project.images || []); // 기존에 등록된 이미지 배열
  const [imagesToDelete, setImagesToDelete] = useState([]); // 삭제할 이미지 ID 배열
  const [editContact, setEditContact] = useState(project.contact || "");

  const [allFriends, setAllFriends] = useState([]);
  const [editTaggedUsers, setEditTaggedUsers] = useState(Array.isArray(project.tagged_users) ? project.tagged_users : []);
  const [selectedUser, setSelectedUser] = useState("");
  const [originalTaggedUsers, setOriginalTaggedUsers] = useState([]);
  
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredFriends, setFilteredFriends] = useState([]);

  const [commentsVisible, setCommentsVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const toggleComments = () => {
    setCommentsVisible(!commentsVisible);
  };

  const toggleBottomSheet = () => {
    setBottomSheetVisible(!bottomSheetVisible);
  };

  const handleLinkCopy = () => {
    // 링크 복사 기능 구현
    navigator.clipboard.writeText("복사할 링크").then(() => {
      alert("링크가 복사되었습니다!");
    });
    toggleBottomSheet(); // 바텀 시트 닫기
  };

  const handleReport = () => {
    // 신고 기능 구현
    alert("신고가 접수되었습니다.");
    toggleBottomSheet(); // 바텀 시트 닫기
  };

  useEffect(() => {
    // 기존 이미지를 미리보기 설정
    const existingImagePreviews = project.images.map((image) => image.image_url);
    setImagePreviews(existingImagePreviews);
  }, [project.images]);

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

    // 기존 이미지를 미리보기 설정
    const existingImagePreviews = project.images.map((image) => image.image_url);
    setImagePreviews(existingImagePreviews);

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

  // 이미지 선택 핸들러 (최대 3개)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + editImages.length + existingImages.length > 3) {
      alert("You can only upload up to 3 images.");
      return;
    }

    setEditImages([...editImages, ...files]);
  };

  // 기존 이미지 삭제 함수
  const removeExistingImage = (imageId) => {
    setImagesToDelete([...imagesToDelete, imageId]); // image.id를 사용하여 삭제할 이미지 ID 저장
    setExistingImages(existingImages.filter((image) => image.id !== imageId)); // image.id로 필터링하여 삭제
  };

  // 새로운 이미지 삭제 함수
  const removeImage = (index) => {
    const updatedImages = [...editImages];
    updatedImages.splice(index, 1);
    setEditImages(updatedImages);
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
    console.log("likecount", likeCount);
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

    // 새로운 이미지를 추가
    editImages.forEach((image) => {
      formData.append("images", image);
    });

    // 삭제할 기존 이미지 ID 전송
    imagesToDelete.forEach((imageId) => {
      formData.append("images_to_delete[]", imageId);
    });

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
        setExistingImages(res.data.images);

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

      <div className="new-project" key={project.project_id}>
        <ProfileComponent
          profileImage={project.user.profile.image}
          authorName={project.user.profile.user_name}
          major1={project.user.profile.major1}
          major2={project.user.profile.major2}
          school={project.user.profile.school}
          postDate={project.created_at}
          onSettingClick={toggleBottomSheet}
        />
        <div className="project-title">{project.title}</div>
        <Tags tags={project.keywords} />
        <Description 
          description={project.content}
          contactInfo={project.contact}
        />
        <ImageSection postImages={project.images} />
        <Reactions 
          participants={project.tagged_users} 
          likes={likeCount}
          comments={comments.length}
          onCommentsClick={toggleComments}
          likesClick={toggleLike}
          liked={liked}
        />
        {commentsVisible && (
          <CommentSection project={project} comments={comments} setComments={setComments} currentUser={currentUser}/>
        )}
        {bottomSheetVisible && (
          <BottomSheet 
            onClose={toggleBottomSheet} 
            onLinkCopy={handleLinkCopy} 
            onReport={handleReport}
          />
        )}

        {/* {currentUser && (
          <button
            className="delete-project-button"
            onClick={() => deleteProject(project.project_id)}
          >
            Delete Project
          </button>
        )} */}
        {currentUser && currentUser.email === project.user.email && (
          <div>
            <button
              className="delete-button"
              onClick={() => onDelete(project.project_id)}
            >
              삭제하기
            </button>
          </div>
        )}
      </div>

      {isEditingProject && (
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
            <label htmlFor="image">Edit Images (Max 3):</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <div className="image-previews">
              {/* 기존 이미지 출력 및 삭제 */}
              {existingImages.length > 0 && (
                <div className="existing-images">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${image.id || index}`}>
                      <img
                        src={image.image}
                        alt={`Project ${project.title}`}
                        width="100"
                      />
                      <button type="button" onClick={() => removeExistingImage(image.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* 새로운 이미지 미리보기 및 삭제 */}
              {editImages.length > 0 && (
                <div className="image-previews">
                  {editImages.map((image, index) => (
                    <div key={`new-${index}`}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        width="100"
                      />
                      <button type="button" onClick={() => removeImage(index)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
      )}

      {/* <p className="project-likes">좋아요 수: {likeCount}</p>
      <button className="like-button" onClick={toggleLike}>
        {liked ? "좋아요 취소" : "좋아요"}
      </button> */}

      {currentUser && currentUser.email === project.user.email && (
        <div>
          {/* <button
            className="delete-button"
            onClick={() => onDelete(project.project_id)}
          >
            삭제하기
          </button> */}
          {!isEditingProject && (
            <button onClick={() => setIsEditingProject(true)}>수정하기</button>
          )}
        </div>
      )}

      {/* <div className="comments-section">
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
      </div> */}

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
