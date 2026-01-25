export type TixelEvent = {
  id: string;
  title: string;
  dateISO: string; // e.g. "2026-02-10"
  time?: string; // e.g. "19:30"
  bannerImage: string; // public/ path, e.g. "/events/banner-1.svg"
  stacksEventId?: number; // on-chain uint id (if deployed)
  tokenUri?: string; // matches `token-uri` stored on-chain (ascii)
  venue: string;
  city: string;
  priceCents: number;
  currency: "USD";
  description: string;
  tags: string[];
};

export const SEED_EVENTS: TixelEvent[] = [
  {
    id: "evt_warehouse_sessions",
    title: "Warehouse Sessions",
    dateISO: "2026-02-10",
    time: "21:00",
    bannerImage: "/events/banner-1.svg",
    stacksEventId: 1,
    tokenUri: "https://tixel.app/events/evt_warehouse_sessions",
    venue: "Dockside Warehouse",
    city: "Brooklyn, NY",
    priceCents: 4500,
    currency: "USD",
    tags: ["music", "dance", "night"],
    description:
      "A no-frills night of loud speakers, tight lights, and a clean lineup. Doors at 9. Last entry 12.",
  },
  {
    id: "evt_rooftop_comedy",
    title: "Rooftop Comedy Hour",
    dateISO: "2026-02-14",
    time: "20:00",
    bannerImage: "/events/banner-2.svg",
    stacksEventId: 2,
    tokenUri: "https://tixel.app/events/evt_rooftop_comedy",
    venue: "The Terrace",
    city: "Austin, TX",
    priceCents: 2500,
    currency: "USD",
    tags: ["comedy", "live"],
    description:
      "A simple set of sharp comedians and a good view. Seating is limited — show up early.",
  },
  {
    id: "evt_founders_breakfast",
    title: "Founders Breakfast",
    dateISO: "2026-02-18",
    time: "08:30",
    bannerImage: "/events/banner-3.svg",
    stacksEventId: 3,
    tokenUri: "https://tixel.app/events/evt_founders_breakfast",
    venue: "Common Room Café",
    city: "San Francisco, CA",
    priceCents: 1500,
    currency: "USD",
    tags: ["community", "networking"],
    description:
      "Meet other builders over coffee. No stage, no speeches — just a table, names, and honest conversations.",
  },
  {
    id: "evt_indie_screening",
    title: "Indie Film Screening",
    dateISO: "2026-02-22",
    time: "19:00",
    bannerImage: "/events/banner-4.svg",
    stacksEventId: 4,
    tokenUri: "https://tixel.app/events/evt_indie_screening",
    venue: "Civic Theater",
    city: "Seattle, WA",
    priceCents: 1800,
    currency: "USD",
    tags: ["film", "arts"],
    description:
      "A short screening with a Q&A after. Tickets include entry only. Snacks available at the lobby.",
  },
  {
    id: "evt_design_workshop",
    title: "Design Systems Workshop",
    dateISO: "2026-03-01",
    time: "10:00",
    bannerImage: "/events/banner-5.svg",
    stacksEventId: 5,
    tokenUri: "https://tixel.app/events/evt_design_workshop",
    venue: "Studio B",
    city: "Chicago, IL",
    priceCents: 9900,
    currency: "USD",
    tags: ["workshop", "design"],
    description:
      "A practical workshop focused on naming, tokens, and components. Bring a laptop — you’ll build as you go.",
  },
  {
    id: "evt_sunday_market",
    title: "Sunday Makers Market",
    dateISO: "2026-03-08",
    time: "11:00",
    bannerImage: "/events/banner-2.svg",
    stacksEventId: 6,
    tokenUri: "https://tixel.app/events/evt_sunday_market",
    venue: "Riverfront Hall",
    city: "Portland, OR",
    priceCents: 0,
    currency: "USD",
    tags: ["market", "community"],
    description:
      "A small local market for makers and artists. Free entry. Family friendly. Dogs welcome if leashed.",
  },
];

export function formatMoney(cents: number, currency: "USD" = "USD") {
  const value = cents / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatEventDate(dateISO: string) {
  const d = new Date(`${dateISO}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

