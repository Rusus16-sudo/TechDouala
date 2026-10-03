"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { saveStocks } from "@/app/(gerant)/gerant/produits/stock/actions";
import { formatFCFA } from "@/lib/format";
import a from "./admin.module.css";
import styles from "./StockTable.module.css";

export default function StockTable({ products }) {
  const router = useRouter();
  const initial = useMemo(() => Object.fromEntries(products.flatMap((p) => p.variants.map((v) => [v.id, String(v.stock)]))), [products]);
  const [values, setValues] = useState(initial);
  const [q, setQ] = useState("");
  const [publish, setPublish] = useState(true);
  const [result, setResult] = useState(null);
  const [pending, startTransition] = useTransition();

  const changes = Object.entries(values).filter(([id, v]) => v !== initial[id] && v !== "");
  const needle = q.trim().toLowerCase();
  const shown = needle ? products.filter((p) => `${p.name} ${p.brand?.name}`.toLowerCase().includes(needle)) : products;

  function save() {
    setResult(null);
    startTransition(async () => {
      const res = await saveStocks({ changes: changes.map(([id, stock]) => ({ id, stock })), publish });
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <>
      <div className={a.toolbar}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer : Galaxy, iPhone 13, Pixel…" aria-label="Filtrer" />
      </div>

      {result && (
        <p className={result.ok ? a.success : a.alert} role="status">
          {result.ok
            ? `${result.updated} stock(s) enregistré(s)${publish ? ` · ${result.published} produit(s) publié(s) · ${result.hidden} masqué(s) faute de stock` : ""}.`
            : result.message}
        </p>
      )}

      <div className={a.tableWrap}>
        <table className={a.table}>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Version</th>
              <th className={a.num}>Prix</th>
              <th className={a.num}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) =>
              p.variants.map((v, i) => (
                <tr key={v.id} className={i === 0 ? styles.first : ""}>
                  {i === 0 && (
                    <td rowSpan={p.variants.length} className={styles.product}>
                      <strong>{p.name}</strong>
                      <div className={styles.meta}>
                        <span className={a.muted}>{p.brand?.name}</span>
                        <Badge variant={p.condition === "Neuf" ? "violet-soft" : "neutral"}>{p.condition}</Badge>
                        {!p.is_published && <Badge variant="neutral">Masqué</Badge>}
                      </div>
                    </td>
                  )}
                  <td>{v.label ?? "Unique"}</td>
                  <td className={a.num}>{formatFCFA(v.price)}</td>
                  <td className={a.num}>
                    <input
                      className={`${styles.stock} ${values[v.id] !== initial[v.id] ? styles.changed : ""}`}
                      type="number"
                      min="0"
                      max="9999"
                      inputMode="numeric"
                      aria-label={`Stock ${p.name} ${v.label ?? ""}`}
                      value={values[v.id]}
                      onChange={(e) => setValues((cur) => ({ ...cur, [v.id]: e.target.value }))}
                    />
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      <div className={a.stickyBar}>
        <label className={`${a.check} ${styles.publish}`}>
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          Publier les produits en stock et masquer ceux à 0
        </label>
        <Button onClick={save} disabled={pending || changes.length === 0}>
          {pending ? "Enregistrement…" : `Enregistrer ${changes.length || ""} modification${changes.length > 1 ? "s" : ""}`}
        </Button>
      </div>
    </>
  );
}
