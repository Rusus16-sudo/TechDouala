"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import Select from "@/components/ui/Select";
import { SORTS } from "@/lib/listing";

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(value) {
    const next = new URLSearchParams(params);
    next.delete("page");
    if (value === "pertinence") next.delete("tri");
    else next.set("tri", value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <Select
      variant="pill"
      icon={ArrowUpDown}
      aria-label="Trier par"
      value={params.get("tri") ?? "pertinence"}
      onChange={onChange}
      options={SORTS}
    />
  );
}
