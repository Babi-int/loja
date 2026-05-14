const LOGO_SRC = "/logo-simplerp.png";

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
      alt="SIMPLERP — Sistemas ERP para pequenas empresas"
      className={`${sizes} ${className}`.trim()}
      decoding="async"
    />
  );
}
