import React, { useEffect, useState } from 'react';
import axios from 'axios';

const empty = { show_id: '', role_name: '', eligibility: '', min_age: '', max_age: '', gender_pref: 'Any', required_skills: '', union_required: 'No', notes: '' };

function CastingRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const load = () => axios.get(`${window.__API_BASE__ || ''}/api/custom-views/casting-rules`, auth())
    .then(res => setRules(res.data.data || []))
    .catch(e => setMsg(e.message));

  useEffect(() => { load(); }, []);

  const handleChange = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editingId) {
        await axios.put(`${window.__API_BASE__ || ''}/api/custom-views/casting-rules/${editingId}`, form, auth());
        setMsg('Updated.');
      } else {
        await axios.post(`${window.__API_BASE__ || ''}/api/custom-views/casting-rules`, form, auth());
        setMsg('Created.');
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setForm({
      show_id: r.show_id || '',
      role_name: r.role_name || '',
      eligibility: r.eligibility || '',
      min_age: r.min_age || '',
      max_age: r.max_age || '',
      gender_pref: r.gender_pref || 'Any',
      required_skills: r.required_skills || '',
      union_required: r.union_required || 'No',
      notes: r.notes || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this casting rule?')) return;
    await axios.delete(`${window.__API_BASE__ || ''}/api/custom-views/casting-rules/${id}`, auth());
    load();
  };

  const inputStyle = { padding: 6, border: '1px solid #ccc', borderRadius: 4, width: '100%' };

  return (
    <div data-testid="casting-rules-editor" style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0, color: '#8B0000' }}>Casting Rules Editor</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <input style={inputStyle} placeholder="Role Name *" value={form.role_name} onChange={e => handleChange('role_name', e.target.value)} required />
        <input style={inputStyle} type="number" placeholder="Show ID" value={form.show_id} onChange={e => handleChange('show_id', e.target.value)} />
        <select style={inputStyle} value={form.gender_pref} onChange={e => handleChange('gender_pref', e.target.value)}>
          <option>Any</option><option>Female</option><option>Male</option><option>Non-binary</option>
        </select>
        <input style={inputStyle} type="number" placeholder="Min Age" value={form.min_age} onChange={e => handleChange('min_age', e.target.value)} />
        <input style={inputStyle} type="number" placeholder="Max Age" value={form.max_age} onChange={e => handleChange('max_age', e.target.value)} />
        <select style={inputStyle} value={form.union_required} onChange={e => handleChange('union_required', e.target.value)}>
          <option>No</option><option>Yes</option>
        </select>
        <input style={{ ...inputStyle, gridColumn: 'span 3' }} placeholder="Eligibility criteria" value={form.eligibility} onChange={e => handleChange('eligibility', e.target.value)} />
        <input style={{ ...inputStyle, gridColumn: 'span 3' }} placeholder="Required skills" value={form.required_skills} onChange={e => handleChange('required_skills', e.target.value)} />
        <input style={{ ...inputStyle, gridColumn: 'span 3' }} placeholder="Notes" value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
        <button type="submit" style={{ padding: '8px 16px', background: '#8B0000', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', gridColumn: 'span 2' }}>
          {editingId ? 'Update Rule' : 'Add Rule'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm(empty); }}
            style={{ padding: '8px 16px', background: '#888', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
        )}
      </form>
      {msg && <div style={{ marginBottom: 10, color: msg.startsWith('Error') ? 'crimson' : 'green' }}>{msg}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 6, textAlign: 'left' }}>Role</th>
            <th style={{ padding: 6, textAlign: 'left' }}>Show</th>
            <th style={{ padding: 6 }}>Age</th>
            <th style={{ padding: 6 }}>Gender</th>
            <th style={{ padding: 6 }}>Union</th>
            <th style={{ padding: 6, textAlign: 'left' }}>Skills</th>
            <th style={{ padding: 6 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.length === 0 && <tr><td colSpan={7} style={{ padding: 12, color: '#888' }}>No casting rules yet.</td></tr>}
          {rules.map(r => (
            <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: 6 }}>{r.role_name}</td>
              <td style={{ padding: 6 }}>{r.show_title || '-'}</td>
              <td style={{ padding: 6, textAlign: 'center' }}>{r.min_age || '?'}-{r.max_age || '?'}</td>
              <td style={{ padding: 6, textAlign: 'center' }}>{r.gender_pref}</td>
              <td style={{ padding: 6, textAlign: 'center' }}>{r.union_required}</td>
              <td style={{ padding: 6 }}>{r.required_skills}</td>
              <td style={{ padding: 6, textAlign: 'center' }}>
                <button onClick={() => handleEdit(r)} style={{ marginRight: 4, padding: '2px 8px', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => handleDelete(r.id)} style={{ padding: '2px 8px', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CastingRulesEditor;
