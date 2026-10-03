"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Plus, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { deleteProduct, saveProduct, slugify } from "@/app/(gerant)/gerant/produits/actions";
import a from "./admin.module.css";
import styles from "./ProductForm.module.css";
import Select from "@/components/ui/Select";

const EMPTY_VARIANT = { id: null, label: "", price: "", old_price: "", stock: "0", floor_price: "" };

/** Réduit une photo (1600 px max, WebP) avant l'envoi : plus léger pour les connexions mobiles. */
async function compress(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/webp", 0.85));
}

function toForm(p) {
  if (!p) {
    return {
      name: "",
      slug: "",
      brand_slug: "",
      category_slug: "smartphones",
      condition: "Neuf",
      warranty_months: "12",
      description: "",
      highlights: "",
      ram_gb: "",
      is_5g: false,
      is_featured: false,
      is_flash: false,
      is_published: true,
      force_out_of_stock: false,
      images: [],
      colors: [],
      specs: [],
      variants: [{ ...EMPTY_VARIANT }],
    };
  }
  const s = (v) => (v === null || v === undefined ? "" : String(v));
  return {
    ...p,
    warranty_months: s(p.warranty_months),
    ram_gb: s(p.ram_gb),
    highlights: (p.highlights ?? []).join("\n"),
    variants: p.variants.map((v) => ({
      id: v.id,
      label: s(v.label),
      price: s(v.price),
      old_price: s(v.old_price),
      stock: s(v.stock),
      floor_price: s(v.floor_price),
    })),
  };
}

