import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:4060';

function getAuthHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export default function BoxOfficeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/dashboard/box-office`, { headers: getAuthHeader() });
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load box office data.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="app-container">
      <Navbar title="Box Office Dashboard" />
      <div className="content-area">
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-icon">🎭</span>
            <div>
              <h1>Box Office Dashboard</h1>
              <p>Revenue by show, ticket sales, and capacity analytics</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>Refresh</button>
        </div>

        {loading && <div className="loading-spinner"><div className="spinner"></div><p>Loading box office data...</p></div>}
        {error && <div className="ai-error"><p>{error}</p></div>}

        {data && (
          <>
            {/* Overall Stats */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Revenue', value: fmt(data.overall?.total_revenue), icon: '💰' },
                { label: 'Tickets Sold', value: data.overall?.total_tickets || 0, icon: '🎫' },
                { label: 'Avg Ticket Price', value: fmt(data.overall?.avg_price), icon: '💵' },
                { label: 'Paid Tickets', value: data.overall?.paid_tickets || 0, icon: '✅' },
              ].map((s, i) => (
                <div key={i} className="panel-card" style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#b8860b' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Revenue by Show */}
            <div className="panel-card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16 }}>Revenue by Show</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #333' }}>
                      {['Show', 'Status', 'Tickets Sold', 'Revenue', 'Avg Price', 'Opening Date'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#888' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data.shows || []).map((show, i) => {
                      const maxRev = Math.max(...(data.shows || []).map(s => parseFloat(s.total_revenue || 0)));
                      const pct = maxRev > 0 ? (parseFloat(show.total_revenue || 0) / maxRev * 100) : 0;
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{show.title}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 10, fontSize: 11,
                              background: show.status === 'Running' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
                              color: show.status === 'Running' ? '#22c55e' : '#888',
                            }}>{show.status}</span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>{show.tickets_sold}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 80, height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: '#b8860b', borderRadius: 3 }} />
                              </div>
                              <span style={{ color: '#b8860b', fontWeight: 600 }}>{fmt(show.total_revenue)}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>{fmt(show.avg_ticket_price)}</td>
                          <td style={{ padding: '10px 12px', color: '#888' }}>{show.opening_date ? new Date(show.opening_date).toLocaleDateString() : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ticket Types */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="panel-card">
                <h3 style={{ marginBottom: 16 }}>Sales by Ticket Type</h3>
                {(data.by_ticket_type || []).map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222' }}>
                    <span>{t.ticket_type || 'Unknown'}</span>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <span style={{ color: '#888' }}>{t.count} tickets</span>
                      <span style={{ color: '#b8860b', fontWeight: 600 }}>{fmt(t.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="panel-card">
                <h3 style={{ marginBottom: 16 }}>Recent Sales</h3>
                {(data.recent_sales || []).map((s, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #222' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>{s.customer_name}</span>
                      <span style={{ color: '#b8860b' }}>{fmt(s.price)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>{s.show_title} — {s.ticket_type}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
