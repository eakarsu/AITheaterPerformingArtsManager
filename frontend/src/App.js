import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import AIFeaturePage from './pages/AIFeaturePage';
import BoxOfficeDashboard from './pages/BoxOfficeDashboard';
import DonorStewardship from './pages/DonorStewardship';
import ScriptAnalysis from './pages/ScriptAnalysis';
import TicketPricingPage from './pages/TicketPricingPage';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// === Batch 08 Gaps & Frontend Mounts ===
import CfSeasonPlanningOptimizerRecommendingShowMix from './pages/CfSeasonPlanningOptimizerRecommendingShowMix'
import CfPerformanceOutcomePredictionForTicketSalesAnd from './pages/CfPerformanceOutcomePredictionForTicketSalesAnd'
import CfFundraisingCampaignPlanningWithDonorSegmentTargeting from './pages/CfFundraisingCampaignPlanningWithDonorSegmentTargeting'
import CfScriptRecommendationEngineBasedOnAvailableCast from './pages/CfScriptRecommendationEngineBasedOnAvailableCast'
import CfCommunityPartnershipMatcherIdentifyingSponsorsByAffinity from './pages/CfCommunityPartnershipMatcherIdentifyingSponsorsByAffinity'
import CfVolunteerManagementModuleWithShiftScheduling from './pages/CfVolunteerManagementModuleWithShiftScheduling'
import GapNoAiDrivenSeasonPlanning from './pages/GapNoAiDrivenSeasonPlanning'
import GapNoPerformanceOutcomePrediction from './pages/GapNoPerformanceOutcomePrediction'
import GapNoConversationalMarketingCopilot from './pages/GapNoConversationalMarketingCopilot'
import GapNoIntegrationWithTicketingPlatformsEventbriteBrown from './pages/GapNoIntegrationWithTicketingPlatformsEventbriteBrown'
import GapNoEmailMarketingAutomation from './pages/GapNoEmailMarketingAutomation'
import GapNoGrantDatabaseMatching from './pages/GapNoGrantDatabaseMatching'
import GapNoVolunteerManagement from './pages/GapNoVolunteerManagement'
import GapNoPatronSubscriberSelfServicePortal from './pages/GapNoPatronSubscriberSelfServicePortal'
import GapNoWebhooksOrNotifications from './pages/GapNoWebhooksOrNotifications'
import GapNoPaymentProcessorIntegration from './pages/GapNoPaymentProcessorIntegration'
import GapNoCrmStyleSegmentationBeyondDonorRecords from './pages/GapNoCrmStyleSegmentationBeyondDonorRecords'
import CustomViewsPage from './pages/CustomViewsPage'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

// Alias for batch08 generated routes that reference ProtectedRoute
const ProtectedRoute = PrivateRoute;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/features/:featureName" element={<PrivateRoute><FeaturePage /></PrivateRoute>} />
        <Route path="/ai/:featureName" element={<PrivateRoute><AIFeaturePage /></PrivateRoute>} />
        <Route path="/box-office" element={<PrivateRoute><BoxOfficeDashboard /></PrivateRoute>} />
        <Route path="/donor-stewardship" element={<PrivateRoute><DonorStewardship /></PrivateRoute>} />
        <Route path="/script-analysis" element={<PrivateRoute><ScriptAnalysis /></PrivateRoute>} />
        <Route path="/ticket-pricing" element={<PrivateRoute><TicketPricingPage /></PrivateRoute>} />
        <Route path="/custom-views" element={<PrivateRoute><CustomViewsPage /></PrivateRoute>} />
        {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-season-planning-optimizer-recommending-show-mix" element={<ProtectedRoute><CfSeasonPlanningOptimizerRecommendingShowMix /></ProtectedRoute>} />
      <Route path="/cf-performance-outcome-prediction-for-ticket-sales-and-review" element={<ProtectedRoute><CfPerformanceOutcomePredictionForTicketSalesAnd /></ProtectedRoute>} />
      <Route path="/cf-fundraising-campaign-planning-with-donor-segment-targeting" element={<ProtectedRoute><CfFundraisingCampaignPlanningWithDonorSegmentTargeting /></ProtectedRoute>} />
      <Route path="/cf-script-recommendation-engine-based-on-available-cast-and" element={<ProtectedRoute><CfScriptRecommendationEngineBasedOnAvailableCast /></ProtectedRoute>} />
      <Route path="/cf-community-partnership-matcher-identifying-sponsors-by-affinity" element={<ProtectedRoute><CfCommunityPartnershipMatcherIdentifyingSponsorsByAffinity /></ProtectedRoute>} />
      <Route path="/cf-volunteer-management-module-with-shift-scheduling" element={<ProtectedRoute><CfVolunteerManagementModuleWithShiftScheduling /></ProtectedRoute>} />
      <Route path="/gap-no-ai-driven-season-planning" element={<ProtectedRoute><GapNoAiDrivenSeasonPlanning /></ProtectedRoute>} />
      <Route path="/gap-no-performance-outcome-prediction" element={<ProtectedRoute><GapNoPerformanceOutcomePrediction /></ProtectedRoute>} />
      <Route path="/gap-no-conversational-marketing-copilot" element={<ProtectedRoute><GapNoConversationalMarketingCopilot /></ProtectedRoute>} />
      <Route path="/gap-no-integration-with-ticketing-platforms-eventbrite-brown-paper" element={<ProtectedRoute><GapNoIntegrationWithTicketingPlatformsEventbriteBrown /></ProtectedRoute>} />
      <Route path="/gap-no-email-marketing-automation" element={<ProtectedRoute><GapNoEmailMarketingAutomation /></ProtectedRoute>} />
      <Route path="/gap-no-grant-database-matching" element={<ProtectedRoute><GapNoGrantDatabaseMatching /></ProtectedRoute>} />
      <Route path="/gap-no-volunteer-management" element={<ProtectedRoute><GapNoVolunteerManagement /></ProtectedRoute>} />
      <Route path="/gap-no-patron-subscriber-self-service-portal" element={<ProtectedRoute><GapNoPatronSubscriberSelfServicePortal /></ProtectedRoute>} />
      <Route path="/gap-no-webhooks-or-notifications" element={<ProtectedRoute><GapNoWebhooksOrNotifications /></ProtectedRoute>} />
      <Route path="/gap-no-payment-processor-integration" element={<ProtectedRoute><GapNoPaymentProcessorIntegration /></ProtectedRoute>} />
      <Route path="/gap-no-crm-style-segmentation-beyond-donor-records" element={<ProtectedRoute><GapNoCrmStyleSegmentationBeyondDonorRecords /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
