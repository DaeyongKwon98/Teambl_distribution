import React, { useState } from 'react';
import "../styles/TitleAndContentToggle.css";

const TitleAndContentToggle = ({ children, title }) => {

    const [isToggleOpen, setIsToggleOpen] = useState(false);

    return (
        <>
            <div
                className='content-toggle-title-container'
                onClick={() => setIsToggleOpen(!isToggleOpen)}
            >
                <span className='content-toggle-title'>
                    {title}
                </span>
                <button
                    className='content-toggle-button'
                >
                    <svg
                        className={`content-toggle-arrow ${isToggleOpen ? "content-toggle-rotate" : ""}`}
                        xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none"
                    >
                        <path d="M5.64645 6.14645L0.853553 1.35355C0.538571 1.03857 0.761654 0.499999 1.20711 0.499999L10.7929 0.499999C11.2383 0.499999 11.4614 1.03857 11.1464 1.35355L6.35355 6.14645C6.15829 6.34171 5.84171 6.34171 5.64645 6.14645Z" fill="#A8A8A8" stroke="#A8A8A8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
            {
                isToggleOpen &&
                children
            }
        </>
    );
};

export default TitleAndContentToggle;