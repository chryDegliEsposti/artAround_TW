import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExploreMuseum.css';

export default function ExploreMuseum() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Dummy fetch function for future use
  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        const response = await fetch('/api/v1/navigator/museums/exploreData');
        const data = await response.json();
        console.log("Fetched explore data:", data);
      } catch (err) {
        console.error("Failed to fetch explore data", err);
      }
    };
    fetchExploreData();
  }, []);

  const filters = ['ALL', 'RENAISSANCE', 'MODERNISM', 'SCULPTURE'];

  return (
    <>
      <header className="explore-header-bar">
        <button className="action-circle-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="explore-logo">Digital Curator</h1>
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
            <div className="masterpiece-card-primary" onClick={() => navigate('/tour')}>
              <img 
                className="masterpiece-img" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUxQv8mVSFBgf--6t-_qcMvr_HQ3PVajOfjKR1KjJqrcaHCmf25iqGk-Pycc076Yv8SUPOEokCL2-UW1MUjh9IVEk2zJfcNNLltXEpqDHW4LRvcXG3FxyBnGdMkyBVjHdxLbLJPYnqOhnouTDoONEQmgBrZ6Dnvr5Q1JXLYNUYWKr1mhygb1Cpsx5MxJz86dhso2ZmktVx1CN9EzYspJJhhNZR4M9DtMuOeG8DxCscoRu5Ex0yE2fL_0kLKhEmaxl6kStZ8ISADX4" 
                alt="The Starry Night" 
              />
              <div className="masterpiece-gradient"></div>
              <div className="masterpiece-content">
                <p className="content-label">CURATOR'S CHOICE</p>
                <h3 className="content-title">The Starry Night</h3>
                <p className="content-subtitle">Vincent van Gogh, 1889</p>
              </div>
            </div>
            
            <div className="masterpiece-card-secondary" onClick={() => navigate('/tour')}>
              <img 
                className="masterpiece-img" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnvLFa_qZrVZ02AcaU8gvUFA-hCZxo1WowX8jbJJbO14d1Qr_Fw4R0C7ZiTCwKNMsHAYaAR6_zhzDlLE1H_DWd3buvmuYSeYnRSViVINZ_xHhxs7boXg2WS5rJJFQcNxCK6ekfKlgR8WdjhP4tfKGIs6g_lj2_MYMbg7UT92mUtk4qEL3qNoqoj5tW1ZQmA1G9YjaMl0q04PBS23CkMv3-AIkekHSqD5CgjSYmHkVknXhgYMpxktu6zHrIB3nKMndkWTKsbb9bX8M" 
                alt="David" 
              />
              <div className="masterpiece-content">
                <h3 className="content-title" style={{fontSize: '1.25rem'}}>David</h3>
                <p className="content-subtitle" style={{marginTop: '0.25rem', fontSize: '0.75rem', fontStyle: 'normal'}}>Michelangelo, 1504</p>
              </div>
            </div>
          </div>
        </section>

        {/* Current Exhibitions */}
        <section className="fade-in">
          <h2 className="section-title" style={{marginBottom: '2rem'}}>Current Exhibitions</h2>
          <div className="exhibitions-list">
            
            <div className="exhibition-item">
              <div className="exhibition-img-wrapper">
                <img 
                  className="exhibition-img" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDH9J-XnvOhIcIlTWU7OpVJj7drU0sIGAqS7EGiitxAE8PdOpG9b_g8o_2u3t1DcM-N4nw3fz0GJPZXlscn7i49nCob36ZOfVWD1ndzOht8-Im99lCMTsVEgmXIkc_VuIQqWgQ0RuITDa0HZ3TPJmXsIXHnB_VWO3m5g6-Tk5j792xMNdsr15V1Ori5ItIqBmNCrd0QBKMU3z9Me50WxKiYmQ1mYiDPJZqKWaAUkVek4knZWVVd3iPfOG2wQzX9rCEFcz0afvFxeao" 
                  alt="Cybernetic Dreams" 
                />
              </div>
              <div className="exhibition-text-wrapper">
                <p className="content-label">GALLERY 402 • ENDS NOV 12</p>
                <h3 className="exhibition-title">Cybernetic Dreams</h3>
                <p className="exhibition-desc">An immersive journey through digital landscapes and reactive data visualizations.</p>
                <button className="exhibition-btn exhibition-btn-primary">BOOK ENTRY</button>
              </div>
            </div>

            <div className="exhibition-item reversed">
              <div className="exhibition-img-wrapper">
                <img 
                  className="exhibition-img" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNE3_l4t6hTXx0j1g9vRDFQIwWyv-GsFiitlSN8jGz-3pJjkp6U-nYU4ttqj9XZNK4_VV8-SOJpZZSM8m7CCZml88FI9HEnV0jepkt85-BujlAYBsYa43TN9wxx8fUghPA7dJdFxGRdvdJ6ANb5OidVXZQSVcFbTOjFXUG-ilj0BKdO0CIkzrz1BSJFRr0-65JAiAVt1YAwuqL73qiIvP0Q_QkYPETrXvtyVkytINuvpz0-L2-75hwNARPTsVgl81nAl6Z03xwoO0" 
                  alt="Echoes of the Nile" 
                />
              </div>
              <div className="exhibition-text-wrapper">
                <p className="content-label">THE GREAT HALL • PERMANENT</p>
                <h3 className="exhibition-title exhibition-title-light">Echoes of the Nile</h3>
                <p className="exhibition-desc">Discover the mysteries of ancient civilizations through sacred artifacts and funerary art.</p>
                <button className="exhibition-btn exhibition-btn-secondary">EXPLORE COLLECTION</button>
              </div>
            </div>

          </div>
        </section>

        {/* Facilities */}
        <section className="fade-in">
          <h2 className="section-title" style={{marginBottom: '1.5rem'}}>Facilities</h2>
          <div className="facilities-grid">
            
            <div className="facility-card">
              <div className="facility-icon">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <div>
                <h4 className="facility-title">The Brasserie</h4>
                <p className="facility-desc">Level 2, North Wing</p>
              </div>
            </div>

            <div className="facility-card">
              <div className="facility-icon">
                <span className="material-symbols-outlined">coffee</span>
              </div>
              <div>
                <h4 className="facility-title">Vault Café</h4>
                <p className="facility-desc">Entrance Lobby</p>
              </div>
            </div>

            <div className="facility-card">
              <div className="facility-icon">
                <span className="material-symbols-outlined">wc</span>
              </div>
              <div>
                <h4 className="facility-title">Restrooms</h4>
                <p className="facility-desc">All Levels</p>
              </div>
            </div>

            <div className="facility-card">
              <div className="facility-icon">
                <span className="material-symbols-outlined">shopping_bag</span>
              </div>
              <div>
                <h4 className="facility-title">Museum Shop</h4>
                <p className="facility-desc">Level 1, Exit</p>
              </div>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}
