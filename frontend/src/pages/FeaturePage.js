import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import features from '../config/features';

const API_URL = 'http://localhost:4060';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

function formatValue(value, type) {
  if (value === null || value === undefined || value === '') return '--';
  if (type === 'date') {
    try {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch { return value; }
  }
  if (type === 'currency') {
    const num = parseFloat(value);
    return isNaN(num) ? value : `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return String(value);
}

function FeaturePage() {
  const { featureName } = useParams();
  const feature = features[featureName];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('detail'); // detail, add, edit
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!feature) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}${feature.apiPath}`, { headers: getAuthHeader() });
      const items = res.data.data || res.data || [];
      setData(Array.isArray(items) ? items : []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [feature]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!feature) {
    return (
      <div className="app-container">
        <Navbar title="Not Found" />
        <div className="content-area">
          <div className="empty-state">
            <h2>Feature not found</h2>
            <p>The requested feature does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const openAdd = () => {
    const initial = {};
    feature.formFields.forEach(f => { initial[f.key] = ''; });
    setFormData(initial);
    setModalMode('add');
    setShowModal(true);
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setModalMode('detail');
    setShowModal(true);
  };

  const openEdit = () => {
    const initial = {};
    feature.formFields.forEach(f => {
      let val = selectedItem[f.key] || '';
      if (f.type === 'date' && val) {
        try { val = new Date(val).toISOString().split('T')[0]; } catch {}
      }
      initial[f.key] = val;
    });
    setFormData(initial);
    setModalMode('edit');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalMode('detail');
    setFormData({});
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modalMode === 'add') {
        await axios.post(`${API_URL}${feature.apiPath}`, formData, { headers: getAuthHeader() });
      } else if (modalMode === 'edit') {
        const id = selectedItem.id || selectedItem._id;
        await axios.put(`${API_URL}${feature.apiPath}/${id}`, formData, { headers: getAuthHeader() });
      }
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
    setSaving(true);
    try {
      const id = selectedItem.id || selectedItem._id;
      await axios.delete(`${API_URL}${feature.apiPath}/${id}`, { headers: getAuthHeader() });
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const getFieldType = (key) => {
    const field = feature.formFields.find(f => f.key === key);
    return field?.type || 'text';
  };

  const getFieldLabel = (key) => {
    const field = feature.formFields.find(f => f.key === key);
    if (field) return field.label;
    const col = feature.columns.find(c => c.key === key);
    return col?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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
          rows={3}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
      );
    }
    const inputType = field.type === 'currency' ? 'number' : field.type === 'email' ? 'email' : field.type;
    return (
      <input
        type={inputType}
        value={value}
        onChange={(e) => handleInputChange(field.key, e.target.value)}
        required={field.required}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        step={field.type === 'currency' ? '0.01' : undefined}
      />
    );
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
          <button className="btn btn-primary" onClick={openAdd}>
            + Add New
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading {feature.title.toLowerCase()}...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{feature.icon}</div>
            <h2>No {feature.title} Yet</h2>
            <p>Get started by adding your first entry.</p>
            <button className="btn btn-primary" onClick={openAdd}>
              + Add {feature.title.slice(0, -1) || feature.title}
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {feature.columns.map(col => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.id || item._id || idx} onClick={() => openDetail(item)}>
                    {feature.columns.map(col => (
                      <td key={col.key}>
                        {col.type === 'text' && item[col.key] ? (
                          <span className={`cell-text ${col.key === 'status' || col.key === 'payment_status' ? 'status-badge status-' + String(item[col.key]).toLowerCase().replace(/\s+/g, '-') : ''}`}>
                            {formatValue(item[col.key], col.type)}
                          </span>
                        ) : (
                          formatValue(item[col.key], col.type)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {modalMode === 'add' && `Add New ${feature.title}`}
                  {modalMode === 'edit' && `Edit ${feature.title}`}
                  {modalMode === 'detail' && `${feature.title} Details`}
                </h2>
                <button className="modal-close" onClick={closeModal}>&times;</button>
              </div>

              <div className="modal-body">
                {modalMode === 'detail' && selectedItem && (
                  <div className="detail-grid">
                    {Object.entries(selectedItem).map(([key, value]) => {
                      if (key === 'id' || key === '_id' || key === '__v') return null;
                      return (
                        <div key={key} className="detail-item">
                          <label>{getFieldLabel(key)}</label>
                          <span>{formatValue(value, getFieldType(key))}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(modalMode === 'add' || modalMode === 'edit') && (
                  <form onSubmit={handleSave}>
                    {feature.formFields.map(field => (
                      <div key={field.key} className="form-group">
                        <label>{field.label} {field.required && <span className="required">*</span>}</label>
                        {renderFormField(field)}
                      </div>
                    ))}
                    {error && <div className="error-message">{error}</div>}
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : modalMode === 'add' ? 'Create' : 'Update'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={closeModal}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {modalMode === 'detail' && (
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={openEdit}>Edit</button>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                    {saving ? 'Deleting...' : 'Delete'}
                  </button>
                  <button className="btn btn-secondary" onClick={closeModal}>Close</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeaturePage;
