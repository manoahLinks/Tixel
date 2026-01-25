"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { request, isConnected as stacksIsConnected } from "@stacks/connect";
import { contractPrincipalCV, uintCV } from "@stacks/transactions";
import Container from "@/components/Container";
import SiteHeader from "@/components/SiteHeader";
import BridgeForm from "@/components/BridgeForm";
import EvmWalletControls from "@/components/EvmWalletControls";
import StacksWalletControls from "@/components/StacksWalletControls";
import { fetchOnChainEvent, formatEventDate, formatMoney, type TixelEvent } from "@/lib/events";
import { STACKS_EVENT_TICKETING_CONTRACT, STACKS_USDCX_CONTRACT } from "@/lib/config";


export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const [onChainEvent, setOnChainEvent] = useState<TixelEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState<string>("");
  const [showBridge, setShowBridge] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (/^\d+$/.test(id)) {
      fetchOnChainEvent(parseInt(id))
        .then((evt) => {
          if (evt) setOnChainEvent(evt);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const event = onChainEvent;

  const total = useMemo(() => {
    if (!event) return 0;
    return event.priceCents * Math.max(1, Math.min(10, qty));
  }, [event, qty]);

  async function buyTicket() {
    setNotice("");
    if (!event) return;
    if (!event.stacksEventId) {
      setNotice("This event isn’t on-chain yet (no Stacks event id).");
      return;
    }
    if (!stacksIsConnected()) {
      setNotice("Connect your Stacks wallet first.");
      return;
    }
    const safeQty = Math.max(1, Math.min(10, Number.isFinite(qty) ? qty : 1));

    const [usdcxAddr, usdcxName] = STACKS_USDCX_CONTRACT.split(".");
    if (!usdcxAddr || !usdcxName) {
      setNotice("USDCx contract config is invalid.");
      return;
    }

    setIsPurchasing(true);
    try {
      const functionArgs = [
        uintCV(event.stacksEventId),
        uintCV(safeQty),
        contractPrincipalCV(usdcxAddr, usdcxName),
      ];

      const result = (await request("stx_callContract", {
        contract: STACKS_EVENT_TICKETING_CONTRACT as `${string}.${string}`,
        functionName: "purchase-ticket",
        functionArgs,
      })) as unknown as { txid?: string };

      setNotice(result?.txid ? `Transaction submitted: ${result.txid}` : "Transaction submitted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction cancelled or failed.";
      setNotice(msg);
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <SiteHeader />

      <main>
        <Container className="py-10">
          <div className="mb-6">
            <Link href="/events" className="text-sm text-zinc-400 hover:text-orange-400">
              ← Back to events
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-lg border border-zinc-800 p-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              <span className="ml-3 text-sm text-zinc-400">Loading event...</span>
            </div>
          ) : !event ? (
            <div className="rounded-lg border border-zinc-800 p-6">
              <h1 className="text-lg font-semibold">Event not found</h1>
              <p className="mt-2 text-sm text-zinc-400">
                This event doesn’t exist (or was created in another browser).
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                  <div className="relative h-56 w-full">
                    <Image
                      src={event.bannerImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 66vw, 100vw"
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-black/25" />
                  </div>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight">{event.title}</h1>
                <p className="mt-3 text-sm text-zinc-300">
                  {formatEventDate(event.dateISO)}
                  {event.time ? ` • ${event.time}` : ""} • {event.venue} • {event.city}
                </p>

                {event.tags.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {event.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-8 rounded-lg border border-zinc-800 p-5">
                  <h2 className="text-sm font-semibold text-zinc-100">About</h2>
                  <p className="mt-3 whitespace-pre-line text-sm text-zinc-300">
                    {event.description}
                  </p>
                </div>
              </div>

              <aside className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm text-zinc-400">Ticket</p>
                  <p className="text-base font-semibold text-orange-400">
                    {event.priceCents === 0 ? "Free" : formatMoney(event.priceCents, event.currency)}
                  </p>
                </div>

                <div className="mt-5">
                  <label className="block text-xs text-zinc-400">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="mt-2 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-100 focus:border-orange-400 focus:outline-none"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Total</span>
                  <span className="font-semibold text-zinc-100">
                    {event.priceCents === 0 ? "Free" : formatMoney(total, event.currency)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={buyTicket}
                  disabled={isPurchasing || !event.stacksEventId}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-orange-400 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-300 disabled:opacity-50"
                >
                  {isPurchasing ? "Confirming…" : "Buy ticket"}
                </button>

                {notice ? (
                  <p className="mt-3 text-xs text-zinc-400">{notice}</p>
                ) : (
                  <p className="mt-3 text-xs text-zinc-500">
                    Purchases are USDCx-based on Stacks and mint an NFT ticket.
                  </p>
                )}

                <div className="mt-6 border-t border-zinc-800 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">Need USDC to pay?</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Bridge USDC from Ethereum to Stacks, then come back to checkout.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBridge((v) => !v)}
                      className="shrink-0 rounded-md border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100 hover:border-orange-400 hover:text-orange-400"
                    >
                      {showBridge ? "Hide" : "Bridge now"}
                    </button>
                  </div>

                  {showBridge ? (
                    <div className="mt-4 space-y-4">
                      <EvmWalletControls />

                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">Stacks destination</p>
                            <p className="mt-1 text-xs text-zinc-400">
                              Connect to auto-fill your Stacks address.
                            </p>
                          </div>
                          <StacksWalletControls />
                        </div>
                      </div>

                      <BridgeForm className="max-w-none" />
                    </div>
                  ) : null}
                </div>
              </aside>
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}

