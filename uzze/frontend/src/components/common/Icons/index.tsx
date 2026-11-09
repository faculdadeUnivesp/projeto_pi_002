interface IconProps {
  className?: string;
}

function base(className?: string) {
  return `icon ${className ?? ''}`.trim();
}

export function IconDashboard({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

export function IconVendas({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.5 12h11L21 7H6" />
    </svg>
  );
}

export function IconEstoque({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v12h14V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

export function IconFornecedores({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 6h12v10H2z" />
      <path d="M14 9h4l3 3v4h-7" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export function IconRelatorios({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
    </svg>
  );
}

export function IconUsuarios({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-4 3-6 7-6s7 2 7 6" />
      <path d="M16 4.5a3.5 3.5 0 010 7" />
      <path d="M18 14c2.5.7 4 2.5 4 6" />
    </svg>
  );
}

export function IconClientes({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  );
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4H5v16h4" />
      <path d="M10 12h11" />
      <path d="M17 8l4 4-4 4" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-5-5" />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconEdit({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20l1-4L16 5l3 3L8 19z" />
      <path d="M13 8l3 3" />
    </svg>
  );
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

export function IconImage({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M4 18l5-5 4 4 3-3 4 4" />
    </svg>
  );
}

export function IconWarning({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 7v6" />
      <path d="M12 16.5v.5" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
