import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ShowScheduleHeatmap() {
  const [dates, setDates] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/custom-views/show-schedule-heatmap', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setDates(res.data.dates || []); setMatrix(res.data.matrix || []); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const colorFor = (intensity) => {
    if (!intensity) return '#f5f5f5';
    if (intensity >= 8) return '#7b1f1f';
    if (intensity >= 5) return '#b03a2e';
    if (intensity >= 3) return '#d68910';
    if (intensity >= 1) return '#f4d03f';
    return '#f5f5f5';
  };

  if (loading) return <div style={{ padding: 20 }}>Loading heatmap...</div>;
  if (error) return <div style={{ padding: 20, color: 'crimson' }}>{error}</div>;

  return (
    <div data-testid="show-schedule-heatmap" style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0, color: '#8B0000' }}>Show Schedule Heatmap (Show x Date)</h3>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 11 }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#f4d03f', marginRight: 4 }} />Low</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#d68910', marginRight: 4 }} />Med</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#b03a2e', marginRight: 4 }} />High</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#7b1f1f', marginRight: 4 }} />Peak</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: 4, textAlign: 'left', position: 'sticky', left: 0, background: '#fff', minWidth: 160 }}>Show</th>
              {dates.map(d => (
                <th key={d} style={{ padding: 2, fontSize: 9, transform: 'rotate(-60deg)', height: 70, width: 24 }}>{d.slice(5)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.length === 0 && (
              <tr><td colSpan={dates.length + 1} style={{ padding: 12, color: '#888' }}>No schedule data.</td></tr>
            )}
            {matrix.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: 4, position: 'sticky', left: 0, background: '#fff', borderRight: '1px solid #eee' }}>{row.show_title}</td>
                {row.cells.map((c, j) => (
                  <td key={j} title={`${c.date}: ${c.rehearsals} reh, ${c.performances} perf`}
                    style={{ width: 22, height: 22, background: colorFor(c.intensity), border: '1px solid #fff', textAlign: 'center', color: '#fff', fontSize: 9 }}>
                    {c.intensity || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShowScheduleHeatmap;
