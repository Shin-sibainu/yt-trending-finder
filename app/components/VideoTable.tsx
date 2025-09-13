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

type VideoTableProps = {
  videos: VideoItem[];
  onZoom?: (videoId: string, title: string) => void;
};

function formatNumber(num: number): string {
  return num.toLocaleString('ja-JP');
}

export default function VideoTable({ videos, onZoom }: VideoTableProps) {
  return (
    <div className="table-container">
      <table className="video-table">
        <thead>
          <tr>
            <th className="th-thumbnail"></th>
            <th className="th-title">タイトル / チャンネル</th>
            <th className="th-views">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              再生数
            </th>
            <th className="th-subscribers">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              登録者
            </th>
            <th className="th-vsr">VSR</th>
            <th className="th-date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              公開日
            </th>
            <th className="th-score">Score</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => (
            <tr key={video.id} className="table-row">
              <td className="td-thumbnail">
                <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" className="thumbnail-link">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="table-thumbnail"
                    loading="lazy"
                    onClick={(e) => { if (onZoom) { e.preventDefault(); onZoom(video.id, video.title); } }}
                    style={{ cursor: onZoom ? 'zoom-in' as const : 'pointer' }}
                  />
                  {video.isShort && (
                    <span className="table-shorts-badge">S</span>
                  )}
                </a>
              </td>
              <td className="td-title">
                <div className="title-cell">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="table-video-title"
                  >
                    {video.title}
                  </a>
                  <a
                    href={`https://www.youtube.com/channel/${video.channelId ?? ""}`}
                    target="_blank"
                    rel="noreferrer"
                    className="table-channel-name"
                  >
                    {video.channelTitle}
                  </a>
                </div>
              </td>
              <td className="td-views">
                <span className="views-value">{formatNumber(video.views)}</span>
              </td>
              <td className="td-subscribers">
                {video.subscribers ? (
                  <span className="subscribers-value">{formatNumber(video.subscribers)}</span>
                ) : (
                  <span className="no-data">-</span>
                )}
              </td>
              <td className="td-vsr">
                {(() => { const t = (video.vsr < 2 ? 0 : video.vsr < 5 ? 1 : video.vsr < 10 ? 2 : video.vsr < 20 ? 3 : 4); return (
                  <span className={`vsr-value tier-${t}`}>{video.vsr.toFixed(2)}</span>
                );})()}
              </td>
              <td className="td-date">
                {new Date(video.publishedAt).toLocaleDateString("ja-JP")}
              </td>
              <td className="td-score">
                {(() => { const t = (video.score < 2 ? 0 : video.score < 5 ? 1 : video.score < 10 ? 2 : video.score < 20 ? 3 : 4); return (
                  <span className={`score-value tier-${t}`}>{video.score.toFixed(2)}</span>
                );})()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
