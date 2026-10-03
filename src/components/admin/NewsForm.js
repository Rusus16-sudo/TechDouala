"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, LayoutGrid, Megaphone, X } from "lucide-react";
import Button from "@/components/ui/Button";
import DateField from "@/components/admin/DateField";
import { createClient } from "@/lib/supabase/client";
import { createNews } from "@/app/(gerant)/gerant/actualites/actions";
import a from "./admin.module.css";
import styles from "./NewsForm.module.css";
import Select from "@/components/ui/Select";

const INITIAL = {
  title: "",
  body: "",
  image_url: "",
  cta_label: "",
  cta_href: "",
  placement: "accueil",
  starts_at: "",
  ends_at: "",
  is_published: true,
};

// Emplacements : deux façons très différentes d'apparaître côté client.
const PLACEMENTS = [
  {
    value: "accueil",
    icon: LayoutGrid,
    title: "Carte sur l'accueil",
    desc: "Une vignette avec image dans la page d'accueil.",
  },
  {
    value: "bandeau",
    icon: Megaphone,
    title: "Bandeau en haut du site",
    desc: "Une ligne visible sur toutes les pages. Sans image.",
  },
];

/** Destinations proposées pour le bouton : des pages qui existent réellement. */
function destinations(categories) {
  return [
    { value: "", label: "Aucun bouton" },
    { value: "/ventes-flash", label: "Ventes flash" },
    { value: "/reconditionnes", label: "Téléphones reconditionnés" },
    { value: "/credit", label: "Crédit 40/60" },
    ...categories.map((c) => ({ value: `/categories/${c.slug}`, label: `Catégorie : ${c.name}` })),
    { value: "/", label: "Page d'accueil" },
    { value: "autre", label: "Autre adresse (https://…)" },
  ];
}

