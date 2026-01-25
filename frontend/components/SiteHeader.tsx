import Link from "next/link";
import Container from "@/components/Container";
import StacksWalletControls from "@/components/StacksWalletControls";

export default function SiteHeader() {
  return (
    <header className="border-b border-zinc-800 bg-black">
      <Container className="py-4">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-zinc-100">
              <span className="text-orange-400">Tixel</span>
            </span>
            <span className="text-xs text-zinc-400">tickets</span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/events" className="text-zinc-200 hover:text-orange-400">
                Explore
              </Link>
              <Link href="/events/create" className="text-zinc-200 hover:text-orange-400">
                Create
              </Link>
              <Link href="/bridge" className="text-zinc-200 hover:text-orange-400">
                Bridge
              </Link>
            </nav>

            <StacksWalletControls compact />
          </div>
        </div>
      </Container>
    </header>
  );
}

