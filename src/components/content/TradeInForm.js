"use client";

import { useState } from "react";
import { CircleAlert, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { whatsappLink } from "@/lib/store";
import styles from "./TradeInForm.module.css";

const BRANDS = ["Apple", "Samsung", "Google Pixel", "Xiaomi / Redmi", "Tecno", "Infinix", "Itel", "Autre"];
const STORAGES = ["32 Go", "64 Go", "128 Go", "256 Go", "512 Go", "1 To", "Je ne sais pas"];
const STATES = [
  { id: "comme-neuf", label: "Comme neuf", hint: "Aucune rayure visible" },
  { id: "bon-etat", label: "Bon état", hint: "Quelques traces d'usage" },
  { id: "use", label: "Usé", hint: "Rayures ou chocs visibles" },
  { id: "panne", label: "Écran cassé ou en panne", hint: "Fonctionne mal ou plus du tout" },
];

/** Demande d'estimation de reprise : le message est préparé et envoyé sur WhatsApp, photos à joindre. */
export default function TradeInForm({ target = "" }) {
  const [f, setF] = useState({ brand: "", model: "", storage: "", state: "", box: false, charger: false, target });
  const [error, setError] = useState("");
  const set = (key) => (e) => setF((cur) => ({ ...cur, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  function onSubmit(e) {
    e.preventDefault();
    if (!f.brand || f.model.trim().length < 2 || !f.state) {
      setError("Indique la marque, le modèle et l'état de ton téléphone.");
      return;
    }
    setError("");
    const state = STATES.find((s) => s.id === f.state)?.label;
    const extras = [f.box && "boîte", f.charger && "chargeur"].filter(Boolean);
    const message = [
      "Bonjour TechDouala, je souhaite faire estimer mon téléphone pour une reprise.",
      "",
      `Téléphone : ${f.brand === "Autre" ? "" : `${f.brand} `}${f.model.trim()}${f.storage ? ` (${f.storage})` : ""}`,
      `État : ${state}`,
      `Avec : ${extras.length ? extras.join(" et ") : "le téléphone seul"}`,
      f.target.trim() ? `Je veux acheter : ${f.target.trim()}` : null,
      "",
      "Je vous envoie les photos (face, dos et écran allumé).",
    ]
      .filter((l) => l !== null)
      .join("\n");
    window.open(whatsappLink(message), "_blank", "noopener");
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="reprise-marque" className={styles.label}>
            Marque
          </label>
          <Select
            id="reprise-marque"
            size="lg"
            value={f.brand}
            onChange={(v) => setF((cur) => ({ ...cur, brand: v }))}
            options={[{ value: "", label: "Choisir…" }, ...BRANDS]}
          />
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Modèle</span>
          <input value={f.model} onChange={set("model")} placeholder="Ex. : iPhone 11, Galaxy A54" required />
        </label>
        <div className={styles.field}>
          <label htmlFor="reprise-stockage" className={styles.label}>
            Stockage (facultatif)
          </label>
          <Select
            id="reprise-stockage"
            size="lg"
            value={f.storage}
            onChange={(v) => setF((cur) => ({ ...cur, storage: v }))}
            options={[{ value: "", label: "Choisir…" }, ...STORAGES]}
          />
        </div>
      </div>

      <fieldset className={styles.states}>
        <legend>État</legend>
        <div className={styles.cards}>
          {STATES.map((s) => (
            <label key={s.id} className={styles.card}>
              <input type="radio" name="state" value={s.id} checked={f.state === s.id} onChange={set("state")} />
              <strong>{s.label}</strong>
              <span>{s.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.extras}>
        <legend>Il est vendu avec</legend>
        <label>
          <input type="checkbox" checked={f.box} onChange={set("box")} /> Sa boîte
        </label>
        <label>
          <input type="checkbox" checked={f.charger} onChange={set("charger")} /> Son chargeur
        </label>
      </fieldset>

      <label className={styles.field}>
        <span className={styles.label}>Le téléphone que tu veux acheter (facultatif)</span>
        <input value={f.target} onChange={set("target")} placeholder="Ex. : Galaxy S24" />
      </label>

      {error && (
        <p className={styles.error} role="alert">
          <CircleAlert size={16} aria-hidden /> {error}
        </p>
      )}

      <div className={styles.submit}>
        <Button type="submit" size="lg">
          <MessageCircle size={18} aria-hidden /> Demander mon estimation sur WhatsApp
        </Button>
        <p>WhatsApp s&apos;ouvre avec ta demande : ajoute 3 photos (face, dos, écran allumé) avant d&apos;envoyer.</p>
      </div>
    </form>
  );
}
