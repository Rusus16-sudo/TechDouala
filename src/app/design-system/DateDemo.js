"use client";

import { useState } from "react";
import DateField from "@/components/admin/DateField";

/** Aperçu du champ date de l'espace gérant (calendrier maison, en français). */
export default function DateDemo() {
  const [value, setValue] = useState("");
  return (
    <div data-demo-date style={{ maxWidth: 260 }}>
      <DateField id="demo-date" label="Début de l'annonce" optional value={value} onChange={setValue} hint="Vide : dès la publication." />
    </div>
  );
}
