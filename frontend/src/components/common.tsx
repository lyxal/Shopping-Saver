import React from "react";
import {
  Pressable,
  TextInput,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { palette } from "../lib/theme";
import type {
  ComparisonRow,
  ProductRecord,
  Store,
  ListSummary,
} from "../lib/types";
import { formatCurrency, formatPercent } from "../lib/api";

export function Notice({ tone, text }: { tone: "danger" | "success"; text: string }) {
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
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function ListCard({ list }: { list: ListSummary }) {
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
            <Text style={styles.productPillLabel}>{label}</Text>
            <Text style={styles.productPillName} numberOfLines={1}>
              {product.Name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ComparisonCard({ row }: { row: ComparisonRow }) {
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
        />
        <StorePrice
          store="Woolworths"
          normal={row.WoolworthsPrice.NormalPrice}
          sale={row.WoolworthsPrice.SalePrice}
          cheaper={woolworthsCheaper}
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

export function screenLabel(screen: "login" | "pickList" | "modifyList" | "results") {
  switch (screen) {
    case "login":
      return "1 Login";
    case "pickList":
      return "2 Pick List";
    case "modifyList":
      return "3 Modify List";
    case "results":
      return "4 Comparison Results";
  }
}

function StorePrice({
  store,
  normal,
  sale,
  cheaper,
}: {
  store: Store;
  normal: number;
  sale: number;
  cheaper: boolean;
}) {
  return (
    <View style={[styles.storePriceCard, cheaper && styles.storePriceCardCheaper]}>
      <Text style={styles.storePriceLabel}>{store}</Text>
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

const styles = StyleSheet.create({
  notice: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  noticeDanger: {
    backgroundColor: "rgba(201, 79, 79, 0.10)",
    borderColor: "rgba(201, 79, 79, 0.28)",
  },
  noticeSuccess: {
    backgroundColor: "rgba(25, 143, 109, 0.10)",
    borderColor: "rgba(25, 143, 109, 0.24)",
  },
  noticeText: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
  },
  infoChip: {
    backgroundColor: palette.surfaceWarm,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: palette.line,
    minWidth: 140,
    flexGrow: 1,
    gap: 4,
  },
  infoChipLabel: {
    color: palette.muted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  infoChipValue: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  summaryMetric: {
    flexGrow: 1,
    minWidth: "48%",
    backgroundColor: palette.surfaceMuted,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 6,
  },
  summaryMetricAccent: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  summaryMetricLabel: {
    color: palette.muted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  summaryMetricValue: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
  },
  toggleChip: {
    backgroundColor: palette.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  toggleChipActive: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  toggleChipText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  toggleChipTextActive: {
    color: palette.text,
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  storeField: {
    flex: 1,
    gap: 8,
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
  },
  helperText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
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
    backgroundColor: palette.surfaceMuted,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 6,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyBody: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  listCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 10,
  },
  listCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  listBadgeText: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "900",
  },
  listCardChevron: {
    color: palette.accentDeep,
    fontSize: 12,
    fontWeight: "800",
  },
  listCardTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
  },
  listCardMeta: {
    color: palette.muted,
    fontSize: 12,
  },
  productCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 12,
  },
  productTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
  },
  productPillRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  productPill: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 12,
    minWidth: 140,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 4,
  },
  productPillLabel: {
    color: palette.accentDeep,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "800",
  },
  productPillName: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "800",
  },
  comparisonCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 12,
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
    fontWeight: "900",
    flexShrink: 1,
  },
  cheaperBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  cheaperBadgeColes: {
    backgroundColor: "rgba(25, 143, 109, 0.12)",
    borderColor: "rgba(25, 143, 109, 0.28)",
  },
  cheaperBadgeWoolies: {
    backgroundColor: "rgba(244, 183, 64, 0.20)",
    borderColor: "rgba(244, 183, 64, 0.36)",
  },
  cheaperBadgeText: {
    color: palette.text,
    fontSize: 11,
    fontWeight: "900",
  },
  priceGrid: {
    flexDirection: "row",
    gap: 10,
  },
  storePriceCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 12,
    gap: 4,
  },
  storePriceCardCheaper: {
    backgroundColor: "rgba(244, 183, 64, 0.16)",
    borderColor: palette.accent,
  },
  storePriceLabel: {
    color: palette.accentDeep,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  storePriceValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  storePriceMeta: {
    color: palette.muted,
    fontSize: 12,
  },
  comparisonFooter: {
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 10,
  },
  comparisonFooterText: {
    color: palette.muted,
    fontSize: 13,
  },
  input: {
    backgroundColor: palette.surfaceMuted,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
});
