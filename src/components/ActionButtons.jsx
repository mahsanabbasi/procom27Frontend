import registerArrow from "../assets/team-register-arrow.svg";
import registerIcon from "../assets/team-register-icon.svg";
import primaryArrow from "../assets/team-primary-arrow.svg";
import primaryIcon from "../assets/team-primary-icon.svg";
import textArrow from "../assets/team-text-arrow.svg";

export function PrimaryButton({
  label,
  onClick,
  disabled = false,
  iconSrc = primaryIcon,
  arrowSrc = primaryArrow,
}) {
  return (
    <button
      className="group relative flex h-[52px] items-center justify-center gap-3 rounded-xs bg-violet-500 px-5 font-pixel font-bold text-[11px] tracking-[1.98px] text-black shadow-[inset_0px_-2px_0px_0px_rgba(0,0,0,0.18),inset_0px_1px_0px_0px_rgba(255,255,255,0.35)] transition-[background-color,box-shadow,transform] duration-150 hover:bg-violet-200 hover:shadow-[0_0_0_3px_rgba(181,124,255,0.16),0_0_16px_rgba(181,124,255,0.5),inset_0px_-2px_0px_0px_rgba(0,0,0,0.18),inset_0px_1px_0px_0px_rgba(255,255,255,0.35)] active:translate-y-px active:shadow-[inset_0px_2px_0px_0px_rgba(0,0,0,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-000 disabled:pointer-events-none disabled:bg-bg-200 disabled:text-ink-muted disabled:shadow-none sm:px-7 sm:text-[14px] sm:tracking-[2.52px]"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <img
        alt=""
        aria-hidden="true"
        className="h-3 w-3 group-disabled:opacity-40"
        height="12"
        src={iconSrc}
        width="12"
      />
      {label}
      <img
        alt=""
        aria-hidden="true"
        className="h-4 w-4 group-disabled:opacity-40"
        height="16"
        src={arrowSrc}
        width="16"
      />
    </button>
  );
}

export function SecondaryButton({
  label,
  onClick,
  disabled = false,
  arrowSrc = primaryArrow,
}) {
  return (
    <button
      className="group flex h-[52px] items-center justify-center gap-3 rounded-xs border border-violet-800 px-5 font-pixel text-[11px] tracking-[1.98px] text-ink transition-[background-color,border-color,color,transform] duration-150 hover:border-violet-500 hover:bg-violet-tint-14 hover:text-violet-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-000 disabled:pointer-events-none disabled:border-line-subtle disabled:bg-transparent disabled:text-ink-muted sm:px-7 sm:text-[14px] sm:tracking-[2.52px]"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
      <img
        alt=""
        aria-hidden="true"
        className="h-4 w-4 brightness-0 invert group-disabled:opacity-40"
        height="16"
        src={arrowSrc}
        width="16"
      />
    </button>
  );
}

export function RegisterButton({
  label = "REGISTER",
  registered = false,
  onClick,
  className = "",
  registeredLabel = "REGISTERED",
  iconSrc = registerIcon,
  arrowSrc = registerArrow,
  disabled = false,
}) {
  return (
    <button
      aria-pressed={registered}
      className={`group flex h-12 items-center justify-center gap-3 rounded-xs border-[1.5px] border-violet-500 bg-violet-tint-14 px-4 font-pixel text-[11px] tracking-[1.98px] text-white transition-colors duration-150 hover:bg-violet-500 hover:text-black active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-000 disabled:pointer-events-none disabled:border-line-subtle disabled:bg-bg-100 disabled:text-ink-muted sm:text-[14px] sm:tracking-[2.52px] ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <img
        alt=""
        aria-hidden="true"
        className="h-3 w-3 group-hover:brightness-0 group-disabled:opacity-40"
        height="12"
        src={iconSrc}
        width="12"
      />

      {registered ? registeredLabel : label}

      <img
        alt=""
        aria-hidden="true"
        className="h-4 w-4 group-hover:brightness-0 group-disabled:opacity-40"
        height="16"
        src={arrowSrc}
        width="16"
      />
    </button>
  );
}

export function TextLink({
  href = "#top",
  label,
  className = "",
  disabled = false,
}) {
  return (
    <a
      aria-disabled={disabled || undefined}
      className={`inline-flex items-center gap-2 border-b border-violet-500/45 pb-1 font-pixel text-[10px] font-bold tracking-[1.8px] text-violet-500 transition-colors hover:border-violet-200 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-000 aria-disabled:pointer-events-none aria-disabled:border-line-subtle aria-disabled:text-ink-muted sm:text-[11px] sm:tracking-[1.98px] ${className}`}
      href={disabled ? undefined : href}
      tabIndex={disabled ? -1 : undefined}
    >
      {label}
      <img
        alt=""
        aria-hidden="true"
        className="h-4 w-4 group-aria-disabled:opacity-40"
        height="16"
        src={textArrow}
        width="16"
      />
    </a>
  );
}
