import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProgramPlaybillPDF() {
  const [shows, setShows] = useState([]);
  const [showId, setShowId] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/shows?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const list = res.data.data || res.data || [];
        setShows(list);
        if (list.length > 0) setShowId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/custom-views/program-playbill${showId ? `?show_id=${showId}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `playbill_show_${showId || 'latest'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMsg('Playbill downloaded.');
    } catch (e) {
      setMsg('Download failed: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div data-testid="program-playbill-pdf" style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0, color: '#8B0000' }}>Program / Playbill PDF</h3>
      <p style={{ color: '#555', fontSize: 13 }}>Generate a printable playbill for any show including cast, crew, synopsis and venue.</p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600 }}>Show:</label>
        <select value={showId} onChange={e => setShowId(e.target.value)} style={{ padding: 6, minWidth: 240 }}>
          <option value="">(Latest)</option>
          {shows.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <button onClick={handleDownload} disabled={downloading}
          style={{ padding: '8px 16px', background: '#8B0000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {downloading ? 'Generating...' : 'Download Playbill PDF'}
        </button>
      </div>
      {msg && <div style={{ marginTop: 10, color: msg.startsWith('Download failed') ? 'crimson' : 'green' }}>{msg}</div>}
    </div>
  );
}

export default ProgramPlaybillPDF;
