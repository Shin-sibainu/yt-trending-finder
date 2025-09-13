"use client";

export default function SkeletonLoader() {
  return (
    <div className="skeleton-container">
      <div className="skeleton-grid">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-thumbnail"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-subtitle"></div>
              <div className="skeleton-stats">
                <div className="skeleton-stat"></div>
                <div className="skeleton-stat"></div>
                <div className="skeleton-stat"></div>
              </div>
              <div className="skeleton-badges">
                <div className="skeleton-badge"></div>
                <div className="skeleton-badge"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}