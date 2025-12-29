import React, { useState } from 'react';
import TopMenu from './components/TopMenu';
import CameraButton from './components/CameraButton';
import NavigatorHome from './pages/NavigatorHome';

function App() {
    const [showMenu, setShowMenu] = useState(false);

    const handleShowMenu = () => setShowMenu(true);
    const handleCloseMenu = () => setShowMenu(false);

    // Future: Router logic here. For now, simple view.
    return (
        <div className="app-container">
            <TopMenu show={showMenu} handleClose={handleCloseMenu} handleShow={handleShowMenu} />

            <NavigatorHome />

            <CameraButton />
        </div>
    );
}

export default App;
