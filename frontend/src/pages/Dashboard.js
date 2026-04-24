import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { featureCategories, getFeaturesByCategory } from '../config/features';

const categoryIcons = {
  'Production': '\uD83C\uDFAC',
  'Operations': '\u2699\uFE0F',
  'Finance': '\uD83D\uDCB5',
  'AI Tools': '\uD83E\uDD16',
};

function Dashboard() {
  const navigate = useNavigate();

  const handleCardClick = (feature) => {
    if (feature.isAI) {
      navigate(`/ai/${feature.key}`);
    } else {
      navigate(`/features/${feature.key}`);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome to Your Theater</h1>
          <p>Manage every aspect of your performing arts organization</p>
        </div>

        {featureCategories.map((category) => {
          const categoryFeatures = getFeaturesByCategory(category);
          return (
            <div key={category} className="dashboard-category">
              <div className="category-header">
                <span className="category-icon">{categoryIcons[category]}</span>
                <h2>{category}</h2>
                <div className="category-line"></div>
              </div>
              <div className="cards-grid">
                {categoryFeatures.map((feature) => (
                  <div
                    key={feature.key}
                    className={`feature-card ${feature.isAI ? 'ai-card' : ''}`}
                    onClick={() => handleCardClick(feature)}
                  >
                    <div className="card-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    {feature.isAI && <span className="ai-badge">AI Powered</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
