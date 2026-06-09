import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { ListSummary } from "../lib/types";
import { EmptyState, SecondaryButton, ThemeToggle } from "../components/common";
import { useTheme } from "../lib/theme";

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
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Choose a list to compare or edit</Text>
        <ThemeToggle />
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.pageKicker}>Pick List</Text>
            <Text style={styles.pageSub}>
              Choose an existing list or create a new one before editing items and comparing stores.
            </Text>
          </View>
          <SecondaryButton label="Change Account" onPress={onBackToLogin} />
        </View>

        <View style={styles.listColumn}>
          {lists.length === 0 ? (
            <EmptyState title="No lists yet" body="Create your first shopping list to begin." />
          ) : (
            lists.map((list) => (
              <Pressable key={list.ListID} onPress={() => onPickList(list)} style={styles.listCard}>
                <View style={styles.listCardTop}>
                  <Text style={styles.listTitle}>{list.ListName}</Text>
                  <View style={styles.arrowCircle}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </View>
                <Text style={styles.listMeta}>xx items • Created xx/yy/zz • Last Edited xx/yy/zz</Text>
                <View style={styles.editRow}>
                  <Text style={styles.editHint}>Edit</Text>
                  <Text style={styles.editIcon}>✎</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.createRow}>
          <View style={styles.createPanel}>
            <TextInput
              value={newListName}
              onChangeText={onNewListNameChange}
              placeholder="Create List"
              placeholderTextColor={palette.muted}
              style={styles.createInput}
            />
            <Pressable onPress={onCreateList} style={styles.createButton}>
              <Text style={styles.createButtonText}>+</Text>
            </Pressable>
          </View>
          {loading ? <Text style={styles.loadingText}>Creating...</Text> : null}
        </View>
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useTheme>["palette"]) {
  return StyleSheet.create({
    page: {
      minHeight: 720,
      backgroundColor: palette.background,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 28,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 24,
      marginBottom: 20,
    },
    title: {
      flex: 1,
      color: palette.text,
      fontSize: 40,
      lineHeight: 44,
      fontWeight: "400",
      letterSpacing: -1.2,
    },
    body: {
      flex: 1,
      marginTop: 10,
      gap: 28,
      paddingBottom: 120,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 24,
    },
    headerText: {
      flex: 1,
      gap: 12,
    },
    pageKicker: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    pageSub: {
      color: palette.muted,
      fontSize: 14,
      lineHeight: 21,
      maxWidth: 700,
      fontWeight: "400",
    },
    listColumn: {
      gap: 14,
      marginTop: 12,
    },
    listCard: {
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 18,
      gap: 14,
      backgroundColor: palette.surface,
    },
    listCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    listTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "500",
      letterSpacing: -0.5,
    },
    arrowCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: palette.line,
      alignItems: "center",
      justifyContent: "center",
    },
    arrowText: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "300",
    },
    listMeta: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "400",
    },
    editRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    editHint: {
      color: palette.accent,
      fontSize: 12,
      fontWeight: "500",
      textDecorationLine: "underline",
    },
    editIcon: {
      color: palette.muted,
      fontSize: 14,
    },
    createRow: {
      position: "absolute",
      right: 0,
      bottom: 0,
      alignItems: "flex-end",
      gap: 10,
    },
    createPanel: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.surface,
      borderRadius: 16,
      paddingLeft: 20,
      paddingRight: 12,
      paddingVertical: 12,
      gap: 16,
      borderWidth: 1.5,
      borderColor: palette.line,
    },
    createInput: {
      minWidth: 180,
      color: palette.text,
      fontSize: 15,
      fontWeight: "500",
      paddingVertical: 4,
      paddingHorizontal: 0,
    },
    createButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: palette.black,
      alignItems: "center",
      justifyContent: "center",
    },
    createButtonText: {
      color: palette.white,
      fontSize: 24,
      fontWeight: "300",
    },
    loadingText: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "400",
    },
  });
}
