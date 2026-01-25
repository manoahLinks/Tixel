import Link from "next/link";
import Container from "@/components/Container";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <SiteHeader />

      <main>
        <section className="border-b border-zinc-800">
          <Container className="py-16">
            <div className="max-w-2xl">
              <p className="text-sm text-zinc-400">
                Simple event ticketing — black &amp; orange.
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Find events. Create events. Sell tickets.
              </h1>
              <p className="mt-4 text-zinc-300">
                A clean, minimal ticketing UI: landing page, explore events,
                event details, and a create event flow.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center rounded-md bg-orange-400 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-300"
                >
                  Explore events
                </Link>
                <Link
                  href="/events/create"
                  className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-orange-400 hover:text-orange-400"
                >
                  Create an event
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section>
          <Container className="py-12">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 p-5">
                <h2 className="text-sm font-semibold text-zinc-100">Explore</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Browse a simple list of upcoming events with price, date, and
                  tags.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 p-5">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Event details
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  A clean details page with ticket “purchase” UI (demo).
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 p-5">
                <h2 className="text-sm font-semibold text-zinc-100">Create</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Create events locally (saved in your browser) to keep it
                  lightweight.
                </p>
              </div>
            </div>

            <div className="mt-10 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
              Tip: the existing bridge stays at{" "}
              <Link href="/bridge" className="text-orange-400 hover:text-orange-300">
                /bridge
              </Link>
              .
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}