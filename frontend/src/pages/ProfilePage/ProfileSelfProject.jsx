import React, { useEffect, useState } from 'react';
import "../../styles/ProfilePage/ProfileSelfProject.css";
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const ProfileSelfProject = ({ userId }) => {

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [projectList, setProjectList] = useState([]);

    /** state init */
    const initializeAll = async () => {
        /** TODO */
    };

    /** fetch project list */
    const fetchProjectList = async () => {
        await setIsLoading(true);
        await setIsError(false);
        try {
            const res = await api.get('/api/projects/');
            await setProjectList(res.data.results);
        } catch (e) {
            console.log(e);
            await setIsError(true);
        } finally {
            await setIsLoading(false);
        }
    };

    /** effects */
    useEffect(() => {
        fetchProjectList();
    }, []);

    /** return components */
    if (isLoading) {
		return (
			<div className="profileSelfProject-loader-container">
			  <div className="profileSelfProject-loader" />
			</div>
		);
    }

    if (isError) {
        return (
			<div className="profileSelfProject-error-container">
				{"게시물 정보를 불러오는 데 실패했습니다."}
			</div>
		);
    }
    
    return (
        <div
            className='profileSelfProject-container'
        >
            {
                (projectList.length === 0) &&
                <div className='profileSelfProject-no-content-container'>
                    <span className='profileSelfProject-no-content-message'>
                        {"첫 번째 게시물을 올려보세요."}
                    </span>
                    <button className='profileSelfProject-no-content-other-button profileSelfProject-mt-8'>
                        {"다른 게시물을 찾아볼까요?"}
                    </button>
                    <button
                        className='profileSelfProject-add-content-button profileSelfProject-mt-32'
                        onClick={() => navigate('/projects/add')}
                    >
                        {"게시물 올리기"}
                    </button>
                </div>
            }
            {
                (projectList.length > 0) &&
                <>
                    {"TODO"}
                </>
            }
        </div>
    );
};

export default ProfileSelfProject;