import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Container, Navbar, Form, Button, Card, Row, Col } from 'react-bootstrap';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Fix per le icone di Leaflet in React
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import DetailsCard from '../components/DetailsCard';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow });
L.Marker.prototype.options.icon = DefaultIcon;

function NavigatorHome() {
    const position = [44.4949, 11.3426]; // Coordinate di esempio (Bologna)

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>


            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <DetailsCard />

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={position}>
                    <Popup>La tua posizione attuale</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default NavigatorHome;