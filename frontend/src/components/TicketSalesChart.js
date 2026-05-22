import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TicketSalesChart() {
  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({ tickets: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/custom-views/ticket-sales-chart', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setData(res.data.data || []); setTotals(res.data.totals || { tickets: 0, revenue: 0 }); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading ticket sales...</div>;
  if (error) return <div style={{ padding: 20, color: 'crimson' }}>{error}</div>;

  const maxTickets = Math.max(1, ...data.map(d => d.tickets_sold));

  return (
    <div data-testid="ticket-sales-chart" style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0, color: '#8B0000' }}>Ticket Sales by Performance Date</h3>
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        <div><strong>Total Tickets:</strong> {totals.tickets}</div>
        <div><strong>Revenue:</strong> ${Number(totals.revenue).toFixed(2)}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 220, borderBottom: '2px solid #333', paddingBottom: 4, overflowX: 'auto' }}>
        {data.length === 0 && <div style={{ color: '#888' }}>No ticket sales data available.</div>}
        {data.map((d, i) => {
          const h = (d.tickets_sold / maxTickets) * 200;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }} title={`${d.show_title}: ${d.tickets_sold} tickets ($${d.revenue})`}>
              <div style={{ fontSize: 10, marginBottom: 2 }}>{d.tickets_sold}</div>
              <div style={{ width: 30, height: `${h}px`, background: 'linear-gradient(180deg, #c0392b, #8B0000)', borderRadius: '4px 4px 0 0' }} />
              <div style={{ fontSize: 9, transform: 'rotate(-45deg)', marginTop: 16, whiteSpace: 'nowrap' }}>{d.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TicketSalesChart;
