"use client";

import { AppWagmiProvider } from "@/connection/index";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppWagmiProvider>{children}</AppWagmiProvider>;
}
