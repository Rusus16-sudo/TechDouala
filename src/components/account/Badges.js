import { Award, BadgeCheck, CalendarCheck, HeartHandshake, Star } from "lucide-react";
import { BADGES, BADGE_ORDER } from "@/lib/loyalty";
import styles from "./Badges.module.css";

const ICONS = {
  premier_achat: BadgeCheck,
  premiere_echeance: CalendarCheck,
  credit_solde: Award,
  client_fidele: HeartHandshake,
  premier_avis: Star,
};

/** Badges de fidélité : débloqués en couleur, à venir en gris (cahier 5.8). */
export default function Badges({ earned = [] }) {
  const got = new Set(earned.map((b) => b.badge));

  return (
    <ul className={styles.list}>
      {BADGE_ORDER.map((key) => {
        const Icon = ICONS[key];
        const unlocked = got.has(key);
        return (
          <li key={key} className={`${styles.badge} ${unlocked ? styles.unlocked : ""}`} title={BADGES[key].hint}>
            <span className={styles.icon}>
              <Icon size={22} strokeWidth={2} aria-hidden />
            </span>
            <span className={styles.text}>
              <strong>{BADGES[key].label}</strong>
              <span>{unlocked ? "Débloqué" : BADGES[key].hint}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
