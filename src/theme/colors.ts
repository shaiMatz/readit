export interface AppColors {
  brand: string;
  brandLight: string;
  brandDark: string;
  gradientStart: string;
  gradientEnd: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnBrand: string;
  border: string;
  divider: string;
  icon: string;
  iconActive: string;
  error: string;
  success: string;
  warning: string;
  offline: string;
  skeletonBase: string;
  skeletonHighlight: string;
}

export const lightColors: AppColors = {
  // Brand – blue-purple from ReadIt logo
  brand: '#5568FD',
  brandLight: '#7B8FFF',
  brandDark: '#3A4ED9',
  gradientStart: '#4776E6',
  gradientEnd: '#9B44CC',

  // Background hierarchy
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF0F9',
  card: '#FFFFFF',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnBrand: '#FFFFFF',

  // Interactive
  border: '#E5E7EB',
  divider: '#F0F1F5',
  icon: '#6B7280',
  iconActive: '#5568FD',

  // Status
  error: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
  offline: '#DC2626',

  // Skeleton
  skeletonBase: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',
} as const;

export const darkColors: AppColors = {
  // Brand – same brand colours work on dark
  brand: '#6B7BFF',
  brandLight: '#8F9DFF',
  brandDark: '#4A5CE8',
  gradientStart: '#4776E6',
  gradientEnd: '#9B44CC',

  // Background hierarchy
  background: '#0F0F18',
  surface: '#1A1A2E',
  surfaceSecondary: '#16213E',
  card: '#1E1E35',

  // Text
  textPrimary: '#F1F3F9',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textOnBrand: '#FFFFFF',

  // Interactive
  border: '#2D2D4E',
  divider: '#22223A',
  icon: '#9CA3AF',
  iconActive: '#6B7BFF',

  // Status
  error: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
  offline: '#F87171',

  // Skeleton
  skeletonBase: '#2D2D4E',
  skeletonHighlight: '#3A3A5C',
} as const;

