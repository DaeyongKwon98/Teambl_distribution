import React from 'react';
import "../styles/PolicyView.css";

const POLICY_LINKS = {
    PRIVACY : "https://www.notion.so/Personal-Information-Terms-da10ebf1ada6470780d6ba9ab260916b",
    SERVICE : "https://www.notion.so/Service-Terms-and-Condition-5379c333ce1543c895dc0cebe39f4844"
};

const PolicyView = () => {
    return (
        <div className='policy-view-container'>
            <div className='policy-link-container'>
                <a
                    href={POLICY_LINKS.PRIVACY}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {"팀블 개인정보 방침"}
                </a>
            </div>
            <div className='policy-link-container policy-view-with-mt-8'>
                <a
                    href={POLICY_LINKS.SERVICE}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {"팀블 서비스 약관"}
                </a>
            </div>
        </div>
    );
};

export default PolicyView;