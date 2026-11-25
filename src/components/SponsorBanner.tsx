/**
 * A single, understated sponsor placement.
 *
 * Kept isolated so a view renders at most one instance — no stacked ads or
 * competing calls to action around the score/result content.
 */
interface Props {
  href?: string;
  copy?: string;
  subline?: string;
}

export function SponsorBanner({
  href = "https://jambmax.com",
  copy = "Most reliable trusted 2027 JAMB assistance portal",
  subline = "Get your questions and answers hours before your exam",
}: Props) {
  return (
    <aside className="sponsor-banner" aria-label="Sponsored">
      <a
        className="sponsor-banner-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
      >
        <span className="sponsor-tag">Sponsored</span>
        <span className="sponsor-text">
          <span className="sponsor-copy">{copy}</span>
          <span className="sponsor-sub">{subline}</span>
        </span>
        <span className="sponsor-arrow" aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
