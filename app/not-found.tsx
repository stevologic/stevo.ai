import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p>404 / Signal lost</p>
      <h1>This route doesn&apos;t exist.</h1>
      <Link className="button button-primary" href="/">
        Return to stevo.ai
      </Link>
    </main>
  );
}
