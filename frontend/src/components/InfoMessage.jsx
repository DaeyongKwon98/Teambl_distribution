import React from 'react';
import "../styles/InfoMessage.css"

/**
 * 
 * A small information message.
 * 
 * @param {type} string
 * @param {message} string
 * 
 */
const InfoMessage = ({ type, message }) => {

    const validInfoStatus = ["good", "bad"];

    if (validInfoStatus.includes(type)) {
        return (
            <div
                className='info-msg-container'
            >
                <svg
                    className='info-msg-icon'
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                >
                    <circle
                        cx="6"
                        cy="6"
                        r="6"
                        fill={ (type === "good") ? "#42A513" : "#B80000" }
                    />
                    <path d="M5.48577 9.60015V4.44916H6.7V9.60015H5.48577ZM6.10237 3.71872C5.72292 3.71872 5.40039 3.42465 5.40039 3.05469C5.40039 2.69422 5.72292 2.40015 6.10237 2.40015C6.4913 2.40015 6.80434 2.69422 6.80434 3.05469C6.80434 3.42465 6.4913 3.71872 6.10237 3.71872Z" fill="white"/>
                </svg>
                <span className={`info-msg-text ${(type === "good") ? "info-msg-good" : "info-msg-bad" }`}>
                    {message}
                </span>
            </div>
        );
    }
};

export default InfoMessage;