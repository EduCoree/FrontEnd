export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedIn?: string;
  youTube?: string;
  website?: string;
}

export interface Center {
  id: number;
  name: string;
  logoUrl?: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  socialLinks?: SocialLinks;
  createdAt: string;
}