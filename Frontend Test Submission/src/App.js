import React, { useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3001'; // Make sure this matches your backend port

function App() {
  const [activeTab, setActiveTab] = useState('shorten');
  const [urls, setUrls] = useState([{ id: 1, url: '', shortcode: '', validity: '' }]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState([]);

  // Add URL form
  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, { id: Date.now(), url: '', shortcode: '', validity: '' }]);
    }
  };

  // Remove URL form
  const removeUrl = (id) => {
    setUrls(urls.filter(u => u.id !== id));
  };

  // Update URL data
  const updateUrl = (id, field, value) => {
    setUrls(urls.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  // Shorten URLs
  const shortenUrls = async () => {
    setResults([]);
    
    for (const urlData of urls) {
      if (!urlData.url) continue;
      
      try {
        const response = await fetch(`${API_BASE}/shorturls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: urlData.url,
            shortcode: urlData.shortcode || undefined,
            validity: urlData.validity ? parseInt(urlData.validity) : 30
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          setResults(prev => [...prev, {
            id: urlData.id,
            success: true,
            original: urlData.url,
            short: result.shortLink,
            expiry: result.expiry
          }]);
        } else {
          setResults(prev => [...prev, {
            id: urlData.id,
            success: false,
            original: urlData.url,
            error: result.error
          }]);
        }
      } catch (error) {
        setResults(prev => [...prev, {
          id: urlData.id,
          success: false,
          original: urlData.url,
          error: error.message
        }]);
      }
    }
  };

  // Load statistics
  const loadStats = async () => {
    const shortcodes = results.filter(r => r.success).map(r => r.short.split('/').pop());
    const statsData = [];
    
    for (const shortcode of shortcodes) {
      try {
        const response = await fetch(`${API_BASE}/shorturls/${shortcode}`);
        const data = await response.json();
        if (response.ok) statsData.push(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    }
    
    setStats(statsData);
  };

  return (
    <div className="app">
      <h1>URL Shortener</h1>
      
      {/* Navigation */}
      <div className="nav">
        <button 
          className={activeTab === 'shorten' ? 'active' : ''}
          onClick={() => setActiveTab('shorten')}
        >
          Shorten URLs
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => { setActiveTab('stats'); loadStats(); }}
        >
          Statistics
        </button>
      </div>

      {/* Shorten URLs Tab */}
      {activeTab === 'shorten' && (
        <div>
          <h2>Create Short URLs (Up to 5)</h2>
          
          {urls.map((urlData, index) => (
            <div key={urlData.id} className="url-form">
              <h3>URL {index + 1}</h3>
              {urls.length > 1 && (
                <button className="remove-btn" onClick={() => removeUrl(urlData.id)}>×</button>
              )}
              
              <div className="form-row">
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={urlData.url}
                  onChange={(e) => updateUrl(urlData.id, 'url', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Custom shortcode (optional)"
                  value={urlData.shortcode}
                  onChange={(e) => updateUrl(urlData.id, 'shortcode', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Validity (minutes)"
                  value={urlData.validity}
                  onChange={(e) => updateUrl(urlData.id, 'validity', e.target.value)}
                />
              </div>
            </div>
          ))}
          
          <div className="controls">
            <button onClick={addUrl} disabled={urls.length >= 5}>Add URL (+)</button>
            <button onClick={shortenUrls}>Shorten All URLs</button>
          </div>
          
          {/* Results */}
          {results.map(result => (
            <div key={result.id} className={`result ${result.success ? 'success' : 'error'}`}>
              <p><strong>Original:</strong> {result.original}</p>
              {result.success ? (
                <>
                  <p><strong>Short Link:</strong> <a href={result.short} target="_blank" rel="noopener noreferrer">{result.short}</a></p>
                  <p><strong>Expires:</strong> {new Date(result.expiry).toLocaleString()}</p>
                </>
              ) : (
                <p><strong>Error:</strong> {result.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div>
          <h2>URL Statistics</h2>
          <button onClick={loadStats}>Refresh Stats</button>
          
          {stats.length === 0 ? (
            <p>No statistics available. Create some URLs first!</p>
          ) : (
            stats.map(stat => (
              <div key={stat.shortcode} className="stats-card">
                <h3>{stat.shortcode}</h3>
                <p><strong>Original:</strong> <a href={stat.originalUrl} target="_blank" rel="noopener noreferrer">{stat.originalUrl}</a></p>
                <p><strong>Created:</strong> {new Date(stat.createdAt).toLocaleString()}</p>
                <p><strong>Expires:</strong> {new Date(stat.expiryDate).toLocaleString()}</p>
                <p><strong>Total Clicks:</strong> {stat.totalClicks}</p>
                
                {stat.clickHistory.length > 0 && (
                  <div>
                    <h4>Click History:</h4>
                    {stat.clickHistory.map((click, i) => (
                      <p key={i}>{new Date(click.timestamp).toLocaleString()} - {click.referrer}</p>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;
