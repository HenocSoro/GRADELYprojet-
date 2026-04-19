/**
 * Carte glassmorphism premium — design system Gradely
 * bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-zinc-200
 */

export default function Card({ children, className = "", hoverable = false }) {
  return (
    <div
      className={
        "rounded-2xl bg-white border border-gray-100 shadow transition-all duration-200 " +
        (hoverable ? "hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 " : "") +
        className
      }
    >
      {children}
    </div>
  );
}
