
import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaClock, FaRoute, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function DetailsCard() {
    const navigatorData = {
        time: "15 min",
        distance: "4.2 km"
    }

    const [show, setShow] = useState(false);

    return (
        <Card className="details-card bg-dark text-white border-0 shadow-lg" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(33, 37, 41, 0.85)' }}>
            <Card.Body className="details-card-body p-3">

                {/* Info Section */}
                <div className="d-flex flex-column flex-grow-1">
                    <h6 className="text-uppercase text-secondary small mb-2" style={{ letterSpacing: '1px' }}>Dettagli Viaggio</h6>

                    <div className="d-flex align-items-center gap-4 mb-2">
                        <div className="d-flex align-items-center gap-2">
                            <FaClock className="text-primary" />
                            <span className="fw-bold fs-5">{navigatorData.time}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <FaRoute className="text-info" />
                            <span className="fw-bold fs-5">{navigatorData.distance}</span>
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="d-flex gap-2 justify-content-end mt-3 mt-md-0">
                    <Button variant="outline-light" className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                        <FaChevronLeft />
                    </Button>
                    <Button variant="primary" className="rounded-pill px-4 d-flex align-items-center gap-2">
                        Next <FaChevronRight />
                    </Button>
                </div>

            </Card.Body>
        </Card>
    );
}

export default DetailsCard;
