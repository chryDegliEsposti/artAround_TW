import { useState } from 'react';
import { Search, X } from 'lucide-react';
import './searchBar.css';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className="search-bar-container slide-up">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search museums..."
          value={query}
          onChange={handleChange}
          className="search-input"
        />
        {query && (
          <button className="clear-button" onClick={handleClear} aria-label="Clear search">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;