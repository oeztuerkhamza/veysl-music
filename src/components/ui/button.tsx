import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'> & {
    href: string;
  };

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined;
  };

export type ButtonProps = ButtonAsLink | ButtonAsButton;

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-medium ' +
  'transition-colors duration-300 ease-out-expo disabled:pointer-events-none disabled:opacity-50';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-bg hover:bg-ink/90 active:bg-ink/80',
  secondary: 'border border-line bg-transparent text-ink hover:border-gold hover:text-gold',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-2 hover:text-ink',
  // Gold sits on a fixed dark ink, never the theme's `ink` token: on gold
  // (#D6B36A) a light-mode `ink` (near-white) fails contrast badly (~1.8:1).
  gold: 'bg-gold text-on-gold hover:bg-gold-soft active:bg-gold-deep',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-6 px-4 text-xs tracking-wide',
  md: 'min-h-11 px-6 text-sm',
  lg: 'min-h-12 px-8 text-base',
};

function isExternalHref(href: string) {
  return href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:');
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props;
  const classes = cn(base, variantStyles[variant], sizeStyles[size], className);

  if (typeof rest.href === 'string') {
    const { href, ...anchorRest } = rest as { href: string } & Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      'href'
    >;

    if (isExternalHref(href)) {
      const isHttp = href.startsWith('http');
      return (
        <a
          href={href}
          className={classes}
          rel="noopener noreferrer"
          target={isHttp ? '_blank' : undefined}
          {...anchorRest}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href as Parameters<typeof Link>[0]['href']} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