export default function ProductForm({ product, categories, brands, isOwner }) {
  const router = useRouter();
  const [f, setF] = useState(() => toForm(product));
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(0);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef(null);

  const set = (key, value) => setF((cur) => ({ ...cur, [key]: value }));
  const onText = (key) => (e) => set(key, e.target.value);
  const onCheck = (key) => (e) => set(key, e.target.checked);

  async function onName(e) {
    const name = e.target.value;
    set("name", name);
    if (!slugTouched) set("slug", await slugify(name));
  }

  // Listes (variantes, couleurs, caractéristiques)
  const setRow = (list, i, key, value) =>
    setF((cur) => ({ ...cur, [list]: cur[list].map((r, j) => (j === i ? { ...r, [key]: value } : r)) }));
  const addRow = (list, row) => setF((cur) => ({ ...cur, [list]: [...cur[list], row] }));
  const removeRow = (list, i) => setF((cur) => ({ ...cur, [list]: cur[list].filter((_, j) => j !== i) }));

  async function onFiles(e) {
    const files = [...(e.target.files ?? [])].slice(0, 10 - f.images.length);
    e.target.value = "";
    if (!files.length) return;
    setMessage("");
    const supabase = createClient();
    setUploading(files.length);
    for (const file of files) {
      try {
        const blob = await compress(file);
        const path = `products/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage.from("produits").upload(path, blob, { contentType: "image/webp" });
        if (error) throw error;
        const { data } = supabase.storage.from("produits").getPublicUrl(path);
        setF((cur) => ({ ...cur, images: [...cur.images, data.publicUrl] }));
      } catch (err) {
        setMessage(`Photo « ${file.name} » non envoyée : ${err.message ?? "erreur inconnue"}`);
      }
      setUploading((n) => n - 1);
    }
  }

  function moveImage(i, dir) {
    setF((cur) => {
      const images = [...cur.images];
      const j = i + dir;
      if (j < 0 || j >= images.length) return cur;
      [images[i], images[j]] = [images[j], images[i]];
      return { ...cur, images };
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    startTransition(async () => {
      const res = await saveProduct({ ...f, id: product?.id });
      if (!res.ok) {
        setErrors(res.errors ?? {});
        setMessage(res.message ?? "Corrige les champs en rouge.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push("/gerant/produits?ok=1");
      router.refresh();
    });
  }

  function onDelete() {
    if (!window.confirm(`Supprimer définitivement « ${product.name} » ? Tu peux aussi simplement le masquer.`)) return;
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        router.push("/gerant/produits");
        router.refresh();
      } catch (err) {
        setMessage(err.message);
      }
    });
  }

  const err = (k) => errors[k] && <p className={a.error}>{errors[k]}</p>;

  return (
    <form onSubmit={onSubmit} className={a.form} noValidate>
      {message && (
        <p className={a.alert} role="alert">
          {message}
        </p>
      )}

      {/* Informations */}
      <section className={a.card}>
        <h2 className={a.cardTitle}>Informations</h2>
        <div className={a.form}>
          <div className={a.grid2}>
            <div className={a.field}>
              <label htmlFor="name">Nom du produit</label>
              <input id="name" value={f.name} onChange={onName} placeholder="Ex. : iPhone 15" />
              {err("name")}
            </div>
            <div className={a.field}>
              <label htmlFor="slug">Adresse de la page</label>
              <div className={styles.slug}>
                <span>/produit/</span>
                <input
                  id="slug"
                  value={f.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                />
              </div>
              {err("slug")}
            </div>
          </div>
          <div className={a.grid3}>
            <div className={a.field}>
              <label htmlFor="brand">Marque</label>
              <Select
                id="brand"
                value={f.brand_slug}
                onChange={(v) => set("brand_slug", v)}
                options={[{ value: "", label: "Choisir…" }, ...brands.map((b) => ({ value: b.slug, label: b.name }))]}
              />
              {err("brand_slug")}
            </div>
            <div className={a.field}>
              <label htmlFor="category">Catégorie</label>
              <Select
                id="category"
                value={f.category_slug}
                onChange={(v) => set("category_slug", v)}
                options={[{ value: "", label: "Choisir…" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
              />
              {err("category_slug")}
            </div>
            <div className={a.field}>
              <label htmlFor="condition">État</label>
              <Select
                id="condition"
                value={f.condition}
                onChange={(v) => set("condition", v)}
                options={["Neuf", "Reconditionné", "Occasion"]}
              />
            </div>
          </div>
          <div className={a.field}>
            <label htmlFor="description">Description</label>
            <textarea id="description" rows={3} value={f.description} onChange={onText("description")} />
          </div>
          <div className={a.grid2}>
            <div className={a.field}>
              <label htmlFor="highlights">Points forts</label>
              <textarea
                id="highlights"
                rows={4}
                value={f.highlights}
                onChange={onText("highlights")}
                placeholder={"Un par ligne, ex. :\nÉcran 6,1\" OLED\nBatterie 3 349 mAh"}
              />
              <p className={a.hint}>Un point fort par ligne (8 maximum).</p>
            </div>
            <div className={a.form}>
              <div className={a.grid2}>
                <div className={a.field}>
                  <label htmlFor="ram">RAM (Go)</label>
                  <input id="ram" type="number" min="0" inputMode="numeric" value={f.ram_gb} onChange={onText("ram_gb")} />
                </div>
                <div className={a.field}>
                  <label htmlFor="warranty">Garantie (mois)</label>
                  <input id="warranty" type="number" min="0" inputMode="numeric" value={f.warranty_months} onChange={onText("warranty_months")} />
                </div>
              </div>
              <label className={a.check}>
                <input type="checkbox" checked={f.is_5g} onChange={onCheck("is_5g")} /> Compatible 5G
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Photos */}
      <section className={a.card}>
        <h2 className={a.cardTitle}>Photos</h2>
        <div className={styles.images}>
          {f.images.map((src, i) => (
            <div key={src} className={styles.image}>
              <Image src={src} alt="" fill sizes="140px" className={styles.imageImg} />
              {i === 0 && <span className={styles.main}>Principale</span>}
              <div className={styles.imageTools}>
                <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Déplacer à gauche">
                  <ArrowLeft size={14} />
                </button>
                <button type="button" onClick={() => moveImage(i, 1)} disabled={i === f.images.length - 1} aria-label="Déplacer à droite">
                  <ArrowRight size={14} />
                </button>
                <button type="button" onClick={() => removeRow("images", i)} aria-label="Retirer la photo">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <div key={`up-${i}`} className={`${styles.image} ${styles.uploading}`} aria-label="Envoi en cours" />
          ))}
          {f.images.length + uploading < 10 && (
            <button type="button" className={styles.addImage} onClick={() => fileRef.current?.click()}>
              <ImagePlus size={24} aria-hidden />
              Ajouter des photos
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={onFiles} />
        <p className={a.hint}>10 photos maximum, idéalement sur fond blanc. La première est la photo principale.</p>
      </section>

      {/* Variantes & stock */}
      <section className={a.card}>
        <h2 className={a.cardTitle}>Prix & stock</h2>
        <p className={`${a.hint} ${styles.intro}`}>
          Une ligne par version vendue (ex. 128 Go, 256 Go). Pour un produit unique, laisse le nom vide.
          {isOwner && " Le prix plancher reste invisible pour les clients et les vendeurs."}
        </p>
        {err("variants")}
        <div className={styles.variants}>
          <div className={`${styles.variantRow} ${styles.variantHead} ${isOwner ? styles.withFloor : ""}`} aria-hidden>
            <span>Nom</span>
            <span>Prix (FCFA)</span>
            <span>Prix barré</span>
            <span>Stock</span>
            {isOwner && <span>Plancher</span>}
            <span />
          </div>
          {f.variants.map((v, i) => (
            <div key={v.id ?? `new-${i}`} className={`${styles.variantRow} ${isOwner ? styles.withFloor : ""}`}>
              <input className={a.input} aria-label="Nom de la variante" placeholder="128 Go" value={v.label} onChange={(e) => setRow("variants", i, "label", e.target.value)} />
              <div>
                <input className={a.input} aria-label="Prix" type="number" min="1" inputMode="numeric" value={v.price} onChange={(e) => setRow("variants", i, "price", e.target.value)} />
                {err(`variants.${i}.price`)}
              </div>
              <div>
                <input className={a.input} aria-label="Prix barré" type="number" min="1" inputMode="numeric" placeholder="—" value={v.old_price} onChange={(e) => setRow("variants", i, "old_price", e.target.value)} />
                {err(`variants.${i}.old_price`)}
              </div>
              <div>
                <input className={a.input} aria-label="Stock" type="number" min="0" inputMode="numeric" value={v.stock} onChange={(e) => setRow("variants", i, "stock", e.target.value)} />
                {err(`variants.${i}.stock`)}
              </div>
              {isOwner && (
                <div>
                  <input className={a.input} aria-label="Prix plancher" type="number" min="1" inputMode="numeric" placeholder="—" value={v.floor_price} onChange={(e) => setRow("variants", i, "floor_price", e.target.value)} />
                  {err(`variants.${i}.floor_price`)}
                </div>
              )}
              <button
                type="button"
                className={`${a.iconBtn} ${a.danger}`}
                onClick={() => removeRow("variants", i)}
                disabled={f.variants.length === 1}
                aria-label="Supprimer la variante"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className={`${a.linkBtn} ${styles.addRow}`} onClick={() => addRow("variants", { ...EMPTY_VARIANT })}>
          <Plus size={16} aria-hidden /> Ajouter une variante
        </button>
      </section>

      <div className={a.grid2}>
        {/* Couleurs */}
        <section className={a.card}>
          <h2 className={a.cardTitle}>Couleurs</h2>
          {err("colors")}
          <div className={styles.rows}>
            {f.colors.map((c, i) => (
              <div key={i} className={styles.colorRow}>
                <input type="color" aria-label="Teinte" value={c.hex} onChange={(e) => setRow("colors", i, "hex", e.target.value)} />
                <input className={a.input} aria-label="Nom de la couleur" placeholder="Noir" value={c.name} onChange={(e) => setRow("colors", i, "name", e.target.value)} />
                <button type="button" className={`${a.iconBtn} ${a.danger}`} onClick={() => removeRow("colors", i)} aria-label="Retirer la couleur">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className={`${a.linkBtn} ${styles.addRow}`} onClick={() => addRow("colors", { name: "", hex: "#1D1E22" })}>
            <Plus size={16} aria-hidden /> Ajouter une couleur
          </button>
        </section>

        {/* Caractéristiques */}
        <section className={a.card}>
          <h2 className={a.cardTitle}>Caractéristiques</h2>
          <div className={styles.rows}>
            {f.specs.map((s, i) => (
              <div key={i} className={styles.specRow}>
                <input className={a.input} aria-label="Caractéristique" placeholder="Écran" value={s.label} onChange={(e) => setRow("specs", i, "label", e.target.value)} />
                <input className={a.input} aria-label="Valeur" placeholder={'6,1" OLED'} value={s.value} onChange={(e) => setRow("specs", i, "value", e.target.value)} />
                <button type="button" className={`${a.iconBtn} ${a.danger}`} onClick={() => removeRow("specs", i)} aria-label="Retirer la caractéristique">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className={`${a.linkBtn} ${styles.addRow}`} onClick={() => addRow("specs", { label: "", value: "" })}>
            <Plus size={16} aria-hidden /> Ajouter une caractéristique
          </button>
        </section>
      </div>

      {/* Visibilité */}
      <section className={a.card}>
        <h2 className={a.cardTitle}>Visibilité</h2>
        <div className={styles.toggles}>
          <label className={a.check}>
            <input type="checkbox" checked={f.is_published} onChange={onCheck("is_published")} /> Publié dans la boutique
          </label>
          <label className={a.check}>
            <input type="checkbox" checked={f.is_featured} onChange={onCheck("is_featured")} /> Coup de cœur (page d&apos;accueil)
          </label>
          <label className={a.check}>
            <input type="checkbox" checked={f.is_flash} onChange={onCheck("is_flash")} /> Vente flash
          </label>
          <label className={a.check}>
            <input type="checkbox" checked={f.force_out_of_stock} onChange={onCheck("force_out_of_stock")} /> Marquer en rupture
            de stock (reste visible, ne se vend plus)
          </label>
        </div>
      </section>

      <div className={a.stickyBar}>
        {product && (
          <button type="button" className={`${a.linkBtn} ${styles.delete}`} onClick={onDelete} disabled={pending}>
            Supprimer le produit
          </button>
        )}
        <Button href="/gerant/produits" variant="secondary">
          Annuler
        </Button>
        <Button type="submit" disabled={pending || uploading > 0}>
          {pending ? "Enregistrement…" : uploading > 0 ? "Envoi des photos…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
