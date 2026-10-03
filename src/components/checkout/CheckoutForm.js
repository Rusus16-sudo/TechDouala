"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, CircleAlert, CreditCard, Lock, MessageCircle, Smartphone, Tag, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { checkPromo, placeOrder } from "@/app/(shop)/commande/actions";
import { MAX_NOTE_LENGTH, validateCheckout } from "@/lib/checkout";
import { creditPlan } from "@/lib/credit";
import { orderMessage, waLink } from "@/lib/whatsapp";
import { formatFCFA } from "@/lib/format";
import styles from "./CheckoutForm.module.css";

export const LAST_ORDER_KEY = "td-last-order";

const INITIAL = {
  fullName: "",
  phone: "",
  email: "",
  credit: false,
  note: "",
};

function Field({ label, error, hint, children, id }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      ) : (
        hint && <p className={styles.hint}>{hint}</p>
      )}
    </div>
  );
}

export default function CheckoutForm({ prefill = null, creditInfo = null }) {
  const router = useRouter();
  const { lines, subtotal, clear, ready } = useCart();
  const [f, setF] = useState(() => ({ ...INITIAL, ...prefill }));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState(null); // { code, discount, label, forSubtotal }
  const [promoMsg, setPromoMsg] = useState("");
  const [checkingPromo, startPromo] = useTransition();

  const set = (key) => (e) => setF((cur) => ({ ...cur, [key]: e.target.value }));
  // Une remise n'est valable que pour le panier sur lequel elle a été vérifiée.
  const activePromo = promo && promo.forSubtotal === subtotal ? promo : null;
  const discount = activePromo?.discount ?? 0;
  const total = subtotal - discount;

  function applyPromo() {
    setPromoMsg("");
    startPromo(async () => {
      const res = await checkPromo({ code: promoInput, items: lines, phone: f.phone });
      if (res?.ok) {
        setPromo({ code: res.code, discount: res.discount, label: res.label, forSubtotal: subtotal });
        setPromoInput("");
      } else {
        setPromo(null);
        setPromoMsg(res?.message ?? "Code promo invalide.");
      }
    });
  }
  const creditAllowed = !!creditInfo?.ok;
  const isCredit = f.credit && creditAllowed;
  const plan = creditPlan(total);

  const err = (key) => (errors[key] ? { "aria-invalid": true, "aria-describedby": `${key}-error` } : {});

  function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    const found = validateCheckout(f);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    startTransition(async () => {
      const res = await placeOrder({ form: { ...f, credit: isCredit }, items: lines, promoCode: activePromo?.code });
      if (!res.ok) {
        setErrors(res.errors ?? {});
        setMessage(res.message ?? "Vérifie les champs en rouge.");
        return;
      }
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(res.order));
      } catch {}
      clear();
      // La commande se termine sur WhatsApp, message déjà rédigé ; la page de confirmation
      // garde le bouton si le navigateur bloque l'ouverture.
      window.open(waLink(orderMessage(res.order)), "_blank", "noopener");
      router.push("/commande/confirmation");
    });
  }

  if (!ready) return <div className={styles.loading} aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h1>Ton panier est vide</h1>
        <p>Ajoute un produit avant de passer commande.</p>
        <Button href="/categories/smartphones">Découvrir le catalogue</Button>
      </div>
    );
  }

  return (
    <form className={styles.layout} onSubmit={onSubmit} noValidate>
      <div className={styles.steps}>
        <h1 className={styles.title}>Finaliser ma commande</h1>

        {/* 1. Coordonnées */}
        <section className={styles.step} aria-labelledby="step-1">
          <h2 id="step-1">
            <span>1</span> Tes coordonnées
          </h2>
          <div className={styles.grid2}>
            <Field id="fullName" label="Nom et prénom" error={errors.fullName}>
              <input id="fullName" autoComplete="name" value={f.fullName} onChange={set("fullName")} {...err("fullName")} />
            </Field>
            <Field id="phone" label="Téléphone" error={errors.phone} hint="La boutique te répond sur ce numéro.">
              <div className={styles.prefixed}>
                <span>+237</span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="6 91 23 45 67"
                  value={f.phone}
                  onChange={set("phone")}
                  {...err("phone")}
                />
              </div>
            </Field>
            <Field id="email" label="E-mail (facultatif)" error={errors.email}>
              <input id="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} {...err("email")} />
            </Field>
          </div>
          {prefill ? (
            <p className={styles.account}>Commande liée à ton compte : tu pourras la suivre depuis « Mon compte ».</p>
          ) : (
            <p className={styles.account}>
              Tu as un compte ? <Link href="/connexion?suite=/commande">Connecte-toi</Link> pour suivre ta commande. Pas encore ?{" "}
              <Link href="/connexion?mode=inscription&suite=/commande">Crée-le en 1 minute</Link>.
            </p>
          )}
        </section>

        {/* 2. Règlement */}
        <section className={styles.step} aria-labelledby="step-2">
          <h2 id="step-2">
            <span>2</span> Règlement
          </h2>
          <div className={styles.cards} role="radiogroup" aria-label="Mode de règlement">
            <label className={styles.card}>
              <input
                type="radio"
                name="credit"
                checked={!f.credit}
                onChange={() => setF((cur) => ({ ...cur, credit: false }))}
              />
              <Banknote size={22} aria-hidden />
              <span className={styles.cardText}>
                <strong>Comptant</strong>
                <span>Cash, MTN MoMo ou Orange Money</span>
              </span>
            </label>
            <label className={`${styles.card} ${creditAllowed ? "" : styles.cardLocked}`}>
              <input
                type="radio"
                name="credit"
                checked={f.credit}
                disabled={!creditAllowed}
                onChange={() => setF((cur) => ({ ...cur, credit: true }))}
              />
              <CreditCard size={22} aria-hidden />
              <span className={styles.cardText}>
                <strong>Crédit 40/60</strong>
                <span>
                  {creditAllowed
                    ? "40 % à la remise, le reste en 6 mois"
                    : (creditInfo?.message ?? "Connecte-toi pour acheter à crédit")}
                </span>
              </span>
              {!creditAllowed && (
                <span className={styles.lock}>
                  <Lock size={12} aria-hidden /> {creditInfo ? "Indisponible" : "Compte requis"}
                </span>
              )}
            </label>
          </div>

          {isCredit && (
            <div className={styles.creditPlan}>
              <p className={styles.creditTitle}>Ton échéancier</p>
              <ul>
                <li>
                  <span>Acompte (40 %)</span>
                  <strong>{formatFCFA(plan.downPayment)}</strong>
                </li>
                <li>
                  <span>Puis {plan.months} mensualités</span>
                  <strong>{formatFCFA(plan.monthly)}</strong>
                </li>
              </ul>
              <p className={styles.hint}>
                La boutique ouvre ton dossier après votre échange sur WhatsApp. Sans pénalité ni frais cachés : le total
                reste {formatFCFA(total)}.
              </p>
            </div>
          )}

          <div className={styles.noteField}>
            <Field
              id="note"
              label="Un message pour la boutique (facultatif)"
              error={errors.note}
              hint="Il est ajouté à ton message WhatsApp."
            >
              <textarea
                id="note"
                rows={3}
                maxLength={MAX_NOTE_LENGTH}
                placeholder="Ex. : je passe en boutique samedi matin, ou une question sur la garantie"
                value={f.note}
                onChange={set("note")}
                {...err("note")}
              />
            </Field>
          </div>
        </section>
      </div>

      {/* Récapitulatif */}
      <aside className={styles.summary} aria-label="Récapitulatif de la commande">
        <h2>Ta commande</h2>
        <ul className={styles.lines}>
          {lines.map(({ key, qty, name, label, color, price, image }) => (
            <li key={key}>
              <span className={styles.lineThumb}>
                {image ? (
                  <Image src={image} alt="" fill sizes="52px" className={styles.lineImg} />
                ) : (
                  <Smartphone size={22} strokeWidth={1.25} aria-hidden />
                )}
                <span className={styles.lineQty}>{qty}</span>
              </span>
              <span className={styles.lineName}>
                {name}
                <small>{[label, color].filter(Boolean).join(" · ")}</small>
              </span>
              <strong>{formatFCFA(price * qty)}</strong>
            </li>
          ))}
        </ul>
        <div className={styles.promo}>
          {activePromo ? (
            <p className={styles.promoApplied}>
              <Tag size={16} aria-hidden />
              <span>
                Code <strong>{activePromo.code}</strong> appliqué ({activePromo.label})
              </span>
              <button type="button" onClick={() => setPromo(null)} aria-label="Retirer le code promo">
                <X size={16} />
              </button>
            </p>
          ) : (
            <div className={styles.promoRow}>
              <label htmlFor="promo" className={styles.srOnly}>
                Code promo
              </label>
              <input
                id="promo"
                placeholder="Code promo"
                value={promoInput}
                autoCapitalize="characters"
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (promoInput.trim()) applyPromo();
                  }
                }}
              />
              <button type="button" onClick={applyPromo} disabled={!promoInput.trim() || checkingPromo}>
                {checkingPromo ? "…" : "Appliquer"}
              </button>
            </div>
          )}
          {promoMsg && <p className={styles.error}>{promoMsg}</p>}
        </div>
        <dl className={styles.amounts}>
          <div>
            <dt>Sous-total</dt>
            <dd>{formatFCFA(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className={styles.discountRow}>
              <dt>Remise ({activePromo.code})</dt>
              <dd>-{formatFCFA(discount)}</dd>
            </div>
          )}
        </dl>
        <div className={styles.total}>
          <span>Total</span>
          <strong>{formatFCFA(total)}</strong>
        </div>

        {message && (
          <p className={styles.alert} role="alert">
            <CircleAlert size={18} aria-hidden /> {message}
          </p>
        )}

        <Button type="submit" size="lg" block disabled={pending}>
          {pending ? (
            "Envoi en cours…"
          ) : (
            <>
              <MessageCircle size={18} aria-hidden /> Envoyer ma commande sur WhatsApp
            </>
          )}
        </Button>
        <p className={styles.legal}>
          <Lock size={12} aria-hidden /> Ta commande est enregistrée, puis WhatsApp s&apos;ouvre avec son détail. Paiement
          et remise de ton appareil se conviennent avec un conseiller. Tu acceptes nos{" "}
          <Link href="/cgv">conditions de vente</Link>.
        </p>
      </aside>
    </form>
  );
}
