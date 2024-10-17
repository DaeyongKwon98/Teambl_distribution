import React from 'react';
import "../styles/ConfirmPopUp.css"

/**
 * Re-usable confirmation modal(popup).
 * 
 * @param {boolean} isOpen
 * @param {function} setIsOpen
 * @param {string} message
 * @param {function} onConfirm callback function when the user confrims.
 * @param {function} onReject callback function when the user rejects.
 * @param {string} confirmLabel confirm button text
 * @param {string} rejectLabel reject button text
 */
const ConfirmPopUp = ({ isOpen, setIsOpen, message, onConfirm, onReject, confirmLabel, rejectLabel }) => {

    if (isOpen) {
        return (
            <div
                className='confirmPopUp-overlay'
                onClick={() => setIsOpen(false)}
            >
                <div
                    className='confirmPopUp-content-container'
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >   
                    {/** confirmation message */}
                    <div className='confirmPopUp-message-container'>
                        <span className='confirmPopUp-message'>
                            {message}
                        </span>
                    </div>
                    {/** buttons */}
                    <div className='confirmPopUp-button-container'>
                        <button
                            className='confirmPopUp-button button-reject'
                            onClick={onReject}
                        >
                            {rejectLabel}
                        </button>
                        <button
                            className='confirmPopUp-button button-confirm'
                            onClick={onConfirm}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        );
    } else {
        return (<></>);
    }
};

export default ConfirmPopUp;