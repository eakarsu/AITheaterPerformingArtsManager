import React from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import TicketSalesChart from '../components/TicketSalesChart';
import ShowScheduleHeatmap from '../components/ShowScheduleHeatmap';
import ProgramPlaybillPDF from '../components/ProgramPlaybillPDF';
import CastingRulesEditor from '../components/CastingRulesEditor';

// Set API base for prod-build / cross-port serving
if (typeof window !== 'undefined') {
  const apiBase = window.__API_BASE__ || 'http://localhost:4010';
  axios.defaults.baseURL = apiBase;
  window.__API_BASE__ = apiBase;
}

function CustomViewsPage() {
  return (
    <div className="app-container">
      <Navbar title="Theater Views" />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
        <aside style={{ width: 220, background: '#1a1a1a', color: '#f5f5f5', padding: '20px 0' }}>
          <div style={{ padding: '0 16px 12px', fontSize: 12, color: '#c39d3c', textTransform: 'uppercase', letterSpacing: 1 }}>Theater Views</div>
          <a href="#ticket-sales" style={{ display: 'block', padding: '10px 16px', color: '#f5f5f5', textDecoration: 'none' }}>Ticket Sales Chart</a>
          <a href="#schedule-heatmap" style={{ display: 'block', padding: '10px 16px', color: '#f5f5f5', textDecoration: 'none' }}>Schedule Heatmap</a>
          <a href="#playbill" style={{ display: 'block', padding: '10px 16px', color: '#f5f5f5', textDecoration: 'none' }}>Program / Playbill PDF</a>
          <a href="#casting-rules" style={{ display: 'block', padding: '10px 16px', color: '#f5f5f5', textDecoration: 'none' }}>Casting Rules Editor</a>
        </aside>
        <main style={{ flex: 1, padding: 24, background: '#faf7f2', overflowY: 'auto' }}>
          <h1 style={{ color: '#8B0000', marginTop: 0 }}>Theater Views</h1>
          <p style={{ color: '#555' }}>Custom dashboards and tools for theater operations: ticket analytics, schedule heatmap, playbill generation, and casting rules management.</p>
          <section id="ticket-sales" style={{ marginBottom: 24 }}><TicketSalesChart /></section>
          <section id="schedule-heatmap" style={{ marginBottom: 24 }}><ShowScheduleHeatmap /></section>
          <section id="playbill" style={{ marginBottom: 24 }}><ProgramPlaybillPDF /></section>
          <section id="casting-rules" style={{ marginBottom: 24 }}><CastingRulesEditor /></section>
        </main>
      </div>
    </div>
  );
}

export default CustomViewsPage;
