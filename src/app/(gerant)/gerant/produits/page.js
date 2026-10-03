import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, PackageX, PackageCheck, Pencil, Plus, Smartphone } from "lucide-react";
import Status, { Tag } from "@/components/admin/Status";
import Button from "@/components/ui/Button";
import { listAdminProducts, getReferenceData } from "@/lib/data/admin";
import { formatFCFA } from "@/lib/format";
import { setOutOfStock, setPublished } from "./actions";
import a from "@/components/admin/admin.module.css";
import styles from "./produits.module.css";
import Select from "@/components/ui/Select";

export const metadata = { title: "Catalogue & stock - TechDouala" };

const LOW_STOCK = 3;

const FILTERS = [
  { value: "", label: "Tous les produits" },
  { value: "rupture", label: "En rupture" },
  { value: "bas", label: `Stock bas (≤ ${LOW_STOCK})` },
  { value: "masques", label: "Masqués" },
];

export default async function AdminProductsPage({ searchParams }) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().toLowerCase();
  const cat = typeof sp.categorie === "string" ? sp.categorie : "";
  const filter = typeof sp.filtre === "string" ? sp.filtre : "";

  const [all, { categories }] = await Promise.all([listAdminProducts(), getReferenceData()]);
  const isOut = (p) => p.force_out_of_stock || p.stock === 0;

  const products = all.filter(
    (p) =>
      (!q || `${p.name} ${p.brand?.name ?? ""}`.toLowerCase().includes(q)) &&
      (!cat || p.category_slug === cat) &&
      (filter !== "rupture" || isOut(p)) &&
      (filter !== "bas" || (!isOut(p) && p.stock <= LOW_STOCK)) &&
      (filter !== "masques" || !p.is_published),
  );

  const counts = {
    total: all.length,
    out: all.filter(isOut).length,
    low: all.filter((p) => !isOut(p) && p.stock <= LOW_STOCK).length,
    units: all.reduce((n, p) => n + p.stock, 0),
  };

  return (
    <>
      <header className={a.head}>
        <div>
          <h1 className={a.title}>Catalogue & stock</h1>
          <p className={a.subtitle}>
            {counts.total} produit{counts.total > 1 ? "s" : ""} · {counts.units} unités en stock · {counts.out} en rupture ·{" "}
            {counts.low} en stock bas
          </p>
        </div>
        <div className={a.actions}>
          <Button href="/gerant/produits/stock" variant="secondary">
            Saisie rapide du stock
          </Button>
          <Button href="/gerant/produits/nouveau" icon={Plus}>
            Ajouter un produit
          </Button>
        </div>
      </header>

      {sp.ok && <p className={`${a.success} ${styles.flash}`}>Produit enregistré.</p>}

      <form className={a.toolbar} role="search">
        <input type="search" name="q" defaultValue={q} placeholder="Rechercher un produit ou une marque…" aria-label="Rechercher" />
        <Select
          name="categorie"
          defaultValue={cat ?? ""}
          aria-label="Catégorie"
          className={a.toolbarSelect}
          options={[{ value: "", label: "Toutes les catégories" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
        />
        <Select name="filtre" defaultValue={filter} aria-label="Filtre de stock" className={a.toolbarSelect} options={FILTERS} />
        <Button type="submit" variant="secondary">
          Filtrer
        </Button>
      </form>

      <div className={a.tableWrap}>
        {products.length === 0 ? (
          <div className={a.empty}>
            <strong>{all.length === 0 ? "Aucun produit pour le moment" : "Aucun produit ne correspond"}</strong>
            {all.length === 0 ? "Ajoute ton premier produit pour l'afficher dans la boutique." : "Modifie la recherche ou les filtres."}
          </div>
        ) : (
          <table className={a.table}>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th className={a.num}>Prix</th>
                <th className={a.num}>Stock</th>
                <th>Statut</th>
                <th>
                  <span className={styles.srOnly}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.product}>
                      <span className={styles.thumb}>
                        {p.image ? (
                          <Image src={p.image} alt="" fill sizes="48px" className={styles.thumbImg} />
                        ) : (
                          <Smartphone size={20} strokeWidth={1.5} aria-hidden />
                        )}
                      </span>
                      <div>
                        <Link href={`/gerant/produits/${p.id}`} className={styles.name}>
                          {p.name}
                        </Link>
                        <p className={a.muted}>
                          {p.brand?.name} · {p.condition} · {p.variants.length} variante{p.variants.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={a.muted}>{p.category?.name}</td>
                  <td className={a.num}>
                    {p.minPrice === null
                      ? "—"
                      : p.minPrice === p.maxPrice
                        ? formatFCFA(p.minPrice)
                        : `${formatFCFA(p.minPrice)} – ${formatFCFA(p.maxPrice)}`}
                  </td>
                  <td className={a.num}>
                    <span className={isOut(p) ? styles.stockOut : p.stock <= LOW_STOCK ? styles.stockLow : ""}>{p.stock}</span>
                  </td>
                  <td>
                    <div className={styles.badges}>
                      {/* Publié / masqué se distinguent par la pastille pleine ou creuse, sans couleur :
                          seule la rupture, qui demande une action, en porte une. */}
                      {p.is_published ? <Status>Publié</Status> : <Status tone="off">Masqué</Status>}
                      {p.force_out_of_stock && <Status tone="critical">Rupture</Status>}
                      {p.is_flash && <Tag>Flash</Tag>}
                      {p.is_featured && <Tag>Coup de cœur</Tag>}
                    </div>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link href={`/gerant/produits/${p.id}`} className={a.iconBtn} title="Modifier" aria-label={`Modifier ${p.name}`}>
                        <Pencil size={16} />
                      </Link>
                      <form action={setOutOfStock.bind(null, p.id, !p.force_out_of_stock)}>
                        <button
                          type="submit"
                          className={a.iconBtn}
                          title={p.force_out_of_stock ? "Remettre en vente" : "Marquer en rupture"}
                          aria-label={p.force_out_of_stock ? `Remettre ${p.name} en vente` : `Marquer ${p.name} en rupture`}
                        >
                          {p.force_out_of_stock ? <PackageCheck size={16} /> : <PackageX size={16} />}
                        </button>
                      </form>
                      <form action={setPublished.bind(null, p.id, !p.is_published)}>
                        <button
                          type="submit"
                          className={a.iconBtn}
                          title={p.is_published ? "Masquer de la boutique" : "Publier dans la boutique"}
                          aria-label={p.is_published ? `Masquer ${p.name}` : `Publier ${p.name}`}
                        >
                          {p.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
