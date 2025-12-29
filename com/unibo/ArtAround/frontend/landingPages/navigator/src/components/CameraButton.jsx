import React from 'react';
import { FaCamera } from 'react-icons/fa';

function CameraButton() {
    const handleClick = () => {
        // Placeholder for opening camera page
        alert("Questa funzione aprirà la fotocamera (in sviluppo)");
        // Logic to navigate to camera page will go here
    };

    return (
        <button className="fab-camera" onClick={handleClick}>
            <FaCamera size={24} />
        </button>
    );
}

export default CameraButton;
