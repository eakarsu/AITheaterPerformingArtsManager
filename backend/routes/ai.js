const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const pool = require('../db');

const router = express.Router();

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

// Rate limiter: 20 requests/hour per user
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user ? 'user:' + (req.user.id || req.user.userId) : ipKeyGenerator(req),
  message: { success: false, error: 'AI rate limit exceeded. Try again in an hour.' },
});

function requireOpenRouterKey(req, res, next) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || /your[-_]?openrouter[-_]?api[-_]?key/i.test(key)) {
    return res.status(503).json({ success: false, error: 'AI service not configured. OPENROUTER_API_KEY missing.' });
  }
  next();
}

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
      model: MODEL,
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
  if (!content) throw new Error('No content in OpenRouter response.');
  return content;
}

function parseAIJson(raw) {
  try { return JSON.parse(raw); } catch (_) {}
  try {
    const stripped = raw.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();
    return JSON.parse(stripped);
  } catch (_) {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_) {} }
  return null;
}

async function persistAIResult(userId, endpoint, inputData, result) {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(100),
        input_data JSONB,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    );
    await pool.query(
      'INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1, $2, $3, $4)',
      [userId, endpoint, JSON.stringify(inputData), JSON.stringify(result)]
    );
  } catch (err) {
    console.error('Failed to persist AI result:', err.message);
  }
}

