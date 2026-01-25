"use client";

import { useEffect, useMemo, useState } from "react";
import { connect, disconnect, getLocalStorage, isConnected } from "@stacks/connect";

function shortAddr(addr: string) {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function StacksWalletControls({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [authed, setAuthed] = useState(false);
  const [stx, setStx] = useState("");

  useEffect(() => {
    const ok = isConnected();
    setAuthed(ok);
    if (ok) {
      const userData = getLocalStorage();
      const stxAddress = userData?.addresses?.stx?.[0]?.address ?? "";
      setStx(stxAddress);
    }
  }, []);

  const label = useMemo(() => {
    if (!authed) return "Stacks connect";
    return compact ? "Stacks" : "Stacks connected";
  }, [authed, compact]);

  async function onConnect() {
    if (isConnected()) {
      setAuthed(true);
      const userData = getLocalStorage();
      setStx(userData?.addresses?.stx?.[0]?.address ?? "");
      return;
    }
    await connect();
    setAuthed(true);
    const userData = getLocalStorage();
    setStx(userData?.addresses?.stx?.[0]?.address ?? "");
  }

  function onDisconnect() {
    disconnect();
    setAuthed(false);
    setStx("");
  }

  return (
    <div className="flex items-center gap-3">
      {authed && stx ? (
        <span className="hidden text-xs text-zinc-400 sm:inline">
          {shortAddr(stx)}
        </span>
      ) : null}

      {!authed ? (
        <button
          type="button"
          onClick={onConnect}
          className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:border-orange-400 hover:text-orange-400"
        >
          {label}
        </button>
      ) : (
        <button
          type="button"
          onClick={onDisconnect}
          className="inline-flex items-center justify-center rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:border-orange-400 hover:text-orange-400"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}

