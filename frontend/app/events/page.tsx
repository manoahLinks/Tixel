"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/Container";
import SiteHeader from "@/components/SiteHeader";
import { fetchAllOnChainEvents, formatEventDate, formatMoney, type TixelEvent } from "@/lib/events";

export default function EventsIndexPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");
  const [allEvents, setAllEvents] = useState<TixelEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllOnChainEvents()
      .then((evts) => {
        setAllEvents(evts.sort((a, b) => a.dateISO.localeCompare(b.dateISO)));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const e of allEvents) for (const t of e.tags) set.add(t);
    return ["all", ...Array.from(set).sort()];
  }, [allEvents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEvents.filter((e) => {
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q);
      const matchesTag = tag === "all" || e.tags.includes(tag);
      return matchesQuery && matchesTag;
    });
  }, [allEvents, query, tag]);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <SiteHeader />

      <main>
        <Container className="py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Explore events</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Browse what’s coming up. Created events are saved in your browser.
              </p>
            </div>
            <Link
              href="/events/create"
              className="inline-flex w-full items-center justify-center rounded-md bg-orange-400 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-300 md:w-auto"
            >
              Create event
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-zinc-400">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, venue, city…"
                className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400">Tag</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-orange-400 focus:outline-none"
              >
                {tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="md:col-span-2 flex items-center justify-center rounded-lg border border-zinc-800 p-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
                <span className="ml-3 text-sm text-zinc-400">Loading events from blockchain...</span>
              </div>
            ) : filtered.map((e) => (
              <Link
                key={e.id}
                href={`/events/${encodeURIComponent(e.stacksEventId || e.id)}`}
                className="overflow-hidden rounded-lg border border-zinc-800 hover:border-orange-400"
              >
                <div className="relative h-36 w-full bg-zinc-950">
                  <Image
                    src={e.bannerImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    priority={false}
                  />
                  <div className="absolute inset-0 bg-black/25" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-100">{e.title}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {formatEventDate(e.dateISO)}
                      {e.time ? ` • ${e.time}` : ""} • {e.venue} • {e.city}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-orange-400">
                      {e.priceCents === 0 ? "Free" : formatMoney(e.priceCents, e.currency)}
                    </p>
                  </div>
                  </div>

                  {e.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {e.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-10 rounded-lg border border-zinc-800 p-6 text-sm text-zinc-400">
              No events match your filters.
            </div>
          ) : null}
        </Container>
      </main>
    </div>
  );
}

