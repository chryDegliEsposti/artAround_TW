import React, { useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';

function SearchBar({ onSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length < 2) {
            setResults([]);
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/museums?q=${val}`);
            const data = await res.json();
            setResults(data.museums || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelect = (museum) => {
        setQuery(museum.title);
        setResults([]);
        onSelect(museum);
    }

    return (
        <div style={{ position: 'absolute', top: 20, left: 60, zIndex: 1000, width: '300px' }}>
            <Form.Control
                type="text"
                placeholder="Cerca museo..."
                value={query}
                onChange={handleSearch}
                style={{
                    borderRadius: '20px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none'
                }}
            />
            {results.length > 0 && (
                <ListGroup style={{ marginTop: '5px', maxHeight: '300px', overflowY: 'auto', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {results.map(m => (
                        <ListGroup.Item key={m._id} action onClick={() => handleSelect(m)} style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                            <div style={{ fontWeight: 'bold' }}>{m.title}</div>
                            <small className="text-muted">{m.city}, {m.address}</small>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
}

export default SearchBar;
