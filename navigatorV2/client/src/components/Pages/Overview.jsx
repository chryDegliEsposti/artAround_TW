import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Ticket,
    Accessibility,
    MapPin,
    Clock,
    Info,
    CheckCircle2,
    Gem,
    Palette,
    History,
    FlaskConical
} from 'lucide-react';
import './Overview.css';

const categories = [
    { name: "Fine Art", icon: <Palette size={16} />, className: "tag-art" },
    { name: "History", icon: <History size={16} />, className: "tag-history" },
    { name: "Science", icon: <FlaskConical size={16} />, className: "tag-science" }
];

export default function Overview() {
    const location = useLocation();
    const { visitId, museum: museumName } = location.state || {};
    const [museumData, setMuseumData] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchMuseum = async () => {
            setLoading(true);
            try {
                const idToFetch = visitId || 1;
                const museumResponse = await fetch(`/api/museums/get/1${idToFetch}`);

                if (museumResponse.ok) {
                    const data = await museumResponse.json();
                    const museum = Array.isArray(data) ? data[0] : data;

                    setMuseumData({
                        ...museum,
                        categories: museum.categories,
                        accessibility: museum.accessibility,
                        price: museum.price,
                        hours: museum.hours,
                        address: museum.address
                    });
                }
            } catch (error) {
                console.error('Error fetching museum:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMuseum();
    }, [visitId]);

    if (loading) {
        return (
            <div className="overview-container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loading-spinner">Loading Museum Details...</div>
            </div>
        );
    }

    const museum = museumData;

    return (
        <div className="overview-container fade-in">
            <div className="overview-hero">
                <img src={museum.image} alt={museum.name} />
                <div className="overview-hero-overlay">
                    <h1>{museum.name}</h1>
                    <div className="category-tags">
                        {categories.map((cat, i) => (
                            <span key={i} className={`category-tag ${cat.className}`}>
                                {cat.icon} {cat.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overview-content">
                <div className="info-grid">
                    <div className="info-card slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="info-icon-wrapper">
                            <Ticket size={24} />
                        </div>
                        <div className="info-text">
                            <h4>Entry Price</h4>
                            <p>{museum.price}</p>
                        </div>
                    </div>

                    <div className="info-card slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="info-icon-wrapper">
                            <Clock size={24} />
                        </div>
                        <div className="info-text">
                            <h4>Opening Hours</h4>
                            <p>{museum.hours}</p>
                        </div>
                    </div>

                    <div className="info-card slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="info-icon-wrapper">
                            <MapPin size={24} />
                        </div>
                        <div className="info-text">
                            <h4>Location</h4>
                            <p title={museum.address}>{museum.address.split(',')[0]}...</p>
                        </div>
                    </div>
                </div>

                <div className="description-section slide-up" style={{ animationDelay: '0.4s' }}>
                    <h3><Info size={24} className="check-icon" /> About the Museum</h3>
                    <p>{museum.description}</p>
                </div>

                <div className="accessibility-section slide-up" style={{ animationDelay: '0.5s' }}>
                    <h3><Accessibility size={24} style={{ color: '#10b981' }} /> Accessibility & Safety</h3>
                    <p>We are focused on providing an inclusive experience for all visitors.</p>
                    <ul className="accessibility-list">
                        {museum.accessibility.map((item, i) => (
                            <li key={i} className="accessibility-item">
                                <CheckCircle2 size={18} className="check-icon" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Gem size={20} /> Purchase Tickets
                </button>
            </div>
        </div>
    );
}
