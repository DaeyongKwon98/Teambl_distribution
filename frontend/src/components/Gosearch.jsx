import React from 'react';
import "../styles/Gosearch.css";
import GoSearchIcon from "../assets/gosearchIcon.svg";
import { useNavigate } from "react-router-dom";

const Gosearch = () => {
    const navigate = useNavigate();
    const goToSearch = () => { navigate("/search"); };
    return (
        <div className='gosearch-container'>
            <div className='gosearch-and-input' onClick={goToSearch}>
                <img
                src={GoSearchIcon}
                alt="검색화면이동"
                className="gosearch-gosearch-icon"
                />
                <input type='text' placeholder='사람, 게시물을 탐색해 보세요.'/>
            </div>
        </div>
    );
};

export default Gosearch;
