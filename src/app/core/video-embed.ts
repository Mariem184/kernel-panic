/**
 * Turns a video link an admin pastes (YouTube, Vimeo, Google Drive share link, or a
 * direct video file) into the right embeddable form for the project detail page.
 * Returns null if the link doesn't look like a supported video source.
 */
export type VideoEmbed =
  | { kind: 'iframe'; url: string }
  | { kind: 'file'; url: string };

export function resolveVideoEmbed(raw: string | null | undefined): VideoEmbed | null {
  const url = (raw ?? '').trim();
  if (!url) return null;

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    // YouTube: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID, or an
    // already-embeddable youtube.com/embed/ID link.
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return { kind: 'iframe', url: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch' && u.searchParams.get('v')) {
        return { kind: 'iframe', url: `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v')}` };
      }
      const shortsMatch = u.pathname.match(/^\/shorts\/([^/]+)/);
      if (shortsMatch) return { kind: 'iframe', url: `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}` };
      const embedMatch = u.pathname.match(/^\/embed\/([^/]+)/);
      if (embedMatch) return { kind: 'iframe', url: `https://www.youtube-nocookie.com/embed/${embedMatch[1]}` };
    }

    // Vimeo: vimeo.com/12345 or an already-embeddable player.vimeo.com/video/12345.
    if (host === 'vimeo.com') {
      const idMatch = u.pathname.match(/^\/(\d+)/);
      if (idMatch) return { kind: 'iframe', url: `https://player.vimeo.com/video/${idMatch[1]}` };
    }
    if (host === 'player.vimeo.com') {
      return { kind: 'iframe', url: url };
    }

    // Google Drive: drive.google.com/file/d/FILE_ID/view?... → .../preview (embeddable),
    // or a link already in the .../preview form.
    if (host === 'drive.google.com') {
      const idMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
      if (idMatch) return { kind: 'iframe', url: `https://drive.google.com/file/d/${idMatch[1]}/preview` };
    }

    // A direct link to a video file (self-hosted, or any other file host) — play it
    // with a plain <video> tag instead of an iframe.
    if (/\.(mp4|webm|ogg|mov)$/i.test(u.pathname)) {
      return { kind: 'file', url };
    }

    return null;
  } catch {
    return null;
  }
}
