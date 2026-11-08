import Image from "next/image";
import clsx from "clsx";

interface ThemeLogoProps {
  variant?: "symbol" | "full";
  className?: string;
  priority?: boolean;
}

export function ThemeLogo({ variant = "full", className, priority = false }: ThemeLogoProps) {
  if (variant === "symbol") {
    return (
      <span className={clsx("theme-logo theme-logo-symbol", className)}>
        <Image
          src="/brand/beefcourt-symbol-light-transparent.png"
          alt="Beef Court"
          width={1024}
          height={1024}
          priority={priority}
          className="logo-img logo-light"
        />
        <Image
          src="/brand/beefcourt-symbol-dark-transparent.png"
          alt=""
          width={1024}
          height={1024}
          priority={priority}
          className="logo-img logo-dark"
          aria-hidden="true"
        />
      </span>
    );
  }

  return (
    <span className={clsx("theme-logo theme-logo-full", className)}>
      <Image
        src="/brand/beefcourt-logo-light-bg.png"
        alt="Beef Court"
        width={1057}
        height={374}
        priority={priority}
        className="logo-img logo-light"
      />
      <Image
        src="/brand/beefcourt-logo-dark-bg.png"
        alt=""
        width={1057}
        height={374}
        priority={priority}
        className="logo-img logo-dark"
        aria-hidden="true"
      />
    </span>
  );
}
