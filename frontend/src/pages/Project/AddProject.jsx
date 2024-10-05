import React, { useEffect, useState } from 'react';
import "../../styles/Project/AddProject.css";
import backIcon from "../../assets/Profile/left-arrow.svg";
import { useNavigate } from 'react-router-dom';
import majorEdit from "../../assets/Profile/majorEdit.svg";
import ItemEditor from '../../components/ItemEditor';
import FriendSelectPopUp from './FriendSelectPopUp';
import api from '../../api';

const requestBodyInit = {
    "title" : "",
    "content" : "",
    "contacts" : [],
    "tagged_users" : [],
    "images" : []
};

const AddProject = () => {

    const navigate = useNavigate();

    const [myId, setMyId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [requestBody, setRequestBody] = useState(requestBodyInit);
    const [imageList, setImageList] = useState([]);
    const [friendList, setFriendList] = useState([]);
    const [selectedFriendList, setSelectedFriendList] = useState([]);
    const [contactList, setContactList] = useState([]);
    const [isValid, setIsValid] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [isFriendSelectPopUpOpen, setIsFriendSelectPopUpOpen] = useState(false);

    /** initialize */
    const initialize = async () => {
        /** TODO */
    };

    /** fetch friend list & my information */
    const fetchFriendList = async () => {
        await setIsLoading(true);
        await setIsError(false);
        try {
            /** get my information */
            let tempMyId = -999;
            const myRes = await api.get('/api/current-user/');
            tempMyId = myRes.data.id;
            await setMyId(tempMyId);
            const res = await api.get('/api/friends/one-degree/');
            /** delete me */
            let filteredList = res.data.results.filter(item => {
                return (item.id !== tempMyId);
            });
            /** 동명이인 처리 : 이메일 추가 */
            const nameCount = filteredList.reduce((acc, user) => {
                acc[user.user_name] = (acc[user.user_name] || 0) + 1;
                return acc;
            }, {});
            let updatedList = filteredList.map(user => {
                if (nameCount[user.user_name] > 1) {
                  return {
                    ...user,
                    user_name: `${user.user_name} (${user.email})`
                  };
                }
                return user;
            });
            await setFriendList(updatedList);
        } catch (e) {
            console.log(e);
            await setIsError(true);
        } finally {
            await setIsLoading(false);
        }
    };

    /** save */
    const postNewProject = async () => {
        if (!isValid) {
            return;
        }
        /** TODO */
    };

    /** utils */
    const updateHelper = async (key, value) => {
        await setRequestBody(prevObj => {
            let newObj = {...prevObj};
            newObj[key] = value;
            return newObj;
        });
    };

    const removeFriend = async (index) => {
        await setSelectedFriendList(prevList => {
            let newList = [...prevList];
            newList.splice(index, 1);
            return newList;
        });
    };

    /** effects */
    useEffect(() => {
        fetchFriendList();
    }, []);

    if (isLoading) {
        return (
			<div className="addProject-loader-container">
			  <div className="addProject-loader" />
			</div>
		);
    }

    if (isError) {
        return (
			<div className="addProject-body addProject-with-pd-28">
			  <div className="addProject-container">
				{/** Backward button */}
				<div className="addProject-backward-btn-container">
				  <button
					className="addProject-backbutton"
					onClick={() => window.history.back()}
				  >
					<img src={backIcon} />
				  </button>
				</div>
			  </div>
			  <div className="addProject-error-container">
				{"일촌 목록 정보를 불러오는 데 실패했습니다."}
			  </div>
			</div>
		);
    }

    return (
        <div className='addProject-body'>
            <div className="addProject-container">
				{/** Backward button */}
				<div className="addProject-backward-btn-container">
				  <button
					className="addProject-backbutton"
					onClick={() => window.history.back()}
				  >
					<img src={backIcon} />
				  </button>
				</div>
			</div>
            {/** Title */}
			<div className='addProject-title-container'>
				{"게시물 만들기"}
			</div>
            {/** Body */}
            {/** 제목 */}
            <div className='addProject-field-title-container addProject-with-mt-32'>
                <span className='addProject-field-title'>
                    {"제목"}
                </span>
                <span className='addProject-field-title-star'>
                    {"*"}
                </span>
            </div>
            <input
                className='addProject-field-input addProject-with-mt-12'
                placeholder='게시물 제목을 작성해 보세요.'
                value={requestBody['title']}
                onChange={async (e) => await updateHelper("title", e.target.value)}
            />
            {/** 내용 */}
            <div className='addProject-field-title-container addProject-with-mt-24'>
                <span className='addProject-field-title'>
                    {"내용"}
                </span>
                <span className='addProject-field-title-star'>
                    {"*"}
                </span>
            </div>
            <div className='addProject-textarea-container addProject-with-mt-12'>
                <textarea
                    className='addProject-textarea'
                    placeholder={"게시물와 관련된 내용을 자유롭게 작성해 보세요. 해시태그 작성은 게시물 검색을 용이하게 합니다. 게시물 관련된 링크는 필요시 글에 첨부해 주세요."}
                    value={requestBody['content']}
                    onChange={async (e) => await updateHelper("content", e.target.value)}
                />
            </div>
            {/** 이미지 첨부 */}
            <div className='addProject-field-title-container addProject-with-mt-24'>
                <span className='addProject-field-title'>
                    {"이미지 첨부"}
                </span>
                <span className='addProject-field-subtitle'>
                    {"이미지는 최대 3개까지 첨부 가능"}
                </span>
            </div>
            <div className='addProject-image-container addProject-with-mt-12'>
                {/** image preview or message */}
                {
                    (imageList.length === 0) &&
                    <div className='addProject-image-message-container'>
                        <span className='addProject-image-message'>
                            {"게시물와 관련된 이미지를 첨부해 보세요."}
                        </span>
                    </div>
                }
                {
                    (imageList.length > 0) &&
                    <>TODO</>
                }
                {/** horizontal bar */}
                <div className='addProject-horizontal-bar addProject-with-mt-16'>
                    {/** no content */}
                </div>
                {/** add button */}
                <div
                    className='addProject-add-button-container'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                        <path d="M6.5 1V11" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M11.5 6L1.5 6" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span className='addProject-add-button-text addProject-with-ml-8'>
                        {"추가하기"}
                    </span>
                </div>
            </div>
            {/** 일촌 태그 */}
            <div className='addProject-field-title-container addProject-with-mt-24'>
                <span className='addProject-field-title'>
                    {"일촌 태그"}
                </span>
            </div>
            <div
                className='addProject-friend-container addProject-with-mt-12'
                onClick={() => {
                    if (friendList.length !== 0) {
                        setIsFriendSelectPopUpOpen(true)
                    }
                }}
            >
                <img
                    src={majorEdit}
                    alt="일촌 검색"
                />
                {
                    (selectedFriendList.length === 0) &&
                    <div className='addProject-friend-message-container'>
                        <span className='addProject-friend-message addProject-with-ml-8 addProject-with-mb-12-5'>
                            {
                                (friendList.length === 0) ?
                                    "게시물을 함께할 수 있는 일촌이 없습니다."
                                    :
                                    "게시물을 함께하는 일촌 태그"
                            }
                        </span>
                    </div>
                }
                {
                    (selectedFriendList.length > 0) &&
                    <div className='addProject-element-container'>
                        {
                            selectedFriendList.map((friendInfo, index) => (
                                <div
                                    key={friendInfo.id}
                                    className={"addProject-element addProject-with-ml-8"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {friendInfo['user_name']}
                                    <button
                                        className="addProject-remove-element"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFriend(index);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M1.5 8.5L8.5 1.5M8.5 8.5L1.5 1.5" stroke="#A8A8A8" strokeWidth="1.2" strokeLinecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                }
            </div>
            {/** 연락처 */}
            <div className='addProject-field-title-container addProject-with-mt-24'>
                <span className='addProject-field-title'>
                    {"연락처"}
                </span>
                <span className='addProject-field-title-star'>
                    {"*"}
                </span>
            </div>
            <div className='addProject-contact-container addProject-with-mt-12'>
                <ItemEditor
                    type={"string"}
                    currentItemList={contactList}
                    setCurrentItemList={setContactList}
                    placeholderMsg={"연락 가능한 수단을 추가해주세요."}
                    maxItemNum={999}
                />
            </div>
            {/** 일촌 태그 카드 */}
            {
                isFriendSelectPopUpOpen &&
                <FriendSelectPopUp
                    isPopUpOpen={isFriendSelectPopUpOpen}
                    setIsPopUpOpen={setIsFriendSelectPopUpOpen}
                    friendList={friendList}
                    selectedFriendList={selectedFriendList}
                    setSelectedFriendList={setSelectedFriendList}
                    maxSelectedNum={999}
                />
            }

            {/** save button */}
            <button
                className={
                    'addProject-save-button'
                    + ((isValid) ? '' : ' addProject-btn-disabled')
                }
                onClick={async () => {
                    if (isValid) {
                        alert("TODO");
                    }
                }}
            >
                {
                    (!isSaveLoading) &&
                    <>{"저장"}</>
                }
                {
                    isSaveLoading &&
                    <div
                        className="addProject-button-loader"
                        style={{
                            display: 'inline-block'
                        }}
                    />
                }
            </button>
        </div>
    );
};

export default AddProject;