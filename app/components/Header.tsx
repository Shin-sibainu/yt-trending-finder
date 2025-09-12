export default function Header() {
  return (
    <header className="header-modern">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.582 6.186a2.506 2.506 0 0 0-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418c-.86.23-1.538.908-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814c.23.86.908 1.538 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418a2.506 2.506 0 0 0 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814z" fill="#FF0000"/>
              <path d="M10 15.5V8.5l6 3.5-6 3.5z" fill="#fff"/>
            </svg>
          </div>
          <div className="logo-text">
            <h1 className="logo-title">YouTube Trending Finder</h1>
            <p className="logo-subtitle">急上昇動画をAIスコアで発見</p>
          </div>
        </div>
        <nav className="header-nav">
          <div className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-text">トレンド分析</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🔥</span>
            <span className="nav-text">人気急上昇</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">💡</span>
            <span className="nav-text">使い方</span>
          </div>
        </nav>
      </div>
    </header>
  );
}