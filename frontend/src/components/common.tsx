import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { formatCurrency, formatPercent } from "../lib/api";
import { useTheme } from "../lib/theme";
import type {
  ComparisonRow,
  ListSummary,
  ProductRecord,
  Screen,
  Store,
} from "../lib/types";

export function ThemeToggle() {
  const { mode, palette, toggleTheme } = useTheme();
  const styles = useStyles();
  const dark = mode === "dark";

  return (
    <Pressable onPress={toggleTheme} style={styles.themeToggle} accessibilityRole="switch" accessibilityState={{ checked: !dark }}>
      <Text style={styles.themeIcon}>{dark ? "☼" : "☀"}</Text>
      <View style={[styles.switchTrack, dark && styles.switchTrackDark, !dark && styles.switchTrackLight]}>
        <View style={[styles.switchThumb, dark ? styles.switchThumbDark : styles.switchThumbLight]} />
      </View>
      <Text style={[styles.themeIcon, { color: palette.text }]}>{dark ? "☾" : "☽"}</Text>
    </Pressable>
  );
}

export function Notice({ tone, text }: { tone: "danger" | "success"; text: string }) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.notice,
        tone === "danger" ? styles.noticeDanger : styles.noticeSuccess,
      ]}
    >
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

export function InfoChip({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.infoChip}>
      <Text style={styles.infoChipLabel}>{label}</Text>
      <Text style={styles.infoChipValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function SummaryMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.summaryMetric, accent && styles.summaryMetricAccent]}>
      <Text style={styles.summaryMetricLabel}>{label}</Text>
      <Text style={styles.summaryMetricValue}>{value}</Text>
    </View>
  );
}

