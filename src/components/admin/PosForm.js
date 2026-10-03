"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CircleCheck, Search, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { posSale } from "@/app/(gerant)/gerant/vente/actions";
import { formatFCFA } from "@/lib/format";
import a from "./admin.module.css";
import styles from "./PosForm.module.css";
import Select from "@/components/ui/Select";

const PAYMENTS = [
  { id: "cash", label: "Cash" },
  { id: "mtn-momo", label: "MTN MoMo" },
  { id: "orange-money", label: "Orange Money" },
];

const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function PosForm({ products }) {
  const [q, setQ] = useState("");
  const [lines, setLines] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [payment, setPayment] = useState("cash");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [sale, setSale] = useState(null);
  const [pending, startTransition] = useTransition();

  const results = useMemo(() => {
    const words = normalize(q).split(/\s+/).filter(Boolean);
    const list = words.length
      ? products.filter((p) => words.every((w) => normalize(`${p.name} ${p.brand}`).includes(w)))
      : products;
    return list.slice(0, 12);
  }, [q, products]);

  function addVariant(product, variant) {
    setMessage("");
    setLines((cur) => [
      ...cur,
      {
        key: crypto.randomUUID(),
        variantId: variant.id,
        name: product.name,
        label: variant.label,
        listPrice: variant.price,
        stock: variant.stock,
        colors: product.colors,
        color: product.colors[0] ?? "",
        qty: 1,
        unitPrice: String(variant.price),
      },
    ]);
  }

  const update = (key, patch) => setLines((cur) => cur.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const remove = (key) => setLines((cur) => cur.filter((l) => l.key !== key));

  const listTotal = lines.reduce((n, l) => n + l.listPrice * l.qty, 0);
  const total = lines.reduce((n, l) => n + (Number(l.unitPrice) || 0) * l.qty, 0);

  function submit() {
    setMessage("");
    if (lines.length === 0) return setMessage("Ajoute au moins un produit.");
    if (lines.some((l) => !(Number(l.unitPrice) > 0))) return setMessage("Chaque ligne doit avoir un prix.");
    startTransition(async () => {
      const res = await posSale({ lines, customerName, customerPhone, payment, notes });
      if (!res.ok) return setMessage(res.message);
      setSale(res.sale);
    });
  }

  function reset() {
    setSale(null);
    setLines([]);
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setPayment("cash");
    setQ("");
  }

  if (sale) {
    return (
      <div className={`${a.card} ${styles.done}`}>
        <CircleCheck size={56} className={styles.doneIcon} aria-hidden />
        <h2>Vente enregistrée</h2>
        <p className={styles.doneNumber}>{sale.number}</p>
        <p className={styles.doneTotal}>{formatFCFA(sale.total)}</p>
        {sale.discount > 0 && <p className={a.muted}>Remise négociée : {formatFCFA(sale.discount)}</p>}
        <p className={a.muted}>Le stock a été mis à jour. N&apos;oublie pas la facture papier.</p>
        <div className={a.actions}>
          <Button onClick={reset}>Nouvelle vente</Button>
          <Button variant="secondary" href={`/gerant/commandes/${sale.id}`}>
            Voir la vente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Recherche produit : le champ reste en haut, la liste défile */}
      <section className={`${a.card} ${styles.panel}`}>
        <h2 className={a.cardTitle}>1. Produits</h2>
        <div className={styles.search}>
          <Search size={18} aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher un produit"
            autoFocus
          />
        </div>
        {products.length === 0 ? (
          <p className={a.empty}>
            <strong>Aucun produit</strong>
            <Link href="/gerant/produits/nouveau" className={a.linkBtn}>
              Ajoute d&apos;abord un produit au catalogue
            </Link>
          </p>
        ) : (
          <ul className={styles.results}>
            {results.map((p) => (
              <li key={p.id}>
                <p className={styles.resultName}>
                  {p.name} <span className={a.muted}>{p.brand}</span>
                </p>
                <div className={styles.variantBtns}>
                  {p.variants.map((v) => (
                    <button key={v.id} type="button" onClick={() => addVariant(p, v)} disabled={v.stock === 0}>
                      <strong>{v.label ?? "Standard"}</strong>
                      <span>{formatFCFA(v.price)}</span>
                      <small>{v.stock === 0 ? "Épuisé" : `Stock : ${v.stock}`}</small>
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Ticket : articles et client défilent, le total et « Valider la vente » restent visibles */}
      <section className={`${a.card} ${styles.panel}`}>
        <h2 className={a.cardTitle}>2. Vente</h2>
        <div className={styles.ticketBody}>
          {lines.length === 0 ? (
            <p className={a.muted}>Choisis un produit à gauche pour commencer.</p>
          ) : (
            <ul className={styles.lines}>
              {lines.map((l) => {
                const low = Number(l.unitPrice) < l.listPrice;
                return (
                  <li key={l.key} className={styles.line}>
                    <div className={styles.lineHead}>
                      <strong>
                        {l.name} {l.label && <span className={a.muted}>· {l.label}</span>}
                      </strong>
                      <button
                        type="button"
                        className={`${a.iconBtn} ${a.danger}`}
                        onClick={() => remove(l.key)}
                        aria-label="Retirer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className={styles.lineFields}>
                      {l.colors.length > 0 && (
                        <label className={a.field}>
                          <span className={styles.small}>Couleur</span>
                          <Select
                            aria-label="Couleur"
                            value={l.color}
                            onChange={(v) => update(l.key, { color: v })}
                            options={l.colors}
                          />
                        </label>
                      )}
                      <label className={a.field}>
                        <span className={styles.small}>Qté</span>
                        <input
                          className={a.input}
                          type="number"
                          min="1"
                          max={Math.min(l.stock, 20)}
                          value={l.qty}
                          onChange={(e) =>
                            update(l.key, { qty: Math.max(1, Math.min(Number(e.target.value) || 1, l.stock)) })
                          }
                        />
                      </label>
                      <label className={a.field}>
                        <span className={styles.small}>Prix unitaire {low && "(négocié)"}</span>
                        <input
                          className={a.input}
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={l.unitPrice}
                          onChange={(e) => update(l.key, { unitPrice: e.target.value })}
                        />
                      </label>
                    </div>
                    {low && <p className={styles.note}>Prix catalogue : {formatFCFA(l.listPrice)}</p>}
                  </li>
                );
              })}
            </ul>
          )}

          <h2 className={`${a.cardTitle} ${styles.step}`}>3. Client et paiement</h2>
          <div className={a.grid2}>
            <label className={a.field}>
              <span className={a.label}>Nom du client</span>
              <input
                className={a.input}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Client de passage"
              />
            </label>
            <label className={a.field}>
              <span className={a.label}>Téléphone (facultatif)</span>
              <input
                className={a.input}
                type="tel"
                inputMode="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="6 XX XX XX XX"
              />
            </label>
          </div>
          <div className={styles.payments} role="radiogroup" aria-label="Paiement">
            {PAYMENTS.map((p) => (
              <label key={p.id} className={styles.payment}>
                <input
                  type="radio"
                  name="payment"
                  value={p.id}
                  checked={payment === p.id}
                  onChange={() => setPayment(p.id)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
          <label className={a.field}>
            <span className={a.label}>Note (facultatif)</span>
            <input
              className={a.input}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex. : reprise d'un iPhone 11 déduite"
            />
          </label>
        </div>

        <div className={styles.ticketFoot}>
          <div className={styles.summary}>
            {listTotal !== total && (
              <p className={a.muted}>
                Prix catalogue {formatFCFA(listTotal)} · remise {formatFCFA(listTotal - total)}
              </p>
            )}
            <p className={styles.total}>
              <span>Total à encaisser</span>
              <strong>{formatFCFA(total)}</strong>
            </p>
          </div>
          {message && (
            <p className={a.alert} role="alert">
              {message}
            </p>
          )}
          <Button size="lg" block onClick={submit} disabled={pending || lines.length === 0}>
            {pending ? "Enregistrement…" : "Valider la vente"}
          </Button>
        </div>
      </section>
    </div>
  );
}
