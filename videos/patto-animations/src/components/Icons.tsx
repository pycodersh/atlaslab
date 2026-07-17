import React from "react";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const base = (size: number, color: string, sw: number, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const IconPuzzle: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <path d="M19.439 7.85c-.049.322.02.682.092 1a9.91 9.91 0 0 1 .18 1.86 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8c1.25 0 2.439.29 3.491.802l4.69-3.006A10 10 0 0 0 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-1.698-.422-3.296-1.166-4.695a1 1 0 0 0-1.395-.455z" />
    <path d="m10 10-1.5 1.5" />
    <path d="M14 10h.01" />
  </>);

export const IconUnlink: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
    <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
    <line x1="8" x2="8" y1="2" y2="5" />
    <line x1="2" x2="5" y1="8" y2="8" />
    <line x1="16" x2="16" y1="19" y2="22" />
    <line x1="19" x2="22" y1="16" y2="16" />
  </>);

export const IconMessageCircle: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </>);

export const IconHeadphones: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </>);

export const IconLibrary: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <path d="m16 6 4 14" />
    <path d="M12 6v14" />
    <path d="M8 8v12" />
    <path d="M4 4v16" />
  </>);

export const IconCalendar: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </>);

export const IconTarget: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </>);

export const IconMic: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </>);

export const IconBrain: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
  </>);

export const IconTrendingUp: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </>);

export const IconStar: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) =>
  base(size, color, strokeWidth, <>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </>);