export default function NewsForm({ categories = [] }) {
  const router = useRouter();
  const [f, setF] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [custom, setCustom] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef(null);
  const summaryRef = useRef(null);

  const options = destinations(categories);
  const set = (k) => (e) => setF((cur) => ({ ...cur, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setValue = (k) => (v) => setF((cur) => ({ ...cur, [k]: v }));

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const supabase = createClient();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `news/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("produits").upload(path, file, { contentType: file.type });
    if (error) setMessage({ error: `Image non envoyée : ${error.message}` });
    else setF((cur) => ({ ...cur, image_url: supabase.storage.from("produits").getPublicUrl(path).data.publicUrl }));
    setUploading(false);
  }

  /** Contrôles avant envoi : chaque problème est rattaché à son champ. */
  function validate() {
    const e = {};
    if (f.title.trim().length < 3) e.title = "Donne un titre d'au moins 3 caractères.";
    if (f.cta_href && !(f.cta_href.startsWith("/") || f.cta_href.startsWith("https://"))) {
      e.cta_href = "Une adresse complète commence par https:// — ou choisis une page du site dans la liste.";
    }
    if (custom && !f.cta_href.trim()) e.cta_href = "Indique l'adresse, ou repasse sur « Aucun bouton ».";
    if (f.cta_href && !f.cta_label.trim()) e.cta_label = "Écris le texte affiché sur le bouton, par exemple « Voir l'offre ».";
    if (f.starts_at && f.ends_at && f.ends_at < f.starts_at) e.ends_at = "La fin tombe avant le début.";
    return e;
  }

  function onSubmit(ev) {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setMessage({ error: "Actualité non enregistrée : corrige les points ci-dessous." });
      // Le résumé prend le focus et revient à l'écran : une erreur ne doit pas rester invisible.
      requestAnimationFrame(() => {
        summaryRef.current?.focus();
        summaryRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }
    startTransition(async () => {
      const res = await createNews(f);
      if (!res.ok) {
        setMessage({ error: res.message });
        requestAnimationFrame(() => {
          summaryRef.current?.focus();
          summaryRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
        return;
      }
      setF(INITIAL);
      setCustom(false);
      setErrors({});
      setMessage({ ok: "Actualité enregistrée. Elle apparaît dans la liste ci-dessous." });
      router.refresh();
    });
  }

  const fieldProps = (name) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-erreur` : undefined,
  });

  return (
    <form onSubmit={onSubmit} className={a.form} noValidate>
      <div ref={summaryRef} tabIndex={-1} className={styles.summary}>
        {message?.error && (
          <p className={a.alert} role="alert">
            {message.error}
          </p>
        )}
        {message?.ok && (
          <p className={a.success} role="status">
            <CheckCircle2 size={16} aria-hidden /> {message.ok}
          </p>
        )}
      </div>

      <div className={a.field}>
        <label htmlFor="title">Titre</label>
        <input id="title" value={f.title} onChange={set("title")} placeholder="Arrivage iPhone 16 !" {...fieldProps("title")} />
        {errors.title && (
          <p className={a.error} id="title-erreur">
            {errors.title}
          </p>
        )}
      </div>

      <fieldset className={styles.choice}>
        <legend className={a.label}>Emplacement</legend>
        <div className={styles.cards}>
          {PLACEMENTS.map(({ value, icon: Icon, title, desc }) => (
            <label key={value} className={`${styles.card} ${f.placement === value ? styles.cardActive : ""}`}>
              <input type="radio" name="placement" value={value} checked={f.placement === value} onChange={set("placement")} />
              <Icon size={18} aria-hidden />
              <span className={styles.cardText}>
                <strong>{title}</strong>
                <span>{desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={a.field}>
        <label htmlFor="body">Texte</label>
        <textarea id="body" rows={3} value={f.body} onChange={set("body")} placeholder="Stock limité, commande sur WhatsApp." />
      </div>

      <fieldset className={styles.group}>
        <legend className={a.label}>Bouton (facultatif)</legend>
        <p className={a.hint}>
          Un bouton rend l&apos;annonce cliquable : le client arrive directement sur la page choisie. Sans bouton, l&apos;annonce reste
          informative.
        </p>
        <div className={a.grid2}>
          <div className={a.field}>
            <label htmlFor="cta_dest">Où mène le bouton</label>
            <Select
              id="cta_dest"
              value={custom ? "autre" : f.cta_href}
              onChange={(v) => {
                setCustom(v === "autre");
                setF((cur) => ({ ...cur, cta_href: v === "autre" ? "" : v }));
                setErrors((cur) => ({ ...cur, cta_href: undefined }));
              }}
              options={options}
            />
          </div>
          <div className={a.field}>
            <label htmlFor="cta_label">Texte affiché sur le bouton</label>
            <input
              id="cta_label"
              value={f.cta_label}
              onChange={set("cta_label")}
              placeholder="Voir l'offre"
              disabled={!f.cta_href && !custom}
              {...fieldProps("cta_label")}
            />
            {errors.cta_label && (
              <p className={a.error} id="cta_label-erreur">
                {errors.cta_label}
              </p>
            )}
          </div>
        </div>
        {custom && (
          <div className={a.field}>
            <label htmlFor="cta_href">Adresse du site externe</label>
            <input
              id="cta_href"
              value={f.cta_href}
              onChange={set("cta_href")}
              placeholder="https://wa.me/237676547289"
              {...fieldProps("cta_href")}
            />
            {errors.cta_href ? (
              <p className={a.error} id="cta_href-erreur">
                {errors.cta_href}
              </p>
            ) : (
              <p className={a.hint}>Adresse complète, commençant par https://</p>
            )}
          </div>
        )}
      </fieldset>

      <div className={a.grid3}>
        <DateField
          id="starts_at"
          label="Début de l'annonce"
          optional
          value={f.starts_at}
          onChange={setValue("starts_at")}
          hint="Vide : dès la publication."
        />
        <DateField
          id="ends_at"
          label="Fin de l'annonce"
          optional
          value={f.ends_at}
          onChange={setValue("ends_at")}
          min={f.starts_at}
          hint="Vide : jusqu'à ce que tu la dépublies."
          error={errors.ends_at}
        />
        <div className={a.field}>
          <span className={a.label}>Image {f.placement === "bandeau" && <span className={styles.muted}>· inutile pour un bandeau</span>}</span>
          {f.image_url ? (
            <div className={styles.preview}>
              <Image src={f.image_url} alt="" fill sizes="200px" />
              <button type="button" onClick={() => setF((cur) => ({ ...cur, image_url: "" }))} aria-label="Retirer l'image">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button type="button" className={styles.upload} onClick={() => fileRef.current?.click()} disabled={uploading}>
              <ImagePlus size={18} aria-hidden /> {uploading ? "Envoi…" : "Ajouter une image"}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onFile} />
        </div>
      </div>

      <label className={a.check}>
        <input type="checkbox" checked={f.is_published} onChange={set("is_published")} /> Publier maintenant (sinon, brouillon)
      </label>

      <div className={styles.submit}>
        <Button type="submit" disabled={pending || uploading}>
          {pending ? "Enregistrement…" : "Enregistrer l'actualité"}
        </Button>
        {message?.error && <span className={a.error}>Non enregistrée — voir le détail en haut du formulaire.</span>}
        {message?.ok && <span className={styles.okInline}>Enregistrée</span>}
      </div>
    </form>
  );
}
