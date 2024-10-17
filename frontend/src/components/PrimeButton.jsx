import React from 'react';
import "../styles/PrimeButton.css";

/**
 * 
 * Re-usable button component with loading spinner
 * 
 */
const PrimeButton = ({ text, onClickCallback, isActive, isLoading, styleOv }) => {

    return (
        <button
            className={`prime-button${isActive ? "" : " prime-btn-disabled"}`}
            onClick={async () => await onClickCallback()}
            style={
                styleOv ?
                    styleOv
                    :
                    {}
            }
        >
            {
                isLoading ?
                    <div
                        className="prime-btn-loader"
                        style={{
                            display: 'inline-block'
                        }}
                    />
                    :
                    <>
                        {text}
                    </>
            }
        </button>
    );
};

export default PrimeButton;