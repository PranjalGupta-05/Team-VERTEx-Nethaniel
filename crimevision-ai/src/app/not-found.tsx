import Link from "next/link";
import { ScanSearch } from "lucide-react";

export default function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center text-center">
      <div>
        <ScanSearch className="mx-auto text-cyan" size={34} strokeWidth={1.4} />
        <p className="eyebrow mt-5">No indexed record</p>
        <h1 className="mt-2 text-3xl font-semibold">Workspace not found</h1>
        <Link href="/" className="mt-5 inline-block text-xs font-semibold text-cyan">
          Return to command view →
        </Link>
      </div>
    </section>
  );
}
