import React from 'react';
import "../styles/InnerNavBar.css";

const InnerNavBar = ({ titleList, labelKey, dataKey, currentSelectedItem, onSelectItem }) => {

    return (
        <div className='inner-nav-bar-container'>
            {
                titleList.map((titleInfo) => {
                    return (
                        <div
                            key={titleInfo[dataKey]}
                            className={
                                "inner-nav-bar-item"
                                + ((titleInfo[dataKey] === currentSelectedItem) ? " nav-item-selected" : "")
                            }
                            onClick={async () => await onSelectItem(titleInfo[dataKey])}
                        >
                            {titleInfo[labelKey]}
                        </div>
                    );
                })
            }
        </div>
    );
};

export default InnerNavBar;