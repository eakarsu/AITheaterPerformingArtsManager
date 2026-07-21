const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { router: authRouter, authenticateToken: auth } = require('./routes/auth');
const createCrudRoutes = require('./routes/crud');
const { validateRuntime } = require('./governance/runtime');
const { createProviderGate } = require('./governance/providerGate');

validateRuntime();

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;
const allowedOrigins = String(process.env.CORS_ORIGINS || process.env.CLIENT_URL || `http://localhost:${process.env.FRONTEND_PORT || 3001}`)
  .split(',').map((value) => value.trim()).filter(Boolean);
const providerPrefixes = [
  '/api/ai', '/api/season-planning-optimizer', '/api/performance-outcome-prediction',
  '/api/fundraising-campaign-planning', '/api/script-recommendation',
  '/api/community-partnership-matcher', '/api/volunteer-management', '/api/gap-',
];

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Theater API is running.', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRouter);
app.use('/api/governance', require('./governance/router'));
app.use('/api', auth);
app.use(createProviderGate(providerPrefixes));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/donors', require('./routes/donors'));

const tableDefinitions = {
  shows: ['title', 'playwright', 'genre', 'season', 'year', 'director', 'status', 'budget', 'opening_date', 'closing_date', 'description', 'venue'],
  auditions: ['show_id', 'role_name', 'audition_date', 'location', 'status', 'requirements', 'notes'],
  cast_crew: ['show_id', 'person_name', 'role', 'department', 'position', 'email', 'phone', 'union_status', 'pay_rate', 'start_date'],
  rehearsals: ['show_id', 'title', 'rehearsal_date', 'start_time', 'end_time', 'location', 'type', 'notes', 'status'],
  tech_production: ['show_id', 'department', 'cue_number', 'description', 'timing', 'notes', 'status'],
  costumes: ['show_id', 'item_name', 'character', 'size', 'color', 'condition', 'quantity', 'storage_location', 'fitting_date', 'notes'],
  props: ['show_id', 'item_name', 'scene', 'description', 'source', 'status', 'cost', 'notes'],
  tickets: ['show_id', 'ticket_type', 'customer_name', 'email', 'performance_date', 'seat_section', 'seat_number', 'price', 'payment_status', 'purchase_date'],
  volunteers: ['name', 'email', 'phone', 'role', 'department', 'availability', 'skills', 'start_date', 'hours_logged', 'status', 'notes'],
  venue_rentals: ['venue_name', 'renter_name', 'renter_email', 'event_type', 'rental_date', 'start_time', 'end_time', 'rental_fee', 'deposit_paid', 'status', 'special_requirements'],
  education: ['program_name', 'type', 'instructor', 'age_group', 'max_enrollment', 'current_enrollment', 'start_date', 'end_date', 'schedule', 'fee', 'location', 'description'],
  concessions: ['item_name', 'category', 'price', 'cost', 'quantity_in_stock', 'supplier', 'reorder_level', 'show_id', 'performance_date', 'units_sold', 'revenue'],
  financial_reports: ['show_id', 'report_type', 'period', 'category', 'description', 'amount', 'date', 'status', 'notes'],
};
const routeNameMap = {
  shows: 'shows', auditions: 'auditions', cast_crew: 'cast-crew', rehearsals: 'rehearsals',
  tech_production: 'tech-production', costumes: 'costumes', props: 'props',
  tickets: 'tickets-crud', volunteers: 'volunteers', venue_rentals: 'venue-rentals',
  education: 'education', concessions: 'concessions', financial_reports: 'financial-reports',
};
for (const [tableName, columns] of Object.entries(tableDefinitions)) {
  app.use(`/api/${routeNameMap[tableName]}`, createCrudRoutes(tableName, columns));
}
app.use('/api/custom-views', require('./routes/customViews'));

if (process.env.ENABLE_LEGACY_PROVIDER_ROUTES === 'true') {
  const legacyRoutes = [
    ['/api/ai', './routes/ai'],
    ['/api/season-planning-optimizer', './routes/seasonPlanningOptimizer'],
    ['/api/performance-outcome-prediction', './routes/performanceOutcomePrediction'],
    ['/api/fundraising-campaign-planning', './routes/fundraisingCampaignPlanning'],
    ['/api/script-recommendation', './routes/scriptRecommendation'],
    ['/api/community-partnership-matcher', './routes/communityPartnershipMatcher'],
    ['/api/volunteer-management', './routes/volunteerManagement'],
    ['/api/gap-no-ai-driven-season-planning', './routes/gapNoAiDrivenSeasonPlanning'],
    ['/api/gap-no-performance-outcome-prediction', './routes/gapNoPerformanceOutcomePrediction'],
    ['/api/gap-no-conversational-marketing-copilot', './routes/gapNoConversationalMarketingCopilot'],
    ['/api/gap-no-integration-with-ticketing-platforms-eventbrite-brown-paper', './routes/gapNoIntegrationWithTicketingPlatformsEventbriteBrownPaper'],
    ['/api/gap-no-email-marketing-automation', './routes/gapNoEmailMarketingAutomation'],
    ['/api/gap-no-grant-database-matching', './routes/gapNoGrantDatabaseMatching'],
    ['/api/gap-no-volunteer-management', './routes/gapNoVolunteerManagement'],
    ['/api/gap-no-patron-subscriber-self-service-portal', './routes/gapNoPatronSubscriberSelfServicePortal'],
    ['/api/gap-no-webhooks-or-notifications', './routes/gapNoWebhooksOrNotifications'],
    ['/api/gap-no-payment-processor-integration', './routes/gapNoPaymentProcessorIntegration'],
    ['/api/gap-no-crm-style-segmentation-beyond-donor-records', './routes/gapNoCrmStyleSegmentationBeyondDonorRecords'],
  ];
  for (const [routePath, modulePath] of legacyRoutes) app.use(routePath, require(modulePath));
}

app.use('/api', (req, res) => res.status(404).json({ success: false, error: 'Endpoint not found.' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

if (require.main === module) app.listen(PORT, () => console.log(`Theater API running on port ${PORT}`));

module.exports = app;
