/**
 * Logo Gradely — identité visuelle.
 * Filtre CSS hue-rotate pour convertir le teal d'origine en bleu cohérent avec le thème.
 */

import gradelyLogo from "@/assets/logo/gradely-logo.png";

const BLUE_FILTER = "hue-rotate(47deg) saturate(1.2) brightness(1.1)";

// On fixe la LARGEUR (pas la hauteur) pour que le logo remplisse l'espace correctement
const INLINE_SIZES = {
  sidebar: { width: "160px", height: "auto" },
  auth:    { width: "220px", height: "auto" },
  navbar:  { width: "140px", height: "auto" },
};

export default function Logo({ variant = "navbar", className = "" }) {
  return (
    <img
      src={gradelyLogo}
      alt="Gradely"
      className={className}
      style={{ ...(INLINE_SIZES[variant] ?? INLINE_SIZES.navbar), filter: BLUE_FILTER }}
      draggable={false}
    />
  );
}
