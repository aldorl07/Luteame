import * as fs from "fs";
import { getProductImage } from "./product-images";

function updateCatalogImages(filePath: string) {
  let content = fs.readFileSync(filePath, "utf8");

  // Replace each product's imagenUrl cleanly
  // A product block starts with { and contains nombre: "...", categoria: "..." and imagenUrl: "..."
  const updated = content.replace(
    /\{\s*nombre:\s*"([^"]+)"\s*,\s*categoria:\s*"([^"]+)"[\s\S]*?imagenUrl:\s*"([^"]+)"/g,
    (wholeMatch, nombre, categoria, oldUrl) => {
      const newImage = getProductImage(nombre, categoria);
      return wholeMatch.replace(`imagenUrl: "${oldUrl}"`, `imagenUrl: "${newImage}"`);
    }
  );

  fs.writeFileSync(filePath, updated, "utf8");
  console.log(`✅ ${filePath} actualizado exitosamente.`);
}

updateCatalogImages("scripts/seed-firestore.ts");
updateCatalogImages("src/app/admin/page.tsx");
