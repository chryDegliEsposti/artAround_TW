import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ExploreMuseum.css';

export default function ExploreMuseum() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [exploreData, setExploreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setLoading(true);
        const url = id ? `/api/v1/navigator/museums/exploreData?id=${id}` : '/api/v1/navigator/museums/exploreData';
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch explore data");
        const data = await response.json();
        setExploreData(data);
      } catch (err) {
        console.error("Failed to fetch explore data", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, [id]);

  const filters = ['ALL', 'RENAISSANCE', 'MODERNISM', 'SCULPTURE'];

  if (loading) {
    return <div style={{ padding: '2rem', color: 'white' }}>Loading museum data...</div>;
  }

  if (error || !exploreData) {
    return <div style={{ padding: '2rem', color: '#ff6b6b' }}>Error loading museum: {error}</div>;
  }

  return (
    <>
      <header className="explore-header-bar">
        <button className="action-circle-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="explore-logo">{exploreData.museumName}</h1>
        <button className="action-circle-btn">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </header>

      <main className="explore-container">
        {/* Search Section */}
        <section className="explore-search-section fade-in">
          <div className="search-input-wrapper">
            <span className="material-symbols-outlined search-icon-left">search</span>
            <input 
              className="search-input" 
              placeholder="Search artists, eras, or wings..." 
              type="text" 
            />
          </div>
          <div className="filter-chips no-scrollbar">
            {filters.map(filter => (
              <button 
                key={filter}
                className={`chip-btn ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Masterpieces */}
        <section className="fade-in">
          <div className="section-title-row">
            <h2 className="section-title">Masterpieces</h2>
            <span className="section-link">SEE ALL</span>
          </div>
          <div className="masterpiece-grid">
            {exploreData.masterpieces && exploreData.masterpieces.length > 0 ? (
              exploreData.masterpieces.map((masterpiece, index) => {
                if (index === 0) {
                  return (
                    <div key={masterpiece.id} className="masterpiece-card-primary" onClick={() => navigate('/tour')}>
                      <img 
                        className="masterpiece-img" 
                        src={masterpiece.image} 
                        alt={masterpiece.title} 
                      />
                      <div className="masterpiece-gradient"></div>
                      <div className="masterpiece-content">
                        <p className="content-label">CURATOR'S CHOICE</p>
                        <h3 className="content-title">{masterpiece.title}</h3>
                        <p className="content-subtitle">{masterpiece.artist}</p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={masterpiece.id} className="masterpiece-card-secondary" onClick={() => navigate('/tour')}>
                      <img 
                        className="masterpiece-img" 
                        src={masterpiece.image} 
                        alt={masterpiece.title} 
                      />
                      <div className="masterpiece-content">
                        <h3 className="content-title" style={{fontSize: '1.25rem'}}>{masterpiece.title}</h3>
                        <p className="content-subtitle" style={{marginTop: '0.25rem', fontSize: '0.75rem', fontStyle: 'normal'}}>{masterpiece.artist}</p>
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              <p style={{ color: '#aaa', fontStyle: 'italic' }}>No masterpieces found for this museum.</p>
            )}
          </div>
        </section>

        {/* Current Exhibitions */}
        <section className="fade-in">
          <h2 className="section-title" style={{marginBottom: '2rem'}}>Current Exhibitions</h2>
          <div className="exhibitions-list">
            {exploreData.exhibitions && exploreData.exhibitions.length > 0 ? (
              exploreData.exhibitions.map((exhibition, index) => (
                <div key={index} className={`exhibition-item ${index % 2 !== 0 ? 'reversed' : ''}`}>
                  <div className="exhibition-img-wrapper">
                    <img 
                      className="exhibition-img" 
                      src={exhibition.image} 
                      alt={exhibition.title} 
                    />
                  </div>
                  <div className="exhibition-text-wrapper">
                    <p className="content-label">{exhibition.period}</p>
                    <h3 className={`exhibition-title ${index % 2 !== 0 ? 'exhibition-title-light' : ''}`}>{exhibition.title}</h3>
                    <p className="exhibition-desc">An immersive journey through the collection.</p>
                    <button className={`exhibition-btn ${index % 2 !== 0 ? 'exhibition-btn-secondary' : 'exhibition-btn-primary'}`}>
                      {index % 2 !== 0 ? 'EXPLORE' : 'BOOK ENTRY'}
                    </button>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </section>

        {/* Facilities */}
        <section className="fade-in">
          <h2 className="section-title" style={{marginBottom: '1.5rem'}}>Facilities</h2>
          <div className="facilities-grid">
            {exploreData.facilities && exploreData.facilities.length > 0 ? (
              exploreData.facilities.map((facility, index) => (
                <div key={index} className="facility-card">
                  <div className="facility-icon">
                    <span className="material-symbols-outlined">{facility.icon}</span>
                  </div>
                  <div>
                    <h4 className="facility-title">{facility.name}</h4>
                    <p className="facility-desc">{facility.desc}</p>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
