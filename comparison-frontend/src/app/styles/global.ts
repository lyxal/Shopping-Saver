import { StyleSheet } from 'react-native';

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

export const colors = {
  background:    '#000000',
  surface:       '#0F0F0F',
  surfaceHigh:   '#1A1A1A',
  surfaceWhite:  '#FFFFFF',   // white cards (featured offers, prominent content)
  border:        '#2A2A2A',
  borderFocus:   '#FFFFFF',   // input border when focused
  borderError:   '#FF3B6B',   // input border when validation fails
  textPrimary:   '#FFFFFF',
  textSecondary: '#9CA3AF',
  textDark:      '#1A1A1A',   // text on white surfaces
  textError:     '#FF3B6B',   // inline error messages
  // Blue — informational UI, icons, links
  accent:        '#1D7EF5',
  accentSubtle:  '#0F2A4A',
  // Amber — savings figures, offer highlights, success/celebration headings
  amber:         '#F5A623',
  amberSubtle:   '#2A1F0A',
  amberBadge:    '#F5A020',   // "CHEAPEST" pill background (slightly muted)
  // Alert/badge red — "SAVINGS ALERT" pill, not for errors
  alertRed:      '#E8442A',
  // Error — form validation banners and messages
  errorBg:       '#3D0014',
  destructive:   '#FF3B6B',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const typography = {
  sizeSm:        13,
  sizeMd:        15,
  sizeLg:        18,
  sizeXl:        24,
  sizeXxl:       32,
  weightRegular:  '400' as const,
  weightMedium:   '500' as const,
  weightSemibold: '600' as const,
  weightBold:     '700' as const,
  fontFamily:    'Arial',
  letterSpacingCaps: 1.2,  // for uppercase label style
} as const;

export const radii = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Composed styles
// Import as: import { styles as g } from 'app/src/styles/global';
// ---------------------------------------------------------------------------

export const styles = StyleSheet.create({
  // Screens
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainerCentered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Typography — on dark backgrounds
  textDisplay: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeXxl,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  textHeading: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeXl,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },
  textHeadingAmber: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeXl,
    fontWeight: typography.weightBold,
    color: colors.amber,              // for success/celebration screens
  },
  textSubheading: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeLg,
    fontWeight: typography.weightSemibold,
    color: colors.textPrimary,
  },
  textBody: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightRegular,
    color: colors.textPrimary,
  },
  textCaption: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightRegular,
    color: colors.textSecondary,
  },
  // Uppercase section labels: "CURRENT MORTGAGE", "CHEAPEST", etc.
  textLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacingCaps,
  },
  // Amber — savings figures displayed inline in text
  textAmber: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
    color: colors.amber,
  },
  // Typography — on white surfaces (surfaceWhite cards)
  textHeadingDark: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeXl,
    fontWeight: typography.weightBold,
    color: colors.textDark,
  },
  textBodyDark: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightRegular,
    color: colors.textDark,
  },
  textCaptionDark: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightRegular,
    color: colors.textSecondary,       // muted on white surface
  },

  // Inputs — dark bg, manage focus/error state in component:
  // style={[g.input, focused && g.inputFocused, hasError && g.inputError]}
  input: {
    backgroundColor: colors.surfaceHigh,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  inputFocused: {
    borderColor: colors.borderFocus,
  },
  inputError: {
    borderColor: colors.borderError,
  },
  inputLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputErrorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightRegular,
    color: colors.textError,
    marginTop: spacing.xs,
  },

  // Error banner — shown above forms with validation failures
  errorBanner: {
    backgroundColor: colors.errorBg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.destructive,
    padding: spacing.md,
  },
  errorBannerText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightRegular,
    color: colors.destructive,
  },

  // Buttons
  // Primary — white bg, black text ("Continue", "Get Started", "Confirm")
  buttonPrimary: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonPrimaryText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
    color: colors.textDark,
  },
  // Dark — near-black bg, white text; used inside white-surface cards
  buttonDark: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 52,
  },
  buttonDarkText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
    color: colors.textPrimary,
  },
  // Amber — savings/offer CTAs
  buttonAmber: {
    backgroundColor: colors.amber,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonAmberText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
    color: colors.textDark,
  },
  // Outlined — secondary actions, inactive tab pills
  buttonOutlined: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonOutlinedText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
  },

  // Badges / pills
  // "SAVINGS ALERT" — alert red, uppercase
  badgeAlert: {
    backgroundColor: colors.alertRed,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeAlertText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacingCaps,
  },
  // "CHEAPEST" — amber bg, dark text
  badgeAmber: {
    backgroundColor: colors.amberBadge,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeAmberText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeSm,
    fontWeight: typography.weightBold,
    color: colors.textDark,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacingCaps,
  },

  // Surfaces
  // White card — for featured offer content
  cardWhite: {
    backgroundColor: colors.surfaceWhite,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  // Dark card — for current mortgage / account summaries on black bg
  cardDark: {
    backgroundColor: colors.background,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },

  // Modals
  modal: {
    width: 300,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
