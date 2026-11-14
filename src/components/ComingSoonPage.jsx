// Lightweight placeholder for routes that do not have a page yet.
import { Link } from 'wouter';

export default function ComingSoonPage() {
  return (
    <section className="mx-auto flex min-h-[50vh] w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="heading">Coming soon</h1>
      <p className="mt-4 text-base text-slate-300">
        We’re working on this page. Please check back soon.
      </p>
      <Link className="pixel-btn-primary mt-8" href="/">
        Back to home
      </Link>
    </section>
  );
}
