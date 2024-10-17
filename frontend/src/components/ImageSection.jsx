import React, { useState } from "react";
import "../styles/NewProject/NewProject.css";

const ImageSection = ({ postImages = [] }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const totalWidth = e.target.scrollWidth;
        const visibleWidth = e.target.clientWidth;
        const index = Math.round((scrollLeft / (totalWidth - visibleWidth)) * (postImages.length - 1));
        setCurrentImageIndex(index);
    };

    return (
        <div className="project-image-section">
            {postImages.length > 0 && (
                <>
                    <div className="project-scrollable-image-container" onScroll={handleScroll}>
                        {postImages.map((image, index) => (
                            <img
                                key={index}
                                src={image.image}
                                alt={`Post ${index + 1}`}
                                className="project-post-img"
                            />
                        ))}
                    </div>
                    <div className="project-image-index">
                        {currentImageIndex + 1} / {postImages.length}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageSection;