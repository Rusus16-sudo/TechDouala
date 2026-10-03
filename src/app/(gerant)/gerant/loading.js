import a from "@/components/admin/admin.module.css";

// Affiché dès le clic, le temps que la page (commande, produit, crédit…) charge ses données.
export default function Loading() {
  return (
    <div className={a.skeleton} aria-busy="true" aria-label="Chargement">
      <span className={a.skeletonTitle} />
      <span className={a.skeletonLine} />
      <div className={a.skeletonGrid}>
        <span className={a.skeletonCard} />
        <span className={a.skeletonCard} />
      </div>
    </div>
  );
}