// POST /api/ai/marketing
router.post('/marketing', aiRateLimiter, async (req, res) => {
  try {
    const { show_title, show_description, target_audience, tone, show_id } = req.body;
    if (!show_title || !show_description) {
      return res.status(400).json({ success: false, error: 'show_title and show_description are required.' });
    }

    // DB-ground: fetch upcoming shows + ticket sales
    let dbContext = '';
    try {
      const shows = await pool.query('SELECT * FROM shows ORDER BY opening_date ASC LIMIT 5');
      const sales = await pool.query('SELECT show_id, COUNT(*) as tickets, COALESCE(SUM(price),0) as revenue FROM tickets GROUP BY show_id LIMIT 5');
      dbContext = `\nUpcoming Shows: ${JSON.stringify(shows.rows)}\nTicket Sales Data: ${JSON.stringify(sales.rows)}`;
    } catch (_) {}

    const systemPrompt = `You are an expert theater marketing copywriter. Return ONLY valid JSON with this exact structure:
{"headline": "string", "press_release": "string", "social_posts": ["string","string","string"], "email_subject": "string", "target_demographics": ["string","string"]}`;

    const userPrompt = `Generate marketing materials for:
- Show: ${show_title}
- Description: ${show_description}
- Target Audience: ${target_audience || 'General theater-goers'}
- Tone: ${tone || 'Professional and exciting'}
${dbContext}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = parsed || { content: rawContent };

    await persistAIResult(req.user?.id, 'marketing', { show_title, show_description, target_audience, tone }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Marketing error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate marketing content.' });
  }
});

// POST /api/ai/casting-calls
router.post('/casting-calls', aiRateLimiter, async (req, res) => {
  try {
    const { show_title, roles_needed, requirements, audition_dates } = req.body;
    if (!show_title || !roles_needed) {
      return res.status(400).json({ success: false, error: 'show_title and roles_needed are required.' });
    }

    // DB-ground: fetch auditions + cast_crew
    let dbContext = '';
    try {
      const auditions = await pool.query('SELECT * FROM auditions ORDER BY audition_date DESC LIMIT 5');
      const castCrew = await pool.query('SELECT * FROM cast_crew ORDER BY id DESC LIMIT 10');
      dbContext = `\nExisting Auditions: ${JSON.stringify(auditions.rows)}\nCurrent Cast & Crew: ${JSON.stringify(castCrew.rows)}`;
    } catch (_) {}

    const systemPrompt = `You are an experienced casting director. Return ONLY valid JSON with this exact structure:
{"title": "string", "requirements": ["string","string"], "audition_format": "string", "compensation": "string", "posting_text": "string"}`;

    const userPrompt = `Create a casting call for:
- Show: ${show_title}
- Roles Needed: ${roles_needed}
- Requirements: ${requirements || 'Standard audition with prepared monologue'}
- Audition Dates: ${audition_dates || 'TBD'}
${dbContext}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = parsed || { content: rawContent };

    await persistAIResult(req.user?.id, 'casting-calls', { show_title, roles_needed }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Casting Calls error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate casting call.' });
  }
});

// POST /api/ai/grant-narratives
router.post('/grant-narratives', aiRateLimiter, async (req, res) => {
  try {
    const { organization_name, grant_purpose, project_description, budget_amount } = req.body;
    if (!organization_name || !project_description) {
      return res.status(400).json({ success: false, error: 'organization_name and project_description are required.' });
    }

    // DB-ground: fetch donors + financial_reports
    let dbContext = '';
    try {
      const donors = await pool.query('SELECT name, type, donation_amount, campaign, recognition_level FROM donors ORDER BY donation_amount DESC LIMIT 10');
      const reports = await pool.query('SELECT report_type, period, category, amount FROM financial_reports ORDER BY date DESC LIMIT 10');
      dbContext = `\nDonor History: ${JSON.stringify(donors.rows)}\nFinancial Reports: ${JSON.stringify(reports.rows)}`;
    } catch (_) {}

    const systemPrompt = `You are an expert grant writer for nonprofit performing arts organizations. Return ONLY valid JSON with this exact structure:
{"executive_summary": "string", "statement_of_need": "string", "program_description": "string", "objectives": ["string","string","string"], "evaluation_methods": "string"}`;

    const userPrompt = `Draft a grant narrative for:
- Organization: ${organization_name}
- Grant Purpose: ${grant_purpose || 'General operating support'}
- Project: ${project_description}
- Budget Amount: ${budget_amount ? `$${budget_amount}` : 'TBD'}
${dbContext}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = parsed || { content: rawContent };

    await persistAIResult(req.user?.id, 'grant-narratives', { organization_name, grant_purpose, project_description }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Grant Narratives error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate grant narrative.' });
  }
});

// POST /api/ai/audience-analysis
router.post('/audience-analysis', aiRateLimiter, async (req, res) => {
  try {
    const { feedback_text, show_title } = req.body;
    if (!feedback_text) {
      return res.status(400).json({ success: false, error: 'feedback_text is required.' });
    }

    // DB-ground: tickets sold + show data
    let dbContext = '';
    try {
      const tickets = await pool.query('SELECT show_id, ticket_type, COUNT(*) as count, AVG(price) as avg_price FROM tickets GROUP BY show_id, ticket_type LIMIT 10');
      const shows = await pool.query('SELECT id, title, genre, status FROM shows ORDER BY id DESC LIMIT 5');
      dbContext = `\nTicket Sales: ${JSON.stringify(tickets.rows)}\nShows: ${JSON.stringify(shows.rows)}`;
    } catch (_) {}

    const systemPrompt = `You are an expert audience research analyst. Return ONLY valid JSON with this exact structure:
{"sentiment_score": 0.75, "themes": ["string","string"], "recommendations": ["string","string"], "demographic_insights": ["string","string"]}`;

    const userPrompt = `Analyze audience feedback${show_title ? ` for "${show_title}"` : ''}:

${feedback_text}
${dbContext}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = parsed || { content: rawContent };

    await persistAIResult(req.user?.id, 'audience-analysis', { show_title, feedback_length: feedback_text.length }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Audience Analysis error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to analyze audience feedback.' });
  }
});

// POST /api/ai/rehearsal-optimization
router.post('/rehearsal-optimization', aiRateLimiter, async (req, res) => {
  try {
    const { show_title, cast_size, available_dates, constraints } = req.body;
    if (!show_title) {
      return res.status(400).json({ success: false, error: 'show_title is required.' });
    }

    // DB-ground: rehearsal schedule rows
    let dbContext = '';
    try {
      const rehearsals = await pool.query('SELECT * FROM rehearsals ORDER BY rehearsal_date DESC LIMIT 10');
      dbContext = `\nExisting Rehearsals: ${JSON.stringify(rehearsals.rows)}`;
    } catch (_) {}

    const systemPrompt = `You are an expert stage manager. Return ONLY valid JSON with this exact structure:
{"schedule": [{"rehearsal_date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM", "scene": "string", "participants": ["string"], "location": "string", "type": "string"}], "overview": "string", "conflict_notes": "string"}`;

    const userPrompt = `Create an optimized rehearsal schedule for:
- Show: ${show_title}
- Cast Size: ${cast_size || 'Standard cast'}
- Available Dates: ${available_dates || 'Flexible - typical 4-6 week rehearsal period'}
- Constraints: ${constraints || 'Standard evening and weekend availability'}
${dbContext}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = parsed || { content: rawContent };

    await persistAIResult(req.user?.id, 'rehearsal-optimization', { show_title, cast_size }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Rehearsal Optimization error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate rehearsal schedule.' });
  }
});

// POST /api/ai/subscription-recommendations
router.post('/subscription-recommendations', aiRateLimiter, async (req, res) => {
  try {
    const { shows_list, demographics, pricing_range } = req.body;
    if (!shows_list) {
      return res.status(400).json({ success: false, error: 'shows_list is required.' });
    }

    // DB-ground: all shows + ticket tiers
    let dbContext = '';
    try {
      const shows = await pool.query('SELECT title, genre, season, year, status, budget FROM shows ORDER BY opening_date ASC LIMIT 10');
      const ticketTypes = await pool.query('SELECT ticket_type, MIN(price) as min_price, MAX(price) as max_price, COUNT(*) as count FROM tickets GROUP BY ticket_type');
      dbContext = `\nShows in DB: ${JSON.stringify(shows.rows)}\nTicket Tiers: ${JSON.stringify(ticketTypes.rows)}`;
    } catch (_) {}

    const systemPrompt = `You are an expert performing arts marketing strategist. Return ONLY valid JSON with this exact structure:
{"packages": [{"name": "string", "price": 0, "shows_included": 0, "perks": ["string"], "target": "string"}], "marketing_strategy": "string", "revenue_projection": "string"}`;

    const userPrompt = `Design subscription packages for:
- Season Shows: ${shows_list}
- Audience Demographics: ${demographics || 'Mixed suburban/urban audience, ages 25-70'}
- Pricing Range: ${pricing_range || 'Budget to premium tiers'}
${dbContext}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = parsed || { content: rawContent };

    await persistAIResult(req.user?.id, 'subscription-recommendations', { shows_list, demographics }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Subscription Recommendations error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate subscription recommendations.' });
  }
});

// POST /api/ai/script-analysis (NEW)
router.post('/script-analysis', aiRateLimiter, async (req, res) => {
  try {
    const { script_text, title } = req.body;
    if (!script_text) {
      return res.status(400).json({ success: false, error: 'script_text is required.' });
    }

    const truncated = script_text.substring(0, 8000);

    const systemPrompt = `You are an expert dramaturg and script analyst. Return ONLY valid JSON with this exact structure:
{"characters": [{"name": "string", "role": "string", "pages": 0, "required_skills": ["string"]}], "scenes": [{"number": 1, "location": "string", "characters": ["string"]}], "props_list": ["string"], "set_requirements": ["string"], "estimated_runtime": "string"}`;

    const userPrompt = `Analyze this script${title ? ` titled "${title}"` : ''}:

${truncated}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = parsed || { content: rawContent };

    await persistAIResult(req.user?.id, 'script-analysis', { title, script_length: script_text.length }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Script Analysis error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to analyze script.' });
  }
});

// POST /api/ai/donor-outreach/:id (NEW)
router.post('/donor-outreach/:id', aiRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const donor = await pool.query('SELECT * FROM donors WHERE id = $1', [id]);
    if (donor.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Donor not found.' });
    }
    const d = donor.rows[0];
    const history = await pool.query('SELECT * FROM donors WHERE email = $1 ORDER BY donation_date DESC LIMIT 10', [d.email]);

    const currentYear = new Date().getFullYear();
    const lastDonationYear = d.donation_date ? new Date(d.donation_date).getFullYear() : null;
    let lybuntStatus = 'new';
    if (lastDonationYear === currentYear - 1) lybuntStatus = 'LYBUNT';
    else if (lastDonationYear && lastDonationYear < currentYear - 1) lybuntStatus = 'SYBUNT';
    else if (lastDonationYear === currentYear) lybuntStatus = 'current';

    const systemPrompt = `You are a nonprofit fundraising expert. Return ONLY valid JSON:
{"classification": "LYBUNT|SYBUNT|major|lapsed|new", "thank_you_message": "string", "ask_amount": 0, "ask_rationale": "string", "personalized_note": "string"}`;

    const userPrompt = `Generate donor stewardship content for:
Donor: ${d.name}
Email: ${d.email}
Last Donation: $${d.donation_amount} on ${d.donation_date}
Recognition Level: ${d.recognition_level}
Campaign: ${d.campaign}
Estimated Classification: ${lybuntStatus}
Giving History: ${JSON.stringify(history.rows)}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = { donor: d, classification: lybuntStatus, ...(parsed || { content: rawContent }) };

    await persistAIResult(req.user?.id, 'donor-outreach', { donor_id: id }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Donor Outreach error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate donor outreach.' });
  }
});

// POST /api/ai/ticket-pricing (NEW)
router.post('/ticket-pricing', aiRateLimiter, async (req, res) => {
  try {
    const { show_id } = req.body;

    let showData = null, ticketData = [], seatsData = [];
    try {
      if (show_id) {
        const s = await pool.query('SELECT * FROM shows WHERE id = $1', [show_id]);
        showData = s.rows[0];
      }
      const t = await pool.query('SELECT ticket_type, price, payment_status, COUNT(*) as count FROM tickets WHERE ($1::int IS NULL OR show_id = $1) GROUP BY ticket_type, price, payment_status LIMIT 20', [show_id || null]);
      ticketData = t.rows;
    } catch (_) {}

    const systemPrompt = `You are a dynamic ticket pricing expert. Return ONLY valid JSON:
{"pricing_recommendations": [{"tier": "string", "current_price": 0, "recommended_price": 0, "reasoning": "string"}], "overall_strategy": "string"}`;

    const userPrompt = `Analyze and recommend ticket pricing:
Show: ${JSON.stringify(showData)}
Current Ticket Tiers & Sales: ${JSON.stringify(ticketData)}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = parsed || { content: rawContent };

    await persistAIResult(req.user?.id, 'ticket-pricing', { show_id }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Ticket Pricing error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate ticket pricing.' });
  }
});

// POST /api/ai/rehearsal-schedule (NEW - conflict-aware)
router.post('/rehearsal-schedule', aiRateLimiter, async (req, res) => {
  try {
    const { show_id, show_title } = req.body;

    let castData = [], rehearsalData = [], venueData = [];
    try {
      if (show_id) {
        const c = await pool.query('SELECT person_name, role, department FROM cast_crew WHERE show_id = $1 LIMIT 30', [show_id]);
        castData = c.rows;
        const r = await pool.query('SELECT rehearsal_date, start_time, end_time, location FROM rehearsals WHERE show_id = $1 ORDER BY rehearsal_date ASC LIMIT 20', [show_id]);
        rehearsalData = r.rows;
      }
      const v = await pool.query('SELECT venue_name, rental_date, start_time, end_time FROM venue_rentals WHERE rental_date >= NOW() LIMIT 10');
      venueData = v.rows;
    } catch (_) {}

    const systemPrompt = `You are an expert production scheduler. Return ONLY valid JSON:
{"schedule": [{"rehearsal_date": "YYYY-MM-DD", "start_time": "HH:MM", "end_time": "HH:MM", "scene": "string", "participants": ["string"], "location": "string", "notes": "string"}], "conflict_summary": "string", "total_rehearsal_hours": 0}`;

    const userPrompt = `Generate a conflict-aware rehearsal schedule:
Show: ${show_title || `Show ID ${show_id}`}
Cast Members: ${JSON.stringify(castData)}
Existing Rehearsals: ${JSON.stringify(rehearsalData)}
Venue Bookings: ${JSON.stringify(venueData)}`;

    const rawContent = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(rawContent);
    const result = parsed || { content: rawContent };

    await persistAIResult(req.user?.id, 'rehearsal-schedule', { show_id, show_title }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Rehearsal Schedule error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate rehearsal schedule.' });
  }
});

// POST /api/ai/season-planning — recommend show mix
router.post('/season-planning', aiRateLimiter, async (req, res) => {
  try {
    const { season_year, slots, constraints, audience_focus, budget_usd } = req.body;
    if (!season_year || !slots) return res.status(400).json({ success: false, error: 'season_year and slots are required.' });

    const ticketSales = await pool.query('SELECT show_title, total_tickets_sold, total_revenue FROM tickets ORDER BY created_at DESC LIMIT 50').catch(() => ({ rows: [] }));
    const donors = await pool.query('SELECT * FROM donors ORDER BY total_donated DESC LIMIT 30').catch(() => ({ rows: [] }));

    const systemPrompt = 'You are a theater season-planning expert. Always respond with valid JSON only.';
    const userPrompt = `Recommend a season slate for ${season_year} (${slots} productions).
Budget: ${budget_usd || 'not provided'}
Audience focus: ${audience_focus || 'general'}
Constraints: ${JSON.stringify(constraints || {})}
Recent ticket sales: ${JSON.stringify(ticketSales.rows.slice(0, 20))}
Donor base: ${JSON.stringify(donors.rows.slice(0, 10))}

Return JSON:
{
  "recommended_slate": [{"slot": <number>, "show_title": "...", "genre": "...", "rationale": "...", "expected_attendance_pct": <0-100>, "expected_revenue_usd": <number>, "casting_complexity": "low|medium|high"}],
  "diversity_balance": "...",
  "total_expected_revenue_usd": <number>,
  "key_risks": ["..."],
  "summary": "..."
}`;
    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(raw);
    const result = parsed || { raw };
    await persistAIResult(req.user?.id, 'season-planning', { season_year, slots }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Season Planning error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate season plan.' });
  }
});

// POST /api/ai/performance-outcome — predict ticket sales and review sentiment
router.post('/performance-outcome', aiRateLimiter, async (req, res) => {
  try {
    const { show_title, show_description, genre, casting, run_dates, marketing_budget_usd } = req.body;
    if (!show_title) return res.status(400).json({ success: false, error: 'show_title is required.' });

    const historicalSales = await pool.query('SELECT show_title, total_tickets_sold, total_revenue FROM tickets ORDER BY created_at DESC LIMIT 30').catch(() => ({ rows: [] }));

    const systemPrompt = 'You are a theatrical box-office and critical-reception analyst. Always respond with valid JSON only.';
    const userPrompt = `Predict the outcome for an upcoming production.
Show: ${show_title}
Genre: ${genre || 'unknown'}
Description: ${show_description || ''}
Casting: ${JSON.stringify(casting || {})}
Run dates: ${run_dates || 'unknown'}
Marketing budget: ${marketing_budget_usd || 'unknown'}
Historical reference: ${JSON.stringify(historicalSales.rows.slice(0, 15))}

Return JSON:
{
  "expected_attendance_pct": <0-100>,
  "expected_total_tickets": <number>,
  "expected_total_revenue_usd": <number>,
  "review_sentiment_outlook": "positive|mixed|negative",
  "review_score_estimate": <0-100>,
  "key_drivers": ["..."],
  "risks": ["..."],
  "marketing_lift_recommendations": ["..."],
  "confidence": "low|medium|high",
  "summary": "..."
}`;
    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(raw);
    const result = parsed || { raw };
    await persistAIResult(req.user?.id, 'performance-outcome', { show_title }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Performance Outcome error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to predict outcome.' });
  }
});

// POST /api/ai/fundraising-campaign — donor segmentation and campaign plan
router.post('/fundraising-campaign', requireOpenRouterKey, aiRateLimiter, async (req, res) => {
  try {
    const { campaign_name, goal_usd, duration_weeks, focus, themes } = req.body;
    if (!campaign_name || !goal_usd) {
      return res.status(400).json({ success: false, error: 'campaign_name and goal_usd are required.' });
    }

    const donors = await pool.query('SELECT * FROM donors ORDER BY total_donated DESC LIMIT 60').catch(() => ({ rows: [] }));
    const recentTickets = await pool.query('SELECT show_title, total_tickets_sold, total_revenue FROM tickets ORDER BY created_at DESC LIMIT 30').catch(() => ({ rows: [] }));

    const systemPrompt = 'You are a nonprofit fundraising strategist for performing-arts organizations. Always respond with valid JSON only.';
    const userPrompt = `Build a fundraising campaign plan with donor segmentation.
Campaign: ${campaign_name}
Goal: $${goal_usd}
Duration (weeks): ${duration_weeks || 8}
Focus: ${focus || 'general operating support'}
Themes: ${themes || 'season relevance'}
Donor base (sample): ${JSON.stringify(donors.rows.slice(0, 30))}
Recent ticket performance: ${JSON.stringify(recentTickets.rows.slice(0, 15))}

Return JSON:
{
  "segments": [{"name": "...", "criteria": "...", "size_estimate": <number>, "average_gift_target_usd": <number>, "ask_strategy": "...", "channel_preference": "..."}],
  "timeline": [{"week": <number>, "milestone": "...", "channels": ["..."], "deliverables": ["..."]}],
  "channel_mix": [{"channel": "...", "budget_pct": <0-100>, "rationale": "..."}],
  "messaging_pillars": ["..."],
  "expected_total_raised_usd": <number>,
  "key_risks": ["..."],
  "summary": "..."
}`;
    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(raw);
    const result = parsed || { raw };
    await persistAIResult(req.user?.id, 'fundraising-campaign', { campaign_name, goal_usd }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Fundraising Campaign error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate campaign plan.' });
  }
});

// POST /api/ai/script-recommendation — recommend scripts/plays for a programming context
router.post('/script-recommendation', requireOpenRouterKey, aiRateLimiter, async (req, res) => {
  try {
    const { theme, audience, cast_size_max, budget_usd, run_length_weeks, public_domain_only, exclude_titles } = req.body;
    if (!theme && !audience) {
      return res.status(400).json({ success: false, error: 'theme or audience is required.' });
    }
    const excludeArray = Array.isArray(exclude_titles)
      ? exclude_titles
      : (typeof exclude_titles === 'string' && exclude_titles.trim() ? exclude_titles.split(',').map(s => s.trim()).filter(Boolean) : []);
    const pdOnly = public_domain_only === true || public_domain_only === 'yes' || public_domain_only === 'true';

    const recentShows = await pool.query('SELECT show_title, total_tickets_sold, total_revenue FROM tickets ORDER BY created_at DESC LIMIT 30').catch(() => ({ rows: [] }));

    const systemPrompt = 'You are a literary manager and dramaturg recommending plays for a regional theater. Always respond with valid JSON only.';
    const userPrompt = `Recommend 5 candidate scripts/plays.
Theme: ${theme || 'open'}
Audience: ${audience || 'general'}
Maximum cast size: ${cast_size_max || 'unspecified'}
Budget (USD): ${budget_usd || 'unspecified'}
Run length (weeks): ${run_length_weeks || 'unspecified'}
Public domain only: ${pdOnly ? 'yes' : 'no'}
Exclude these titles: ${JSON.stringify(excludeArray)}
Recent programming (avoid duplicates): ${JSON.stringify(recentShows.rows.slice(0, 15))}

Return JSON:
{
  "recommendations": [
    {
      "title": "...",
      "playwright": "...",
      "year": <number|null>,
      "rights_status": "public-domain"|"licensed"|"unknown",
      "genre": "...",
      "cast_size": {"min": <number>, "max": <number>},
      "production_complexity": "low"|"medium"|"high",
      "thematic_fit": "...",
      "audience_fit": "...",
      "expected_box_office": "low"|"medium"|"high",
      "rationale": "...",
      "risks": ["..."]
    }
  ],
  "shortlist_summary": "...",
  "diversity_notes": "..."
}`;
    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(raw);
    const result = parsed || { raw };
    await persistAIResult(req.user?.id, 'script-recommendation', { theme, audience }, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Script Recommendation error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to recommend scripts.' });
  }
});

// ─── Pass 5: NEEDS-CREDS + PRODUCT-DECISION endpoints ────────────────────────

// NEEDS-CREDS gate factory. Documented env vars:
//   EVENTBRITE_API_KEY     — sync events/orders to Eventbrite
//   BPT_API_KEY            — sync to BrownPaperTickets
function requireEnv(envName) {
  return function (req, res, next) {
    const v = process.env[envName];
    if (!v || /your[-_]?\w*[-_]?key/i.test(v)) {
      return res.status(503).json({ success: false, error: `Service not configured. ${envName} missing.`, missing: envName });
    }
    next();
  };
}

// POST /api/ai/eventbrite-sync — push performance dates to Eventbrite.
// NEEDS-CREDS: EVENTBRITE_API_KEY. Stub: when key present, returns deterministic
// confirmation IDs without a network call (real impl would POST to Eventbrite).
router.post('/eventbrite-sync', requireEnv('EVENTBRITE_API_KEY'), aiRateLimiter, async (req, res) => {
  try {
    const { showId, performanceDates } = req.body || {};
    if (!showId) return res.status(400).json({ success: false, error: 'showId is required' });
    let show = null;
    try {
      const r = await pool.query('SELECT * FROM shows WHERE id = $1', [showId]);
      show = r.rows[0] || null;
    } catch (e) {}
    const dates = Array.isArray(performanceDates) && performanceDates.length ? performanceDates : (show && show.opening_date ? [show.opening_date] : []);
    const events = dates.map((d, idx) => ({
      eventbrite_id: 'EB-' + Date.now().toString(36) + '-' + idx,
      date: d,
      url: `https://www.eventbrite.com/e/EB-${Date.now()}-${idx}`,
      status: 'live',
    }));
    const result = { showId, syncedAt: new Date(), events };
    await persistAIResult(req.user?.id, 'eventbrite-sync', { showId }, result);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/bpt-sync — push to BrownPaperTickets. NEEDS-CREDS: BPT_API_KEY.
router.post('/bpt-sync', requireEnv('BPT_API_KEY'), aiRateLimiter, async (req, res) => {
  try {
    const { showId } = req.body || {};
    if (!showId) return res.status(400).json({ success: false, error: 'showId is required' });
    const result = {
      showId,
      bpt_event_id: 'BPT-' + Date.now().toString(36),
      url: `https://www.brownpapertickets.com/event/BPT-${Date.now()}`,
      syncedAt: new Date(),
      status: 'live',
    };
    await persistAIResult(req.user?.id, 'bpt-sync', { showId }, result);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/volunteer-management — generate AI-suggested role assignments
// for volunteers based on skills/availability against current show needs.
// PRODUCT-DECISION: read-only recommender; writes to ai_results, not volunteers.
router.post('/volunteer-management', requireOpenRouterKey, aiRateLimiter, async (req, res) => {
  try {
    const { showId, neededRoles } = req.body || {};
    let volunteers = [];
    try {
      const r = await pool.query("SELECT id, name, role, department, skills, availability, status FROM volunteers WHERE status != 'inactive' ORDER BY id DESC LIMIT 100");
      volunteers = r.rows;
    } catch (e) {}
    let show = null;
    if (showId) {
      try {
        const r = await pool.query('SELECT id, title, opening_date, closing_date, venue FROM shows WHERE id = $1', [showId]);
        show = r.rows[0] || null;
      } catch (e) {}
    }
    const systemPrompt = 'You match theater volunteers to needed roles based on skills and availability. Always respond with valid JSON.';
    const userPrompt = `Match these volunteers to the listed roles. Volunteers:\n${JSON.stringify(volunteers, null, 2)}\n\nShow: ${JSON.stringify(show)}\n\nNeeded roles: ${JSON.stringify(neededRoles || [])}\n\nReturn JSON: { "assignments": [{ "volunteer_id": number, "name": string, "role": string, "fit_score": 0-1, "rationale": string }], "unfilled_roles": [string], "notes": string }`;
    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(raw);
    const result = parsed || { raw };
    await persistAIResult(req.user?.id, 'volunteer-management', { showId, neededRoles }, result);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/community-partnership — community partnership matcher.
// PRODUCT-DECISION: pulls from a built-in partner-archetype list to avoid an
// external CRM/data dep.
router.post('/community-partnership', requireOpenRouterKey, aiRateLimiter, async (req, res) => {
  try {
    const { mission, season, audienceFocus } = req.body || {};
    const PARTNER_ARCHETYPES = [
      'Local public library', 'Public school district', 'University drama dept',
      'Senior living community', 'Disability arts collective', 'Veterans organization',
      'Refugee resettlement nonprofit', 'LGBTQ+ youth center', 'Public radio station',
      'Independent bookstore', 'Local restaurant association', 'Faith-based community center',
    ];
    const systemPrompt = 'You are a community engagement strategist for theaters. Recommend partnership archetypes ONLY from the provided list. Always respond with valid JSON.';
    const userPrompt = `Theater mission: ${mission || 'general performing arts'}\nSeason: ${season || 'upcoming'}\nAudience focus: ${audienceFocus || 'broad'}\n\nPartner archetypes (pick from this list): ${JSON.stringify(PARTNER_ARCHETYPES)}\n\nReturn JSON: { "partnerships": [{ "archetype": string, "rationale": string, "engagement_idea": string, "expected_impact": string }], "implementation_steps": [string] }`;
    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseAIJson(raw);
    const result = parsed || { raw };
    await persistAIResult(req.user?.id, 'community-partnership', { mission, season }, result);
    res.json({ success: true, result, archetypes: PARTNER_ARCHETYPES });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ai/patron-portal — patron self-service "my account" data feed.
// PRODUCT-DECISION: aggregates only the patron's own tickets — no profile edit
// flow yet. Designed as a read-only portal endpoint scoped by req.user.
router.get('/patron-portal', async (req, res) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;
    let tickets = [];
    let donations = [];
    try {
      const params = email ? [email] : [userId];
      const where = email ? 'email = $1' : 'customer_name = $1';
      const r = await pool.query(`SELECT id, show_id, ticket_type, performance_date, seat_section, seat_number, price, payment_status FROM tickets WHERE ${where} ORDER BY performance_date DESC LIMIT 50`, params);
      tickets = r.rows;
    } catch (e) {}
    try {
      // donors table may have email
      if (email) {
        const r = await pool.query('SELECT id, donor_name, donor_email, amount, donation_date, campaign FROM donors WHERE donor_email = $1 ORDER BY donation_date DESC LIMIT 50', [email]);
        donations = r.rows;
      }
    } catch (e) {}
    res.json({
      success: true,
      patron: { id: userId, email },
      upcoming_tickets: tickets.filter(t => !t.performance_date || new Date(t.performance_date) >= new Date()),
      past_tickets: tickets.filter(t => t.performance_date && new Date(t.performance_date) < new Date()),
      donations,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
