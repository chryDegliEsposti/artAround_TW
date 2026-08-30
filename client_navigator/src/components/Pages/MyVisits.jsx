import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Play, Eye, Calendar, Clock, MapPin } from 'lucide-react';
import './MyVisits.css';



function VisitCard({ visit, isUpcoming }) {
  const navigate = useNavigate();

  const handleStartVisit = () => {
    navigate('/tour', { state: { visitId: visit.id, museum: visit.museum } });
  };

  const handleOverview = () => {
    navigate('/overview', { state: { visitId: visit.id, museum: visit.museum } });
  };

  const openGoogleMaps = () => {
    const lat = visit.lat || 44.4975;
    const lng = visit.lng || 11.3533;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="visit-card slide-up">
      <div className="visit-card-image" style={{ backgroundImage: `url(${visit.image})` }}>
        <div className="visit-badge">{visit.type}</div>
      </div>
      <div className="visit-card-content">
        <h3>{visit.museum}</h3>
        <div className="visit-details">
          <span><Calendar size={14} /> {visit.date}</span>
          <span><Clock size={14} /> {visit.time}</span>
        </div>

        {isUpcoming ? (
          <div className="visit-actions">
            <button className="btn btn-secondary action-btn" onClick={openGoogleMaps} title="Bring me there">
              <Navigation size={18} />
            </button>
            <button className="btn btn-secondary action-btn" title="Overview" onClick={handleOverview}>
              <Eye size={18} />
            </button>
            <button className="btn btn-primary start-btn" onClick={handleStartVisit}>
              <Play size={18} fill="currentColor" /> Start Visit
            </button>
          </div>
        ) : (
          <div className="visit-actions past-actions">
            <button className="btn btn-secondary action-btn full-width" title="Overview" onClick={handleOverview}>
              <Eye size={18} /> View Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyVisits() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [pastVisits, setPastVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('apiToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const upResponse = await fetch('/api/v1/navigator/visits/get/upcomingVisits', { headers });
        const upData = await upResponse.json();
        if (Array.isArray(upData)) setUpcomingVisits(upData);

        const pastResponse = await fetch('/api/v1/navigator/visits/get/pastVisits', { headers });
        const pastData = await pastResponse.json();
        if (Array.isArray(pastData)) setPastVisits(pastData);
      } catch (error) {
        console.error('Error fetching visits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  return (
    <div className="my-visits-container fade-in">
      <div className="visits-header">
        <h2>My Visits</h2>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>
      </div>

      <div className="visits-list">
        {loading ? (
          <div className="empty-state">Loading visits...</div>
        ) : activeTab === 'upcoming' ? (
          upcomingVisits.length > 0 ? (
            upcomingVisits.map(visit => <VisitCard key={visit.id} visit={visit} isUpcoming={true} />)
          ) : (
            <div className="empty-state">No upcoming visits. Time to book one!</div>
          )
        ) : (
          pastVisits.length > 0 ? (
            pastVisits.map(visit => <VisitCard key={visit.id} visit={visit} isUpcoming={false} />)
          ) : (
            <div className="empty-state">No past visits found.</div>
          )
        )}
      </div>
    </div>
  );
}
