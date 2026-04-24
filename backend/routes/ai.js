const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(systemPrompt, userPrompt) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'AI Theater & Performing Arts Manager',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content in OpenRouter response.');
  }

  return content;
}

function parseAIResponse(rawContent, fallbackTitle) {
  // Try to parse as JSON first (in case the AI returns JSON)
  try {
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      return parsed;
    }
    const parsed = JSON.parse(rawContent);
    return parsed;
  } catch (e) {
    // Parse markdown-style sections
  }

  const lines = rawContent.split('\n');
  let title = fallbackTitle;
  const sections = [];
  let currentHeading = '';
  let currentBody = [];

  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)/);
    const h2Match = line.match(/^##\s+(.+)/);
    const h3Match = line.match(/^###\s+(.+)/);

    if (h1Match && !title) {
      title = h1Match[1].trim();
    } else if (h2Match || h3Match) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
      }
      currentHeading = (h2Match || h3Match)[1].trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentHeading) {
    sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
  }

  // If no sections were parsed, treat entire content as one section
  if (sections.length === 0) {
    sections.push({ heading: 'Generated Content', body: rawContent.trim() });
  }

  // Extract title from first heading if not yet set
  if (title === fallbackTitle && lines[0]?.startsWith('# ')) {
    title = lines[0].replace(/^#\s+/, '').trim();
  }

  return {
    title,
    content: rawContent.trim(),
    sections,
  };
}

// 15. POST /api/ai/marketing - Marketing Copy & Press Release Generation
router.post('/marketing', async (req, res) => {
  try {
    const { show_title, show_description, target_audience, tone } = req.body;

    if (!show_title || !show_description) {
      return res.status(400).json({ success: false, error: 'show_title and show_description are required.' });
    }

    const systemPrompt = `You are an expert theater marketing copywriter. Generate compelling marketing copy and a press release for a theater production. Structure your response with clear markdown sections using ## headings. Include these sections:
## Marketing Tagline
## Press Release
## Social Media Posts
## Email Campaign Copy
## Target Audience Strategy

Make the copy engaging, professional, and tailored to the specified audience and tone.`;

    const userPrompt = `Generate marketing materials for:
- Show: ${show_title}
- Description: ${show_description}
- Target Audience: ${target_audience || 'General theater-goers'}
- Tone: ${tone || 'Professional and exciting'}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIResponse(rawContent, `Marketing Materials: ${show_title}`);

    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Marketing error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate marketing content.' });
  }
});

// 16. POST /api/ai/casting-calls - Casting Call Posting Creation
router.post('/casting-calls', async (req, res) => {
  try {
    const { show_title, roles_needed, requirements, audition_dates } = req.body;

    if (!show_title || !roles_needed) {
      return res.status(400).json({ success: false, error: 'show_title and roles_needed are required.' });
    }

    const systemPrompt = `You are an experienced casting director creating professional casting call postings. Structure your response with clear markdown sections using ## headings. Include these sections:
## Casting Call Header
## Production Details
## Available Roles
## Audition Requirements
## How to Apply
## Important Dates

Make the posting professional, inclusive, and informative. Include character breakdowns for each role.`;

    const userPrompt = `Create a casting call for:
- Show: ${show_title}
- Roles Needed: ${roles_needed}
- Requirements: ${requirements || 'Standard audition with prepared monologue'}
- Audition Dates: ${audition_dates || 'TBD'}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIResponse(rawContent, `Casting Call: ${show_title}`);

    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Casting Calls error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate casting call.' });
  }
});