export function ToggleChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.toggleChip, active && styles.toggleChipActive]}
    >
      <Text style={[styles.toggleChipText, active && styles.toggleChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function StoreField({
  label,
  value,
  placeholder,
  helper,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  helper?: string;
  onChange: (value: string) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.storeField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInputLike
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
}

export function StepTrack({ screen }: { screen: "login" | "pickList" | "modifyList" | "results" }) {
  const styles = useStyles();
  const steps: Array<{ key: typeof screen; label: string }> = [
    { key: "login", label: "Login" },
    { key: "pickList", label: "Pick List" },
    { key: "modifyList", label: "Modify List" },
    { key: "results", label: "Results" },
  ];

  const activeIndex = steps.findIndex((step) => step.key === screen);

  return (
    <View style={styles.stepTrack}>
      {steps.map((step, index) => {
        const active = index <= activeIndex;
        const current = index === activeIndex;
        return (
          <View key={step.key} style={styles.stepSlot}>
            <View
              style={[
                styles.stepPill,
                active && styles.stepPillActive,
                current && styles.stepPillCurrent,
              ]}
            >
              <Text style={[styles.stepPillText, active && styles.stepPillTextActive]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[styles.stepLabel, current && styles.stepLabelCurrent]}>
              {step.label}
            </Text>
            {index < steps.length - 1 ? <View style={styles.stepLine} /> : null}
          </View>
        );
      })}
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  const styles = useStyles();
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function ListCard({ list }: { list: ListSummary }) {
  const styles = useStyles();
  return (
    <View style={styles.listCard}>
      <View style={styles.listCardTop}>
        <View style={styles.listBadge}>
          <Text style={styles.listBadgeText}>{list.ListName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={styles.listCardChevron}>Open</Text>
      </View>
      <Text style={styles.listCardTitle}>{list.ListName}</Text>
      <Text style={styles.listCardMeta}>List ID {list.ListID.slice(0, 8)}</Text>
    </View>
  );
}

export function ProductCard({
  entry,
}: {
  entry: {
    Coles: ProductRecord | null;
    Woolworths: ProductRecord | null;
  };
}) {
  const styles = useStyles();
  const items = [
    entry.Coles ? { label: "Coles", product: entry.Coles } : null,
    entry.Woolworths ? { label: "Woolworths", product: entry.Woolworths } : null,
  ].filter((item): item is { label: Store; product: ProductRecord } => item !== null);

  return (
    <View style={styles.productCard}>
      <Text style={styles.productTitle}>{listItemSummary(entry)}</Text>
      <View style={styles.productPillRow}>
        {items.map(({ label, product }) => (
          <View key={label} style={styles.productPill}>
            <ProductThumbnail source={product.ImageLink} fallbackLabel={label.slice(0, 1)} />
            <View style={styles.productPillCopy}>
              <Text style={styles.productPillLabel}>{label}</Text>
              <Text style={styles.productPillName} numberOfLines={1}>
                {product.Name}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ProductThumbnail({
  source,
  fallbackLabel,
  size = 54,
}: {
  source?: string | null;
  fallbackLabel?: string;
  size?: number;
}) {
  const { palette } = useTheme();
  const styles = useStyles();
  const [hasError, setHasError] = useState(false);
  const shouldShowImage = Boolean(source && !hasError);

  if (shouldShowImage) {
    return (
      <Image
        source={{ uri: source ?? undefined }}
        resizeMode="cover"
        onError={() => setHasError(true)}
        style={[
          styles.productThumb,
          { width: size, height: size, borderRadius: Math.max(12, size / 4) },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.productThumbFallback,
        {
          width: size,
          height: size,
          borderRadius: Math.max(12, size / 4),
          backgroundColor: palette.surfaceWarm,
        },
      ]}
    >
      <Text style={styles.productThumbFallbackText}>{fallbackLabel ?? "•"}</Text>
    </View>
  );
}

export function FeatureArtwork({
  source,
  fallback,
}: {
  source?: string | null;
  fallback: "planet" | "earth" | "comparison";
}) {
  const { palette } = useTheme();
  const styles = useStyles();
  const [hasError, setHasError] = useState(false);
  const shouldShowImage = Boolean(source && !hasError);

  if (shouldShowImage) {
    return (
      <Image
        source={{ uri: source ?? undefined }}
        resizeMode="cover"
        onError={() => setHasError(true)}
        style={styles.featureImage}
      />
    );
  }

  if (fallback === "planet") {
    return (
      <View style={styles.planetShell}>
        <View style={[styles.planetGlow, { backgroundColor: palette.accentSoft }]} />
        <View style={styles.planetCore} />
        <View style={[styles.planetBands, { borderTopColor: palette.accent, borderLeftColor: palette.accentSoft }]} />
      </View>
    );
  }

  if (fallback === "comparison") {
    return (
      <View>
          <Text>Loading</Text>
        </View>
    );
  }

  return (
    <View style={styles.earthShell}>
      <View style={styles.earthGlow} />
      <View style={styles.earthCore} />
    </View>
  );
}

export function ComparisonCard({ row }: { row: ComparisonRow }) {
  const styles = useStyles();
  const colesCheaper = row.CheaperStore === "Coles";
  const woolworthsCheaper = row.CheaperStore === "Woolworths";

  return (
    <View style={styles.comparisonCard}>
      <View style={styles.comparisonTopRow}>
        <Text style={styles.comparisonTitle}>
          {row.WoolworthsProduct.Name || row.ColesProduct.Name}
        </Text>
        <View
          style={[
            styles.cheaperBadge,
            colesCheaper
              ? styles.cheaperBadgeColes
              : woolworthsCheaper
              ? styles.cheaperBadgeWoolies
              : null,
          ]}
        >
          <Text style={styles.cheaperBadgeText}>{row.CheaperStore}</Text>
        </View>
      </View>

      <View style={styles.priceGrid}>
        <StorePrice
          store="Coles"
          normal={row.ColesPrice.NormalPrice}
          sale={row.ColesPrice.SalePrice}
          cheaper={colesCheaper}
          imageLink={row.ColesProduct.ImageLink}
        />
        <StorePrice
          store="Woolworths"
          normal={row.WoolworthsPrice.NormalPrice}
          sale={row.WoolworthsPrice.SalePrice}
          cheaper={woolworthsCheaper}
          imageLink={row.WoolworthsProduct.ImageLink}
        />
      </View>

      <View style={styles.comparisonFooter}>
        <Text style={styles.comparisonFooterText}>
          Difference {formatCurrency(row.PriceDifference)} · {formatPercent(row.PercentageDifference)}
        </Text>
      </View>
    </View>
  );
}

export function screenLabel(screen: Screen) {
  switch (screen) {
    case "landing":
      return "1 Landing";
    case "pickList":
      return "2 Pick List";
    case "modifyList":
      return "3 Modify List";
    case "loadingResults":
      return "4 Loading Results";
    case "results":
      return "5 Comparison Results";
  }
}

function StorePrice({
  store,
  normal,
  sale,
  cheaper,
  imageLink,
}: {
  store: Store;
  normal: number;
  sale: number;
  cheaper: boolean;
  imageLink?: string;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.storePriceCard, cheaper && styles.storePriceCardCheaper]}>
      <View style={styles.storePriceHeader}>
        <ProductThumbnail source={imageLink} fallbackLabel={store.slice(0, 1)} size={40} />
        <Text style={styles.storePriceLabel}>{store}</Text>
      </View>
      <Text style={styles.storePriceValue}>{formatCurrency(sale)}</Text>
      <Text style={styles.storePriceMeta}>Normal {formatCurrency(normal)}</Text>
    </View>
  );
}

function listItemSummary(entry: {
  Coles: ProductRecord | null;
  Woolworths: ProductRecord | null;
}) {
  if (entry.Coles && entry.Woolworths) {
    return `${entry.Coles.Name} + ${entry.Woolworths.Name}`;
  }
  if (entry.Coles) return `Coles only: ${entry.Coles.Name}`;
  if (entry.Woolworths) return `Woolworths only: ${entry.Woolworths.Name}`;
  return "Unpaired item";
}

function TextInputLike({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const styles = useStyles();
  const { palette } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={palette.muted}
      autoCapitalize="none"
      style={styles.input}
    />
  );
}

function useStyles() {
  const { palette } = useTheme();
  return useMemo(() => createStyles(palette), [palette]);
}

function createStyles(palette: ReturnType<typeof useTheme>["palette"]) {
  return StyleSheet.create({
    themeToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    themeIcon: {
      color: palette.text,
      fontSize: 26,
      fontWeight: "200",
    },
    switchTrack: {
      width: 72,
      height: 32,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: palette.line,
      padding: 4,
      justifyContent: "center",
    },
    switchTrackDark: {
      backgroundColor: palette.black,
    },
    switchTrackLight: {
      backgroundColor: palette.white,
    },
    switchThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    switchThumbDark: {
      backgroundColor: palette.white,
      alignSelf: "flex-end",
    },
    switchThumbLight: {
      backgroundColor: palette.accent,
      alignSelf: "flex-start",
    },
    notice: {
      borderRadius: 14,
      padding: 14,
      borderWidth: 1.5,
      marginBottom: 16,
    },
    noticeDanger: {
      backgroundColor: palette.danger === "#ff3a2f" ? "rgba(255, 58, 47, 0.08)" : "rgba(215, 54, 45, 0.08)",
      borderColor: palette.danger === "#ff3a2f" ? "rgba(255, 58, 47, 0.24)" : "rgba(215, 54, 45, 0.24)",
    },
    noticeSuccess: {
      backgroundColor: palette.success === "#4ad08b" ? "rgba(74, 208, 139, 0.08)" : "rgba(29, 139, 95, 0.08)",
      borderColor: palette.success === "#4ad08b" ? "rgba(74, 208, 139, 0.24)" : "rgba(29, 139, 95, 0.24)",
    },
    noticeText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "400",
    },
    infoChip: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1.5,
      borderColor: palette.line,
      minWidth: 140,
      flexGrow: 1,
      gap: 4,
    },
    infoChipLabel: {
      color: palette.muted,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontWeight: "600",
    },
    infoChipValue: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "600",
    },
    summaryMetric: {
      flexGrow: 1,
      minWidth: "48%",
      backgroundColor: palette.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1.5,
      borderColor: palette.line,
      gap: 8,
    },
    summaryMetricAccent: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
    },
    summaryMetricLabel: {
      color: palette.muted,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontWeight: "600",
    },
    summaryMetricValue: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "600",
    },
    toggleChip: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1.5,
      borderColor: palette.line,
    },
    toggleChipActive: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
    },
    toggleChipText: {
      color: palette.muted,
      fontSize: 14,
      fontWeight: "500",
    },
    toggleChipTextActive: {
      color: palette.black,
      fontWeight: "600",
    },
    primaryButton: {
      backgroundColor: palette.accent,
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingVertical: 14,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: palette.black,
      fontSize: 15,
      fontWeight: "600",
    },
    secondaryButton: {
      backgroundColor: palette.surfaceMuted,
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 12,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "500",
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    storeField: {
      flex: 1,
      gap: 10,
    },
    fieldLabel: {
      color: palette.text,
      fontSize: 13,
      fontWeight: "600",
    },
    helperText: {
      color: palette.muted,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "400",
    },
    stepTrack: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
      paddingVertical: 4,
    },
    stepSlot: {
      flex: 1,
      alignItems: "center",
      position: "relative",
      gap: 6,
    },
    stepPill: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.surface,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    stepPillActive: {
      backgroundColor: palette.accentSoft,
      borderColor: palette.accent,
    },
    stepPillCurrent: {
      borderWidth: 2,
    },
    stepPillText: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "800",
    },
    stepPillTextActive: {
      color: palette.text,
    },
    stepLabel: {
      color: palette.muted,
      fontSize: 11,
      textAlign: "center",
    },
    stepLabelCurrent: {
      color: palette.text,
      fontWeight: "700",
    },
    stepLine: {
      position: "absolute",
      top: 15,
      right: "-50%",
      width: "100%",
      height: 2,
      backgroundColor: palette.line,
      zIndex: 0,
    },
    emptyCard: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1.5,
      borderColor: palette.line,
      gap: 8,
    },
    emptyTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "600",
    },
    emptyBody: {
      color: palette.muted,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "400",
    },
    listCard: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1.5,
      borderColor: palette.line,
      gap: 12,
    },
    listCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    listBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: palette.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    listBadgeText: {
      color: palette.black,
      fontSize: 14,
      fontWeight: "600",
    },
    listCardChevron: {
      color: palette.accent,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    listCardTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "600",
    },
    listCardMeta: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "400",
    },
    productCard: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1.5,
      borderColor: palette.line,
      gap: 12,
    },
    productTitle: {
      color: palette.text,
      fontSize: 15,
      fontWeight: "600",
    },
    productPillRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
    productPill: {
      backgroundColor: palette.surface,
      borderRadius: 14,
      padding: 14,
      minWidth: 140,
      flexGrow: 1,
      borderWidth: 1.5,
      borderColor: palette.line,
      gap: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    productPillCopy: {
      flex: 1,
      gap: 4,
    },
    productPillLabel: {
      color: palette.accent,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontWeight: "600",
    },
    productPillName: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "500",
    },
    productThumb: {
      backgroundColor: palette.surfaceWarm,
    },
    productThumbFallback: {
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: palette.line,
    },
    productThumbFallbackText: {
      color: palette.text,
      fontSize: 13,
      fontWeight: "900",
    },
    featureImage: {
      width: "100%",
      height: "100%",
      borderRadius: 30,
      backgroundColor: palette.surfaceWarm,
    },
    planetShell: {
      width: 250,
      height: 250,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    planetGlow: {
      position: "absolute",
      top: 20,
      left: 20,
      right: 20,
      bottom: 20,
      borderRadius: 125,
      opacity: 0.25,
      shadowColor: palette.accentDeep,
      shadowOpacity: 0.6,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 0 },
    },
    planetCore: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: palette.surfaceWarm,
      borderWidth: 1,
      borderColor: palette.line,
    },
    planetBands: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: "transparent",
      borderTopWidth: 22,
      borderTopColor: palette.accent,
      borderLeftWidth: 8,
      borderLeftColor: palette.accentSoft,
      transform: [{ rotate: "-12deg" }],
    },
    earthShell: {
      width: 250,
      height: 250,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    earthGlow: {
      position: "absolute",
      top: 20,
      left: 20,
      right: 20,
      bottom: 20,
      borderRadius: 125,
      backgroundColor: palette.accentSoft,
      opacity: 0.18,
    },
    earthCore: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: palette.surfaceWarm,
      borderWidth: 1,
      borderColor: palette.line,
    },
    comparisonCard: {
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1.5,
      borderColor: palette.line,
      gap: 14,
    },
    comparisonTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    comparisonTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "600",
      flexShrink: 1,
    },
    cheaperBadge: {
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: palette.surface,
      borderWidth: 1.5,
      borderColor: palette.line,
    },
    cheaperBadgeColes: {
      backgroundColor: "rgba(29, 139, 95, 0.12)",
      borderColor: "rgba(29, 139, 95, 0.36)",
    },
    cheaperBadgeWoolies: {
      backgroundColor: "rgba(244, 183, 64, 0.15)",
      borderColor: "rgba(244, 183, 64, 0.36)",
    },
    cheaperBadgeText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: "600",
    },
    priceGrid: {
      flexDirection: "row",
      gap: 12,
    },
    storePriceCard: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: palette.line,
      padding: 14,
      gap: 10,
    },
    storePriceCardCheaper: {
      backgroundColor: palette.accentSoft,
      borderColor: palette.accent,
    },
    storePriceHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    storePriceLabel: {
      color: palette.accent,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      flexShrink: 1,
    },
    storePriceValue: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "600",
    },
    storePriceMeta: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "400",
    },
    comparisonFooter: {
      borderTopWidth: 1.5,
      borderTopColor: palette.line,
      paddingTop: 12,
    },
    comparisonFooterText: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "400",
    },
    input: {
      backgroundColor: palette.surface,
      color: palette.text,
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 14,
      paddingHorizontal: 18,
      paddingVertical: 14,
      fontSize: 15,
      fontWeight: "400",
    },
  });
}
