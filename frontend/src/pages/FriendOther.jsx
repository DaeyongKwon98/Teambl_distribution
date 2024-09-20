import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "../styles/FriendOther.css";
import backIcon from "../assets/ProfileOther/left-arrow.svg";
import api from "../api";
import FriendOtherItem from "../components/FriendOtherItem";

export default function FriendOther() {

    const location = useLocation();
    const { id } = useParams(); /** id of the profile owner */

    /** loading, onerr states */
    const [isLoading, setIsLoading] = useState(true);
    const [isOnError, setIsOnError] = useState(false);
    /** data states */
    const [userInfo, setUserInfo] = useState({});
    const [friendLsit, setFriendList] = useState([]);

    /** fetch friend list of the user */
    const fetchFriendList = async () => {
        try {
            /** TODO : MUST be edited after API endpoint is made */
            const dummyList = [
                {
                    "id" : 12,
                    "user_name": "김더미",
                    "school": "카이스트",
                    "current_academic_degree": "학사",
                    "year": 2018,
                    "major1": "전산학부",
                    "major2": "",
                    "keywords": [
                        "iOS"
                    ],
                    "one_degree_count": 1,
                    "introduction": "이후 실제 일촌이 보이도록 변경될 예정입니다.",
                    "tools": [
                        {
                            "id": 7,
                            "tool": "Python"
                        },
                        {
                            "id": 8,
                            "tool": "Django"
                        }
                    ],
                    "experiences": [
                        {
                            "id": 3,
                            "experience": "xx사 인턴 경험"
                        }
                    ],
                    "portfolio_links": [
                        {
                            "id": 2,
                            "portfolioLink": "https://naver.com"
                        }
                    ],
                    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFtFDhM-IuW-D0EULoVJ2Bmrp4xQ3Th6Z-JQ&s"
                },
                {
                    "id" : 8,
                    "user_name": "유더미",
                    "school": "카이스트",
                    "current_academic_degree": "학사",
                    "year": 2018,
                    "major1": "전산학부",
                    "major2": "",
                    "keywords": [
                        "Android",
                        "Spring"
                    ],
                    "one_degree_count": 1,
                    "introduction": "저는 존재하지 않는 사람입니다.",
                    "tools": [
                        {
                            "id": 7,
                            "tool": "Java"
                        },
                        {
                            "id": 8,
                            "tool": "Docker"
                        }
                    ],
                    "experiences": [
                        {
                            "id": 3,
                            "experience": "스타트업 상장 경험 있었으면 좋겠습니다"
                        }
                    ],
                    "portfolio_links": [
                        {
                            "id": 2,
                            "portfolioLink": "https://naver.com"
                        }
                    ],
                    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkujf3NOEXPgZuKmaLJ8rECriBTuOOZy78gA&s"
                },
                {
                    "id" : 71,
                    "user_name": "이더미",
                    "school": "카이스트",
                    "current_academic_degree": "학사",
                    "year": 2018,
                    "major1": "전산학부",
                    "major2": "전기전자공학부",
                    "keywords": [
                        "iOS"
                    ],
                    "one_degree_count": 1,
                    "introduction": "이후 실제 일촌이 보이도록 변경될 예정입니다.",
                    "tools": [
                        {
                            "id": 7,
                            "tool": "Python"
                        },
                        {
                            "id": 8,
                            "tool": "Django"
                        }
                    ],
                    "experiences": [
                        {
                            "id": 3,
                            "experience": "xx사 인턴 경험"
                        }
                    ],
                    "portfolio_links": [
                        {
                            "id": 2,
                            "portfolioLink": "https://naver.com"
                        }
                    ],
                    "image": null
                }
            ];
            await setFriendList(dummyList);
            await setIsLoading(false);
        } catch (e) {
            console.error(e);
            await setIsOnError(true);
            await setIsLoading(false);
        }
    };

    /** fetch friend list of the user */
    /** callback function MUST be provided */
    const fetchUserInfo = async (callback) => {
        await setIsLoading(true);
        try {
            const res = await api.get(`/api/user/${id}/`);
            await setUserInfo(res.data.profile);
            await callback();
        } catch (e) {
            console.error(e);
            await setIsOnError(true);
            await setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo(fetchFriendList);
    }, []);

    /** loading */
    if (isLoading) {
        return (
            <div className="friendOther-loader-container">
                <div className="friendOther-loader" />
            </div>
        );
    }

    /** error */
    if (isOnError) {
        return (
            <div className="friendOther-body">
                <div className="friendOther-container">
                    {/** Backward button and Title */}
                    <div className="friendOther-title-container">
                        <button
                            className="friendOther-backbutton"
                            onClick={() => window.history.back()}
                        >
                            <img src={backIcon} />
                        </button>
                    </div>
                </div>
                <div className="friendOther-error-container">
                    {"일촌 정보를 불러오는 데 실패했습니다."}
                </div>
            </div>
        );
    }
    
    return (
        <div className="friendOther-body">
            <div className="friendOther-container">
                {/** top fixed area */}
                <div className="friendOther-toparea-container top-sticky top-0px">
                    {/** Backward button and Title */}
                    <div className="friendOther-title-container">
                        <button
                            className="friendOther-backbutton"
                            onClick={() => window.history.back()}
                        >
                            <img src={backIcon} />
                        </button>
                        <span className="friendOther-title margin-left-15px">
                            {`${userInfo['user_name'] ? userInfo['user_name'] : ""}님의 1촌`}
                        </span>
                    </div>
                    {/** Number of friends */}
                    <div className="friendOther-friend-number-container">
                        <span className="friendOther-friend-number">
                            {`${friendLsit.length}명`}
                        </span>
                    </div>
                </div>
                {/** actual list view */}
                <div className="friendOther-item-container">
                    {
                        friendLsit.map(friendInfo => {
                            return (
                                <FriendOtherItem
                                    key={friendInfo['id']}
                                    friendInfo={friendInfo}
                                />
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}