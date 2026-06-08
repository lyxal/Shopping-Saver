import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { palette } from "../lib/theme";
import type { ListSummary } from "../lib/types";
import { EmptyState, ListCard, SecondaryButton } from "../components/common";

export default function PickListScreen({
  lists,
  loading,
  newListName,
  onNewListNameChange,
  onCreateList,
  onPickList,
  onBackToLogin,
}: {
  lists: ListSummary[];
  loading: boolean;
  newListName: string;
  onNewListNameChange: (value: string) => void;
  onCreateList: () => void;
  onPickList: (list: ListSummary) => void;
  onBackToLogin: () => void;
}) {
  return (
    <View style={styles.pageCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderText}>
          <Text style={styles.pageKicker}>Step 2</Text>
          <Text style={styles.pageTitle}>Pick a list</Text>
          <Text style={styles.pageBody}>
            Choose the basket you want to update, or start a new weekly list.
          </Text>
        </View>
        <SecondaryButton label="Change account" onPress={onBackToLogin} />
      </View>

      <View style={styles.inlineCard}>
        <Text style={styles.fieldLabel}>Create new list</Text>
        <View style={styles.inlineRow}>
          <TextInput
            value={newListName}
            onChangeText={onNewListNameChange}
            placeholder="e.g. Weekly shop"
            placeholderTextColor={palette.muted}
            style={[styles.input, styles.flexGrow]}
          />
          <Pressable
            onPress={onCreateList}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            {loading ? (
              <ActivityIndicator color={palette.text} />
            ) : (
              <Text style={styles.secondaryButtonText}>Create</Text>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.listSectionHeader}>
        <Text style={styles.sectionTitle}>Your saved lists</Text>
        <Text style={styles.sectionHint}>Tap a list to open the edit screen.</Text>
      </View>

      {lists.length === 0 ? (
        <EmptyState
          title="No lists yet"
          body="Create your first shopping list and add a few usual products."
        />
      ) : (
        <View style={styles.listColumn}>
          {lists.map((list) => (
            <Pressable key={list.ListID} onPress={() => onPickList(list)}>
              <ListCard list={list} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  pageKicker: {
    color: palette.accentDeep,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
    fontWeight: "800",
  },
  pageTitle: {
    color: palette.text,
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  pageBody: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
    gap: 6,
  },
  inlineCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 12,
  },
  fieldLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
  },
  inlineRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
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
  flexGrow: {
    flexGrow: 1,
    flexBasis: 0,
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
  listSectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sectionHint: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  listColumn: {
    gap: 10,
  },
});
