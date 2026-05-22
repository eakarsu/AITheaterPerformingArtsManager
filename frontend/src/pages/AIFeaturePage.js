import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import features from '../config/features';

const API_URL = 'http://localhost:4060';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

function AIFeaturePage() {
  const { featureName } = useParams();
  const feature = features[featureName];
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!feature || !feature.isAI) {
    return (
      <div className="app-container">
        <Navbar title="Not Found" />
        <div className="content-area">
          <div className="empty-state">
            <h2>AI Feature not found</h2>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    try {
      const res = await axios.post(`${API_URL}${feature.apiPath}`, formData, {
        headers: getAuthHeader()
      });
      const data = res.data;
      if (data.success && data.result) {
        setResult(data.result);
      } else if (data.result) {
        setResult(data.result);
      } else {
        setResult(data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || err.response?.data?.error || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    let text = '';
    if (result.title) text += result.title + '\n\n';
    if (result.content) text += result.content + '\n\n';
    if (result.sections && Array.isArray(result.sections)) {
      result.sections.forEach(s => {
        text += (s.heading || '') + '\n' + (s.body || '') + '\n\n';
      });
    }
    navigator.clipboard.writeText(text.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGenerateAgain = () => {
    setResult(null);
    setError('');
    setCopied(false);
  };

  const renderFormField = (field) => {
    const value = formData[field.key] || '';
    if (field.type === 'select') {
      return (
        <select value={value} onChange={(e) => handleInputChange(field.key, e.target.value)}>
          <option value="">Select {field.label}</option>
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          rows={4}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          required={field.required}
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(field.key, e.target.value)}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        required={field.required}
      />
    );
  };

  const renderContent = (text) => {
    if (!text) return null;
    // Split on double newlines for paragraphs, render with line breaks
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((para, i) => {
      // Handle bullet points
      if (para.includes('\n- ') || para.startsWith('- ')) {
        const lines = para.split('\n');
        return (
          <div key={i} className="ai-paragraph">
            {lines.map((line, j) => {
              if (line.startsWith('- ')) {
                return <div key={j} className="ai-bullet">{line.substring(2)}</div>;
              }
              return <p key={j}>{line}</p>;
            })}
          </div>
        );
      }
      // Handle numbered lists
      if (/^\d+\./.test(para)) {
        const lines = para.split('\n');
        return (
          <div key={i} className="ai-numbered-list">
            {lines.map((line, j) => (
              <div key={j} className="ai-numbered-item">{line}</div>
            ))}
          </div>
        );
      }
      // Handle bold text marked with **
      const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p
          key={i}
          className="ai-paragraph"
          dangerouslySetInnerHTML={{ __html: formatted.replace(/\n/g, '<br/>') }}
        />
      );
    });
  };

  return (
    <div className="app-container">
      <Navbar title={feature.title} />
      <div className="content-area">
        <div className="page-header">
          <div className="page-header-left">
            <span className="page-icon">{feature.icon}</span>
            <div>
              <h1>{feature.title}</h1>
              <p>{feature.description}</p>
            </div>
          </div>
          <span className="ai-badge-large">AI Powered</span>
        </div>

        <div className="ai-layout">
          {/* Input Form */}
          <div className="ai-input-panel">
            <div className="panel-card">
              <h3>Input Parameters</h3>
              <form onSubmit={handleGenerate}>
                {feature.aiFields.map(field => (
                  <div key={field.key} className="form-group">
                    <label>
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderFormField(field)}
                  </div>
                ))}
                <button
                  type="submit"
                  className="btn btn-gold btn-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-loading">
                      <span className="spinner-small"></span>
                      Generating...
                    </span>
                  ) : (
                    'Generate with AI'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Panel */}
          <div className="ai-output-panel">
            {!result && !loading && !error && (
              <div className="ai-placeholder">
                <div className="ai-placeholder-icon">{'\u2728'}</div>
                <h3>AI-Generated Content</h3>
                <p>Fill in the form and click "Generate with AI" to create professional content for your theater.</p>
              </div>
            )}

            {loading && (
              <div className="ai-loading">
                <div className="spinner"></div>
                <h3>Creating Your Content...</h3>
                <p>Our AI is crafting something special for your theater.</p>
              </div>
            )}

            {error && (
              <div className="ai-error">
                <div className="error-icon">{'\u26A0\uFE0F'}</div>
                <h3>Generation Failed</h3>
                <p>{error}</p>
                <button className="btn btn-secondary" onClick={() => setError('')}>Try Again</button>
              </div>
            )}

            {result && (
              <div className="ai-result">
                <div className="ai-result-header">
                  <h2>Generated Content</h2>
                  <div className="ai-result-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleCopy}
                    >
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={handleGenerateAgain}
                    >
                      Generate Again
                    </button>
                  </div>
                </div>

                <div className="ai-result-content">
                  {result.title && (
                    <h2 className="ai-result-title">{result.title}</h2>
                  )}

                  {result.content && (
                    <div className="ai-result-body">
                      {renderContent(result.content)}
                    </div>
                  )}

                  {result.sections && Array.isArray(result.sections) && result.sections.length > 0 && (
                    <div className="ai-sections">
                      {result.sections.map((section, idx) => (
                        <div key={idx} className="ai-section-card">
                          {section.heading && (
                            <h3 className="ai-section-heading">{section.heading}</h3>
                          )}
                          {section.body && (
                            <div className="ai-section-body">
                              {renderContent(section.body)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback: if result has other fields, render them */}
                  {!result.title && !result.content && !result.sections && (
                    <div className="ai-result-body">
                      {typeof result === 'string' ? (
                        renderContent(result)
                      ) : (
                        Object.entries(result).map(([key, value]) => (
                          <div key={key} className="ai-section-card">
                            <h3 className="ai-section-heading">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </h3>
                            <div className="ai-section-body">
                              {typeof value === 'string' ? renderContent(value) : (
                                <pre className="ai-pre">{JSON.stringify(value, null, 2)}</pre>
                              )}
                            </div>
                          </div>
                        ))
                      )}
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

export default AIFeaturePage;
