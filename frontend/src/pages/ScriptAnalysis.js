import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:4060';
function getAuthHeader() { return { Authorization: `Bearer ${localStorage.getItem('token')}` }; }

export default function ScriptAnalysis() {
  const [title, setTitle] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!scriptText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.post(`${API_URL}/api/ai/script-analysis`, { title, script_text: scriptText }, { headers: getAuthHeader() });
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar title="Script Analysis" />
      <div className="content-area">
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-icon">📜</span>
            <div>
              <h1>Script Analysis & Cast Breakdown</h1>
              <p>AI analyzes script text to extract characters, scenes, props, and runtime estimates</p>
            </div>
          </div>
          <span className="ai-badge-large">AI Powered</span>
        </div>

        <div className="ai-layout">
          <div className="ai-input-panel">
            <div className="panel-card">
              <h3>Input Script</h3>
              <div className="form-group">
                <label>Script Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Hamlet" />
              </div>
              <div className="form-group">
                <label>Script Text <span className="required">*</span></label>
                <textarea
                  value={scriptText}
                  onChange={e => setScriptText(e.target.value)}
                  rows={12}
                  placeholder="Paste your script text here... (first 8000 characters will be analyzed)"
                  style={{ fontFamily: 'monospace', fontSize: 12 }}
                />
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                  {scriptText.length} characters (max 8000 analyzed)
                </div>
              </div>
              <button className="btn btn-gold btn-full" onClick={analyze} disabled={loading || !scriptText.trim()}>
                {loading ? <span className="btn-loading"><span className="spinner-small"></span>Analyzing...</span> : 'Analyze Script with AI'}
              </button>
            </div>
          </div>

          <div className="ai-output-panel">
            {!result && !loading && !error && (
              <div className="ai-placeholder">
                <div className="ai-placeholder-icon">✨</div>
                <h3>Script Analysis Results</h3>
                <p>Paste your script and click Analyze to extract characters, scenes, props, and set requirements.</p>
              </div>
            )}
            {loading && <div className="ai-loading"><div className="spinner"></div><h3>Analyzing Script...</h3></div>}
            {error && <div className="ai-error"><p>{error}</p></div>}
            {result && (
              <div className="ai-result">
                <div className="ai-result-header"><h2>Script Breakdown</h2></div>
                <div className="ai-result-content">
                  {result.characters && (
                    <div className="ai-section-card">
                      <h3 className="ai-section-heading">Characters ({result.characters.length})</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                        {result.characters.map((c, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10 }}>
                            <div style={{ fontWeight: 700, color: '#b8860b' }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: '#888' }}>{c.role}</div>
                            {c.pages && <div style={{ fontSize: 11, color: '#666' }}>~{c.pages} pages</div>}
                            {c.required_skills?.length > 0 && (
                              <div style={{ marginTop: 4 }}>
                                {c.required_skills.map((sk, j) => (
                                  <span key={j} style={{ fontSize: 10, background: 'rgba(184,134,11,0.1)', color: '#b8860b', padding: '1px 6px', borderRadius: 8, marginRight: 3 }}>{sk}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.scenes && (
                    <div className="ai-section-card">
                      <h3 className="ai-section-heading">Scenes ({result.scenes.length})</h3>
                      {result.scenes.map((s, i) => (
                        <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #222', fontSize: 13 }}>
                          <span style={{ color: '#b8860b', fontWeight: 600 }}>Scene {s.number}</span>
                          <span style={{ color: '#888', marginLeft: 8 }}>{s.location}</span>
                          <span style={{ color: '#666', marginLeft: 8, fontSize: 11 }}>{(s.characters || []).join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.props_list && (
                    <div className="ai-section-card">
                      <h3 className="ai-section-heading">Props List</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {result.props_list.map((p, i) => (
                          <span key={i} style={{ background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 12, fontSize: 12 }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.set_requirements && (
                    <div className="ai-section-card">
                      <h3 className="ai-section-heading">Set Requirements</h3>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {result.set_requirements.map((s, i) => <li key={i} style={{ fontSize: 13, color: '#ccc', marginBottom: 4 }}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {result.estimated_runtime && (
                    <div className="ai-section-card">
                      <h3 className="ai-section-heading">Estimated Runtime</h3>
                      <div style={{ fontSize: 20, color: '#b8860b', fontWeight: 700 }}>{result.estimated_runtime}</div>
                    </div>
                  )}
                  {result.content && (
                    <div className="ai-section-card">
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{result.content}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
