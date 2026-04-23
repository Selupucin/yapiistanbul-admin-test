import Link from "next/link";

export function SitePreviewButton() {
  return (
    <Link
      href="http://localhost:3000"
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary rounded-xl"
    >
      Sitede Kontrol Et
    </Link>
  );
}
