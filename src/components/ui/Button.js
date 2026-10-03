import Link from "next/link";
import styles from "./Button.module.css";

/**
 * Boutons de la maquette : principal (violet), secondaire (contour),
 * succès (vert), alerte (orange).
 */
export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  href,
  icon: Icon,
  className = "",
  children,
  ...props
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    block ? styles.block : "",
    className,
  ].join(" ");

  const content = (
    <>
      {Icon && <Icon size={size === "sm" ? 16 : 18} strokeWidth={2.25} aria-hidden />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
