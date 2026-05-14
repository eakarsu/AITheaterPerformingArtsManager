import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:4000';
function getAuthHeader() { return { Authorization: `Bearer ${localStorage.getItem('token')}` }; }

const SEGMENT_COLORS = {
  LYBUNT: '#f59e0b',
  SYBUNT: '#ef4444',
  current_year: '#22c55e',
  major: '#8b5cf6',
  unknown: '#6b7280',
};

export default function DonorStewardship() {
  const [segments, setSegments] = useState(null);
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [outreach, setOutreach] = useState(null);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSegments();
    fetchDonors();
  }, []);

  const fetchSegments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/donors/segments`, { headers: getAuthHeader() });
      setSegments(res.data.data);
    } catch (_) {}
    setLoading(false);
  };

  const fetchDonors = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/donors?limit=50`, { headers: getAuthHeader() });
      setDonors(res.data.data || []);
    } catch (_) {}
  };

  const generateOutreach = async (donorId) => {
    setOutreachLoading(true);
    setOutreach(null);
    try {
      const res = await axios.post(`${API_URL}/api/ai/donor-outreach/${donorId}`, {}, { headers: getAuthHeader() });
      setOutreach(res.data.result);
    } catch (err) {
      setOutreach({ error: err.response?.data?.error || 'Failed to generate outreach.' });
    } finally {
      setOutreachLoading(false);
    }
  };

  const fmt = (n) => `$${parseFloat(n || 0).toLocaleString()}`;

  return (
    <div className="app-container">
      <Navbar title="Donor Stewardship" />
      <div className="content-area">
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-icon">💰</span>
            <div>
              <h1>Donor Stewardship</h1>
              <p>LYBUNT/SYBUNT segmentation with AI-powered outreach generation</p>
            </div>
          </div>
          <span className="ai-badge-large">AI Powered</span>
        </div>

        {loading && <div className="ai-loading"><div className="spinner"></div></div>}

        {segments && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {(segments.segments || []).map((seg, i) => (
              <div key={i} className="panel-card" style={{ borderTop: `3px solid ${SEGMENT_COLORS[seg.segment] || '#888'}`, padding: 16 }}>
                <div style={{ fontSize: 12, color: SEGMENT_COLORS[seg.segment] || '#888', fontWeight: 700, marginBottom: 4 }}>
                  {seg.segment?.toUpperCase()}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{seg.count} donors</div>
                <div style={{ fontSize: 13, color: '#b8860b', marginTop: 4 }}>{fmt(seg.total_donations)} total</div>
                <div style={{ fontSize: 11, color: '#888' }}>Avg: {fmt(seg.avg_donation)}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Donor List */}
          <div className="panel-card">
            <h3 style={{ marginBottom: 12 }}>Donors — Click for AI Outreach</h3>
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {donors.map((d, i) => (
                <div
                  key={i}
                  onClick={() => { setSelectedDonor(d); generateOutreach(d.id); }}
                  style={{
                    padding: '10px 12px', borderBottom: '1px solid #222', cursor: 'pointer',
                    background: selectedDonor?.id === d.id ? 'rgba(184,134,11,0.1)' : 'transparent',
                    borderLeft: selectedDonor?.id === d.id ? '3px solid #b8860b' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{d.name}</span>
                    <span style={{ color: '#b8860b' }}>{fmt(d.donation_amount)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    {d.email} · {d.recognition_level} · {d.campaign}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Outreach Panel */}
          <div className="panel-card">
            <h3 style={{ marginBottom: 12 }}>AI Outreach Draft</h3>
            {!selectedDonor && (
              <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>
                Select a donor to generate personalized AI outreach
              </div>
            )}
            {outreachLoading && (
              <div className="ai-loading"><div className="spinner"></div><p>Generating outreach...</p></div>
            )}
            {outreach && !outreachLoading && (
              <div>
                {outreach.error ? (
                  <div style={{ color: '#ef4444' }}>{outreach.error}</div>
                ) : (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                        background: `${SEGMENT_COLORS[outreach.classification] || '#888'}22`,
                        color: SEGMENT_COLORS[outreach.classification] || '#888',
                      }}>
                        {outreach.classification?.toUpperCase()}
                      </span>
                      {outreach.ask_amount && (
                        <span style={{ marginLeft: 8, color: '#b8860b', fontWeight: 700, fontSize: 14 }}>
                          Ask: {fmt(outreach.ask_amount)}
                        </span>
                      )}
                    </div>
                    {outreach.thank_you_message && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>THANK YOU MESSAGE</div>
                        <div style={{ fontSize: 13, lineHeight: 1.6, color: '#ddd' }}>{outreach.thank_you_message}</div>
                      </div>
                    )}
                    {outreach.ask_rationale && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>ASK RATIONALE</div>
                        <div style={{ fontSize: 13, color: '#aaa' }}>{outreach.ask_rationale}</div>
                      </div>
                    )}
                    {outreach.personalized_note && (
                      <div>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>PERSONALIZED NOTE</div>
                        <div style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>{outreach.personalized_note}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
