"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import SiteHeader from "@/components/SiteHeader";
import type { TixelEvent } from "@/lib/events";
import { addLocalEvent } from "@/lib/eventStore";

const BANNERS = [
  { label: "Default", value: "/events/banner-default.svg" },
  { label: "Banner 1", value: "/events/banner-1.svg" },
  { label: "Banner 2", value: "/events/banner-2.svg" },
  { label: "Banner 3", value: "/events/banner-3.svg" },
  { label: "Banner 4", value: "/events/banner-4.svg" },
  { label: "Banner 5", value: "/events/banner-5.svg" },
] as const;

function toCents(price: string) {
  const n = Number(price);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [dateISO, setDateISO] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("25");
  const [tags, setTags] = useState("music, live");
  const [bannerImage, setBannerImage] = useState<(typeof BANNERS)[number]["value"]>(
    "/events/banner-default.svg"
  );
  const [description, setDescription] = useState("");

  const canSubmit = useMemo(() => {
    return (
      title.trim().length >= 3 &&
      dateISO.trim().length > 0 &&
      venue.trim().length >= 2 &&
      city.trim().length >= 2
    );
  }, [title, dateISO, venue, city]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const event: TixelEvent = {
      id: `evt_${Date.now()}`,
      title: title.trim(),
      dateISO,
      time: time.trim() ? time.trim() : undefined,
      bannerImage,
      venue: venue.trim(),
      city: city.trim(),
      priceCents: toCents(price),
      currency: "USD",
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8),
      description: description.trim() || "No description yet.",
    };

    addLocalEvent(event);
    router.push("/events");
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <SiteHeader />

      <main>
        <Container className="py-10">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight">Create event</h1>
            <p className="mt-2 text-sm text-zinc-400">
              This is a lightweight demo. Events save locally in your browser.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="block text-xs text-zinc-400">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event name"
                  className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-400">Date</label>
                  <input
                    value={dateISO}
                    onChange={(e) => setDateISO(e.target.value)}
                    type="date"
                    className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Time (optional)</label>
                  <input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    type="time"
                    className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-400">Venue</label>
                  <input
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Where is it?"
                    className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City, State"
                    className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs text-zinc-400">Ticket price (USD)</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    inputMode="decimal"
                    placeholder="25"
                    className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400">Tags (comma-separated)</label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="music, live"
                    className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400">Banner image</label>
                <select
                  value={bannerImage}
                  onChange={(e) =>
                    setBannerImage(e.target.value as (typeof BANNERS)[number]["value"])
                  }
                  className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-orange-400 focus:outline-none"
                >
                  {BANNERS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-zinc-500">
                  Simple local banners (black/orange). No uploads in this demo.
                </p>
              </div>

              <div>
                <label className="block text-xs text-zinc-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description…"
                  rows={5}
                  className="mt-2 w-full resize-y rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center justify-center rounded-md bg-orange-400 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-300 disabled:opacity-50"
                >
                  Publish event
                </button>
                <p className="text-xs text-zinc-500">
                  Required: title, date, venue, city.
                </p>
              </div>
            </form>
          </div>
        </Container>
      </main>
    </div>
  );
}

