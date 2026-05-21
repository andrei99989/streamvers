export function getSourceThumbnail(url = '') {
  const value = String(url);

  const youtubeWatch = value.match(/[?&]v=([^&]+)/);
  const youtubeShort = value.match(/youtu\.be\/([^?&]+)/);

  const youtubeId = youtubeWatch?.[1] || youtubeShort?.[1];

  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  if (value.includes('dailymotion.com/video/')) {
    const id = value.split('/video/')[1]?.split(/[?_]/)[0];

    if (id) {
      return `https://www.dailymotion.com/thumbnail/video/${id}`;
    }
  }

  if (value.includes('dai.ly/')) {
    const id = value.split('dai.ly/')[1]?.split('?')[0];

    if (id) {
      return `https://www.dailymotion.com/thumbnail/video/${id}`;
    }
  }

  if (value.includes('vimeo.com')) {
    return '';
  }

  if (value.includes('tiktok.com')) {
    return '';
  }

  if (value.includes('terabox.com')) {
    return '';
  }

  return '';
}
