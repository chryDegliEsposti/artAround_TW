import React from 'react';
import { Button, Offcanvas, Nav } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';

function TopMenu({ show, handleClose, handleShow }) {
    return (
        <>
            <Button variant="dark" className="menu-btn" onClick={handleShow}>
                <FaBars />
            </Button>

            <Offcanvas show={show} onHide={handleClose} className="text-bg-dark" placement="end">
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>ArtAround Navigator</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        <Nav.Link href="#" className="text-light">Home</Nav.Link>
                        <Nav.Link href="#" className="text-light">Le Mie Visite</Nav.Link>
                        <Nav.Link href="#" className="text-light">Impostazioni</Nav.Link>
                        <Nav.Link href="../../marcketplace/pages/home/home_user.html" className="text-light">Torna al Marketplace</Nav.Link>
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default TopMenu;
