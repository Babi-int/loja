const LOGO_SRC = "/logo-maricota-kids.png";

export default function BrandLogo({ className = "", variant = "default" }) {
  const sizes =
    variant === "compact"
      ? "h-9 w-auto max-w-[140px]"
      : variant === "sidebar"
        ? "w-full max-w-[240px] h-auto object-contain"
        : "mx-auto w-full max-w-[280px] h-auto object-contain";

  return (
    <img
      src={LOGO_SRC}
      alt="Maricota Kids — Tratando seu estilo com carinho"
      className={`${sizes} ${className}`.trim()}
      decoding="async"
    />
  );
}
