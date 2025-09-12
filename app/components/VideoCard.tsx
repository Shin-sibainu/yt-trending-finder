type VideoItem = {
  id: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  thumbnailUrl: string;
  views: number;
  subscribers: number | null;
  publishedAt: string;
  isShort: boolean;
  vsr: number;
  score: number;
};

type VideoCardProps = {
  video: VideoItem;
};

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noreferrer"
      className="video-card-modern"
    >
      <div className="video-thumbnail">
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
        {video.isShort && (
          <span className="shorts-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.3 6.3a1 1 0 0 1 1.4 1.4l-9 9a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L9 14.6l8.3-8.3z"/>
            </svg>
            Shorts
          </span>
        )}
        <div className="video-duration">{formatDate(video.publishedAt)}</div>
      </div>
      
      <div className="video-details">
        <h3 className="video-title-text" title={video.title}>
          {video.title}
        </h3>
        
        <div className="video-channel">
          <div className="channel-avatar">
            {video.channelTitle.charAt(0).toUpperCase()}
          </div>
          <span className="channel-name">{video.channelTitle}</span>
        </div>
        
        <div className="video-stats">
          <div className="stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {formatViews(video.views)}回
          </div>
          {video.subscribers && (
            <div className="stat-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {formatViews(video.subscribers)}人
            </div>
          )}
        </div>
        
        <div className="video-metrics">
          <div className="metric-badge score">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
            Score: {video.score.toFixed(1)}
          </div>
          {video.vsr > 5 && (
            <div className="metric-badge vsr">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15h-9V6h9v13z"/>
              </svg>
              VSR: {video.vsr.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}