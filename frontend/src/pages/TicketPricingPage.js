import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:4060';
function getAuthHeader() { return { Authorization: `Bearer ${localStorage.getItem('token')}` }; }

export default function TicketPricingPage() {
  const [showId, setShowId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = showId ? { show_id: parseInt(showId) } : {};
      const res = await axios.post(`${API_URL}/api/ai/ticket-pricing`, payload, { headers: getAuthHeader() });
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Pricing analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`;
  const priceDiff = (current, recommended) => {
    const diff = parseFloat(recommended || 0) - parseFloat(current || 0);
    const pct = current > 0 ? ((diff / current) * 100).toFixed(0) : 0;
    return { diff, pct, up: diff > 0 };
  };

  return (
    <div className="app-container">
      <Navbar title="Dynamic Ticket Pricing" />
      <div className="content-area">
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-icon">🎫</span>
            <div>
              <h1>AI Dynamic Ticket Pricing</h1>
              <p>AI-powered pricing recommendations to maximize revenue on unsold blocks</p>
            </div>
          </div>
          <span className="ai-badge-large">AI Powered</span>
        </div>

        <div className="panel-card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>Configure Analysis</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Show ID (optional — leave blank for all shows)</label>
              <input type="number" value={showId} onChange={e => setShowId(e.target.value)} placeholder="e.g., 1" />
            </div>
            <button className="btn btn-gold" onClick={analyze} disabled={loading}>
              {loading ? <span className="btn-loading"><span className="spinner-small"></span>Analyzing...</span> : 'Analyze Pricing'}
            </button>
          </div>
        </div>

        {error && <div className="ai-error"><p>{error}</p></div>}

        {loading && <div className="ai-loading"><div className="spinner"></div><h3>Analyzing ticket pricing data...</h3></div>}

        {result && !loading && (
          <>
            {result.overall_strategy && (
              <div className="panel-card" style={{ marginBottom: 16, borderLeft: '3px solid #b8860b' }}>
                <h3 style={{ marginBottom: 8 }}>Pricing Strategy</h3>
                <p style={{ color: '#ccc', fontSize: 14 }}>{result.overall_strategy}</p>
              </div>
            )}

            {result.pricing_recommendations && (
              <div className="panel-card">
                <h3 style={{ marginBottom: 16 }}>Pricing Recommendations</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #333' }}>
                        {['Tier', 'Current Price', 'Recommended', 'Change', 'Reasoning'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#888' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.pricing_recommendations.map((r, i) => {
                        const { diff, pct, up } = priceDiff(r.current_price, r.recommended_price);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.tier}</td>
                            <td style={{ padding: '10px 12px' }}>{fmt(r.current_price)}</td>
                            <td style={{ padding: '10px 12px', color: '#b8860b', fontWeight: 700 }}>{fmt(r.recommended_price)}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ color: up ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                {up ? '↑' : '↓'} {Math.abs(diff).toFixed(2)} ({pct}%)
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', color: '#888', fontSize: 12 }}>{r.reasoning}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {result.content && !result.pricing_recommendations && (
              <div className="panel-card">
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#ccc' }}>{result.content}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
