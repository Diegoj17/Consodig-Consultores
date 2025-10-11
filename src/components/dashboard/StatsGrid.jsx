import React from 'react';
import StatCard from './StatCard';
import '../../styles/dashboard/StatsGrid.css';

const StatsGrid = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          type={stat.type}
        />
      ))}
    </div>
  );
};

export default StatsGrid;