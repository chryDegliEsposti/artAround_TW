import { useState, useEffect } from 'react';
import './Account.css';

export default function Account() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Payment state
  const [cardNumber, setCardNumber] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardExp, setCardExp] = useState('');

  const token = localStorage.getItem('apiToken');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!token) return setLoading(false);
      const res = await fetch('/api/v1/navigator/account/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setCardNumber(data.user.payment_card_number || '');
        setCardCvv(data.user.payment_card_cvv || '');
        if (data.user.payment_card_exp) {
          const date = new Date(data.user.payment_card_exp);
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          setCardExp(`${date.getFullYear()}-${month}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/navigator/account/update-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: data.message });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setFeedback({ type: 'error', text: data.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Errore di connessione' });
    }
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/navigator/account/update-payment', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          payment_card_number: cardNumber, 
          payment_card_cvv: cardCvv, 
          payment_card_exp: cardExp ? new Date(cardExp + '-01').toISOString() : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', text: data.message });
        fetchProfile(); // refresh to get updated data
      } else {
        setFeedback({ type: 'error', text: data.message });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Errore di connessione' });
    }
  };

  if (!token) {
    return (
      <div className="account-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: "center" }}><h2>Effettua il login per gestire il tuo account.</h2><button className="account-btn" onClick={() => window.location.href = `/marketplace/login?redirect=${encodeURIComponent(window.location.href)}`} style={{ marginTop: "20px" }}>Vai al Login</button></div>
      </div>
    );
  }

  if (loading) {
    return <div className="account-container">Caricamento in corso...</div>;
  }

  return (
    <div className="account-container fade-in">
      <div className="account-header">
        <h2>Il mio Account</h2>
        <div className="account-tabs">
          <button className={`account-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => {setActiveTab('profile'); setFeedback(null);}}>Profilo</button>
          <button className={`account-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => {setActiveTab('security'); setFeedback(null);}}>Sicurezza</button>
          <button className={`account-tab ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => {setActiveTab('payment'); setFeedback(null);}}>Pagamenti</button>
          <button className={`account-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => {setActiveTab('history'); setFeedback(null);}}>Storico Acquisti</button>
        </div>
      </div>

      <div className="account-content">
        {feedback && (
          <div className={`feedback-message ${feedback.type}`}>
            {feedback.text}
          </div>
        )}

        {activeTab === 'profile' && user && (
          <div className="profile-section">
            <div className="account-group">
              <label>Nome Utente</label>
              <input type="text" value={user.username} readOnly disabled />
            </div>
            <div className="account-group">
              <label>Email</label>
              <input type="email" value={user.email} readOnly disabled />
            </div>
            <div className="account-group">
              <label>Ruolo Account</label>
              <input type="text" value={user.role.toUpperCase()} readOnly disabled />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePasswordUpdate}>
            <div className="account-group">
              <label>Password Corrente</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="account-group">
              <label>Nuova Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="account-btn">Aggiorna Password</button>
          </form>
        )}

        {activeTab === 'payment' && (
          <form onSubmit={handlePaymentUpdate}>
            <div className="account-group">
              <label>Numero Carta</label>
              <input type="text" placeholder="**** **** **** ****" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="account-group" style={{ flex: 1 }}>
                <label>Scadenza (MM/AAAA)</label>
                <input type="month" value={cardExp} onChange={e => setCardExp(e.target.value)} />
              </div>
              <div className="account-group" style={{ flex: 1 }}>
                <label>CVV</label>
                <input type="text" placeholder="123" maxLength="4" value={cardCvv} onChange={e => setCardCvv(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="account-btn">Salva Dati Pagamento</button>
          </form>
        )}

        {activeTab === 'history' && user && (
          <div className="history-list">
            {user.purchasedVisits?.length === 0 && user.purchasedItems?.length === 0 && (
              <p style={{ color: '#a1a1aa' }}>Nessun acquisto trovato.</p>
            )}

            {user.purchasedVisits?.map(v => (
              <div key={v._id} className="history-item">
                <div className="history-info">
                  <h4>{v.title}</h4>
                  <p>Tour Guidato (Visita)</p>
                </div>
                <div className="history-badge">Acquistato</div>
              </div>
            ))}

            {user.purchasedItems?.map(item => (
              <div key={item._id} className="history-item">
                <div className="history-info">
                  <h4>{item.name}</h4>
                  <p>Opera Digitale ({item.price || 0}€)</p>
                </div>
                <div className="history-badge">Acquistato</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
