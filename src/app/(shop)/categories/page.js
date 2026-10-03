import Link from "next/link";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { categoryIcon } from "@/lib/catalog";
import { getCategories, getProducts } from "@/lib/data/catalog";
import styles from "./categories.module.css";

export const metadata = { title: "Catégories - TechDouala" };

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Catégories" }]} />
      <h1 className={styles.title}>Toutes les catégories</h1>
      <ul className={styles.grid}>
        {categories.map(({ slug, name }) => {
          const Icon = categoryIcon(slug);
          const n = products.filter((p) => p.category === slug).length;
          return (
            <li key={slug}>
              <Link href={`/categories/${slug}`} className={styles.tile}>
                <span className={styles.icon}>
                  <Icon size={36} strokeWidth={1.5} aria-hidden />
                </span>
                <span className={styles.name}>{name}</span>
                <span className={styles.count}>
                  {n} produit{n > 1 ? "s" : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
