

export interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

export interface BusinessInfo {
  fullName: string;
  jobTitle: string;
  companyName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  industry: string; // Used for AI context
  // New fields
  bio?: string;
  socials?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export enum LayoutStyle {
  Minimal = 'Minimal',
  Bold = 'Bold',
  Luxury = 'Luxury',
  Creative = 'Creative',
  Corporate = 'Corporate',
  Tech = 'Tech'
}

export interface DesignTheme {
  id: string;
  name: string;
  layoutStyle: LayoutStyle;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: 'sans' | 'serif' | 'display' | 'modern' | 'poppins' | 'cormorant' | 'raleway' | 'oswald' | 'greatvibes' | 'librebaskerville' | 'sourcesans' | 'dmserif' | 'titillium' | 'spacegrotesk';
  slogan: string; // AI generated slogan
  accentShape: 'circle' | 'line' | 'blob' | 'none';
  logoUrl?: string; // Optional user uploaded logo
}

export interface SavedProject {
  id: string;
  owner?: string; // User email who owns this project
  info: BusinessInfo;
  theme: DesignTheme;
  createdAt: number;
}