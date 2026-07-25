interface HeroAftermovieProps {
  /** TODO(kunde): once the real aftermovie file exists, drop its public path here (e.g. "/video/aftermovie.mp4"). */
  src?: string;
  /** TODO(kunde): a poster frame keeps CLS at 0 and avoids a black flash before playback starts. */
  poster?: string;
}

/**
 * Ambient looping background video slot for the hero. Renders nothing until a real
 * file is wired in via props — never reference an asset that does not exist on disk.
 * Dropping a file in later needs no refactor: just pass `src`/`poster` from the caller.
 */
export function HeroAftermovie({ src, poster }: HeroAftermovieProps) {
  if (!src) return null;

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover opacity-60"
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
