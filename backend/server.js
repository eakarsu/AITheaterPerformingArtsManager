const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const { router: authRouter, authenticateToken } = require('./routes/auth');
const createCrudRoutes = require('./routes/crud');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// Middleware
app.use(cors({
  origin: [`http://localhost:${process.env.FRONTEND_PORT || 3001}`, 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AI Theater & Performing Arts Manager API is running.', timestamp: new Date().toISOString() });
});

// Auth routes (public)
app.use('/api/auth', authRouter);

// CRUD routes for all 14 feature tables
const tableDefinitions = {
  shows: ['title', 'playwright', 'genre', 'season', 'year', 'director', 'status', 'budget', 'opening_date', 'closing_date', 'description', 'venue'],
  auditions: ['show_id', 'role_name', 'audition_date', 'location', 'status', 'requirements', 'notes'],
  cast_crew: ['show_id', 'person_name', 'role', 'department', 'position', 'email', 'phone', 'union_status', 'pay_rate', 'start_date'],
  rehearsals: ['show_id', 'title', 'rehearsal_date', 'start_time', 'end_time', 'location', 'type', 'notes', 'status'],
  tech_production: ['show_id', 'department', 'cue_number', 'description', 'timing', 'notes', 'status'],
  costumes: ['show_id', 'item_name', 'character', 'size', 'color', 'condition', 'quantity', 'storage_location', 'fitting_date', 'notes'],
  props: ['show_id', 'item_name', 'scene', 'description', 'source', 'status', 'cost', 'notes'],
  tickets: ['show_id', 'ticket_type', 'customer_name', 'email', 'performance_date', 'seat_section', 'seat_number', 'price', 'payment_status', 'purchase_date'],
  donors: ['name', 'type', 'email', 'phone', 'address', 'donation_amount', 'donation_date', 'campaign', 'recognition_level', 'tax_receipt_sent', 'notes'],
  volunteers: ['name', 'email', 'phone', 'role', 'department', 'availability', 'skills', 'start_date', 'hours_logged', 'status', 'notes'],
  venue_rentals: ['venue_name', 'renter_name', 'renter_email', 'event_type', 'rental_date', 'start_time', 'end_time', 'rental_fee', 'deposit_paid', 'status', 'special_requirements'],
  education: ['program_name', 'type', 'instructor', 'age_group', 'max_enrollment', 'current_enrollment', 'start_date', 'end_date', 'schedule', 'fee', 'location', 'description'],
  concessions: ['item_name', 'category', 'price', 'cost', 'quantity_in_stock', 'supplier', 'reorder_level', 'show_id', 'performance_date', 'units_sold', 'revenue'],
  financial_reports: ['show_id', 'report_type', 'period', 'category', 'description', 'amount', 'date', 'status', 'notes'],
};

// Mount URL-friendly routes for each table
const routeNameMap = {
  shows: 'shows',
  auditions: 'auditions',
  cast_crew: 'cast-crew',
  rehearsals: 'rehearsals',
  tech_production: 'tech-production',
  costumes: 'costumes',
  props: 'props',
  tickets: 'tickets',
  donors: 'donors',
  volunteers: 'volunteers',
  venue_rentals: 'venue-rentals',
  education: 'education',
  concessions: 'concessions',
  financial_reports: 'financial-reports',
};

for (const [tableName, columns] of Object.entries(tableDefinitions)) {
  const routePath = `/api/${routeNameMap[tableName]}`;
  app.use(routePath, createCrudRoutes(tableName, columns));
}

// AI routes
app.use('/api/ai', aiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`AI Theater & Performing Arts Manager API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
