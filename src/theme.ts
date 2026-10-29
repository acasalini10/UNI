// UNI design tokens, extracted from the design canvas (dark navy theme).
// Values are the ones used across the screens; spacing is rounded to a 2/4px grid.
// Fonts: Plus Jakarta Sans via @expo-google-fonts/plus-jakarta-sans.

export const colors = {
    // Backgrounds
    bg: '#0C1E38', // screen background
    tabBar: '#0A1830', // bottom navigation
    surface: '#132A4A', // cards, inputs, filter panel
    surfaceRaised: '#1A3558', // progress track, secondary button
    disabled: '#1E3352',
    overlay: 'rgba(5,12,25,0.72)',

    // Borders
    border: '#24436B',
    borderStrong: '#2E4A70',
    borderDashed: '#3B5C88', // empty states, "add" tiles
    control: '#5A7092', // unchecked checkbox/radio ring, inactive icons
    surfaceSunken: '#0F2342',

    // Third-party sign-in buttons (Apple, Google)
    black: '#000000',
    white: '#FFFFFF',
    appleBorder: '#3A4D69',
    googleBorder: '#747775',
    googleText: '#1F1F1F',

    // Text
    text: '#F1F5FB',
    textSecondary: '#C3CEDD', // inactive chips, deadlines
    textMuted: '#A9B8CD', // captions, labels, inactive tabs
    textDisabled: '#8B9DB8',
    placeholder: '#7F93B0',

    // Brand
    primary: '#FBBF24', // main CTA, active tab
    onPrimary: '#0C1E38', // text on primary
    accent: '#3B82F6', // selected chips, progress bar
    link: '#93C0FF',
    linkPressed: '#BFD8FF',

    // Status
    success: '#34D399',
    successText: '#6EE7B7',
    warningText: '#FCD34D',
    warningSoftText: '#FDE7A8',
    error: '#F87171',
    errorText: '#FCA5A5',

    // Tints (backgrounds for chips, banners, icon tiles)
    accentTint: 'rgba(59,130,246,0.18)',
    primaryTint: 'rgba(251,191,36,0.16)',
    primaryBannerBg: 'rgba(251,191,36,0.12)',
    primaryBannerBorder: 'rgba(251,191,36,0.35)',
    infoBannerBg: 'rgba(59,130,246,0.12)',
    infoBannerBorder: 'rgba(59,130,246,0.40)',
    infoBannerText: '#DCE7F7',
    successTint: 'rgba(52,211,153,0.16)',
    errorTint: 'rgba(248,113,113,0.10)',
    neutralTint: 'rgba(169,184,205,0.14)',
} as const;

// Fit labels from the business rule (Safety / Match / Reach / Not yet eligible).
export const fitColors = {
    Safety: { bg: 'rgba(52,211,153,0.14)', fg: '#6EE7B7' },
    Match: { bg: 'rgba(59,130,246,0.18)', fg: '#93C0FF' },
    Reach: { bg: 'rgba(251,191,36,0.16)', fg: '#FCD34D' },
    'Not yet eligible': { bg: 'rgba(169,184,205,0.14)', fg: '#C3CEDD' },
} as const;

export type FitLabel = keyof typeof fitColors;

export const fonts = {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semibold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

// With custom fonts in React Native, set fontFamily per weight, not fontWeight.
export const typography = {
    hero: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 36, letterSpacing: -0.8 }, // welcome screen headline
    sheetTitle: { fontFamily: fonts.extrabold, fontSize: 22, lineHeight: 28, letterSpacing: -0.44 }, // modal headers ("Add a university")
    stat: { fontFamily: fonts.extrabold, fontSize: 22, lineHeight: 26 }, // rankings, big numbers
    display: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 32, letterSpacing: -0.56 }, // screen titles
    title: { fontFamily: fonts.extrabold, fontSize: 24, lineHeight: 28, letterSpacing: -0.48 }, // profile name
    price: { fontFamily: fonts.extrabold, fontSize: 20, lineHeight: 24, letterSpacing: -0.2 },
    brand: { fontFamily: fonts.extrabold, fontSize: 17, lineHeight: 22 }, // "UNI" next to logo
    cardTitle: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 21 },
    button: { fontFamily: fonts.extrabold, fontSize: 16, lineHeight: 20 },
    input: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 20 },
    body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
    bodyStrong: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22 },
    label: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20 }, // form labels
    bodySmall: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
    caption: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 19 },
    chip: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 16 },
    small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
    fitLabel: { fontFamily: fonts.extrabold, fontSize: 12, lineHeight: 16 },
    overline: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.96, textTransform: 'uppercase' as const },
    tab: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14 },
    tabActive: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14 },
} as const;

export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 28,
} as const;

export const radius = {
    xs: 8, // logo
    sm: 10, // icon tiles
    md: 12, // inputs, banners
    lg: 14, // buttons, document rows
    xl: 16, // cards, filter panel
    pill: 999, // chips, tags, upload buttons
} as const;

export const sizes = {
    touchTarget: 44, // minimum for any tappable element
    input: 50,
    button: 54,
    chip: 36,
    tag: 28, // fit label chip
    iconTile: 40,
    programLogo: 48,
    avatar: 64,
    logo: 32,
    icon: 22,
    tabBarItem: 52,
} as const;

export const layout = {
    screenPaddingX: 20,
    screenPaddingTop: 20,
    screenPaddingBottom: 24,
    sectionGap: 18,
    cardPadding: 16,
    borderWidth: 1,
    borderWidthSelected: 1.5,
} as const;

export const theme = { colors, fitColors, fonts, typography, spacing, radius, sizes, layout } as const;
export type Theme = typeof theme;
export default theme;