// 17. POST /api/ai/grant-narratives - Grant Application Narrative Drafting
router.post('/grant-narratives', async (req, res) => {
  try {
    const { organization_name, grant_purpose, project_description, budget_amount } = req.body;

    if (!organization_name || !project_description) {
      return res.status(400).json({ success: false, error: 'organization_name and project_description are required.' });
    }

    const systemPrompt = `You are an expert grant writer for nonprofit performing arts organizations. Write a compelling grant application narrative. Structure your response with clear markdown sections using ## headings. Include these sections:
## Executive Summary
## Organization Background
## Project Description
## Goals and Objectives
## Target Population and Community Impact
## Evaluation Plan
## Budget Justification
## Sustainability Plan

Use persuasive, data-aware language appropriate for foundation and government grant applications.`;

    const userPrompt = `Draft a grant narrative for:
- Organization: ${organization_name}
- Grant Purpose: ${grant_purpose || 'General operating support'}
- Project: ${project_description}
- Budget Amount: ${budget_amount ? `$${budget_amount}` : 'TBD'}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIResponse(rawContent, `Grant Narrative: ${organization_name}`);

    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Grant Narratives error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate grant narrative.' });
  }
});

// 18. POST /api/ai/audience-analysis - Audience Feedback Analysis
router.post('/audience-analysis', async (req, res) => {
  try {
    const { feedback_text, show_title } = req.body;

    if (!feedback_text) {
      return res.status(400).json({ success: false, error: 'feedback_text is required.' });
    }

    const systemPrompt = `You are an expert audience research analyst for performing arts organizations. Analyze the provided audience feedback and generate actionable insights. Structure your response with clear markdown sections using ## headings. Include these sections:
## Overall Sentiment
## Key Themes
## Strengths Identified
## Areas for Improvement
## Audience Demographics Insights
## Actionable Recommendations

Provide specific, data-driven observations with clear recommendations.`;

    const userPrompt = `Analyze this audience feedback${show_title ? ` for "${show_title}"` : ''}:

${feedback_text}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIResponse(rawContent, `Audience Analysis${show_title ? `: ${show_title}` : ''}`);

    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Audience Analysis error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to analyze audience feedback.' });
  }
});

// 19. POST /api/ai/rehearsal-optimization - Rehearsal Schedule Optimization
router.post('/rehearsal-optimization', async (req, res) => {
  try {
    const { show_title, cast_size, available_dates, constraints } = req.body;

    if (!show_title) {
      return res.status(400).json({ success: false, error: 'show_title is required.' });
    }

    const systemPrompt = `You are an expert stage manager and production scheduler for professional theater. Create an optimized rehearsal schedule. Structure your response with clear markdown sections using ## headings. Include these sections:
## Schedule Overview
## Phase 1: Table Work and Read-Throughs
## Phase 2: Blocking and Staging
## Phase 3: Run-Throughs and Polish
## Phase 4: Technical and Dress Rehearsals
## Conflict Management Strategy
## Efficiency Tips

Provide a practical, detailed schedule with specific time blocks and priorities.`;

    const userPrompt = `Create an optimized rehearsal schedule for:
- Show: ${show_title}
- Cast Size: ${cast_size || 'Standard cast'}
- Available Dates: ${available_dates || 'Flexible - typical 4-6 week rehearsal period'}
- Constraints: ${constraints || 'Standard evening and weekend availability'}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIResponse(rawContent, `Rehearsal Schedule: ${show_title}`);

    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Rehearsal Optimization error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate rehearsal schedule.' });
  }
});

// 20. POST /api/ai/subscription-recommendations - Season Subscription Package Recommendations
router.post('/subscription-recommendations', async (req, res) => {
  try {
    const { shows_list, demographics, pricing_range } = req.body;

    if (!shows_list) {
      return res.status(400).json({ success: false, error: 'shows_list is required.' });
    }

    const systemPrompt = `You are an expert performing arts marketing strategist specializing in subscription and membership programs. Generate creative season subscription package recommendations. Structure your response with clear markdown sections using ## headings. Include these sections:
## Recommended Packages
## Package Details and Pricing
## Target Demographics for Each Package
## Marketing Strategy
## Early Bird and Renewal Incentives
## Add-On Options
## Revenue Projections

Provide specific, actionable package designs with pricing tiers and marketing angles.`;

    const userPrompt = `Design subscription packages for:
- Season Shows: ${shows_list}
- Audience Demographics: ${demographics || 'Mixed suburban/urban audience, ages 25-70'}
- Pricing Range: ${pricing_range || 'Budget to premium tiers'}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const result = parseAIResponse(rawContent, 'Season Subscription Packages');

    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Subscription Recommendations error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate subscription recommendations.' });
  }
});

module.exports = router;
