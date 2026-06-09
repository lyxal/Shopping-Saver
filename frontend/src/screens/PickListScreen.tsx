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
      paddingHorizontal: 18,
      paddingTop: 20,
      paddingBottom: 28,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 18,
    },
    title: {
      flex: 1,
      color: palette.text,
      fontSize: 44,
      lineHeight: 48,
      fontWeight: "300",
      letterSpacing: -1.8,
    },
    body: {
      flex: 1,
      marginTop: 10,
      gap: 24,
      paddingBottom: 120,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 18,
    },
    headerText: {
      flex: 1,
      gap: 8,
    },
    pageKicker: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "300",
    },
    pageSub: {
      color: palette.muted,
      fontSize: 14,
      lineHeight: 20,
      maxWidth: 700,
    },
    listColumn: {
      gap: 28,
      marginTop: 6,
    },
    listCard: {
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 16,
      gap: 12,
      backgroundColor: palette.surface,
    },
    listCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    listTitle: {
      color: palette.text,
      fontSize: 36,
      fontWeight: "300",
      letterSpacing: -1.4,
    },
    arrowCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: palette.line,
      alignItems: "center",
      justifyContent: "center",
    },
    arrowText: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "300",
      marginTop: -2,
    },
    listMeta: {
      color: palette.muted,
      fontSize: 18,
      fontWeight: "300",
    },
    editRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    editHint: {
      color: palette.accentDeep,
      fontSize: 14,
      textDecorationLine: "underline",
    },
    editIcon: {
      color: palette.text,
      fontSize: 18,
    },
    createRow: {
      position: "absolute",
      right: 0,
      bottom: 0,
      alignItems: "flex-end",
      gap: 8,
    },
    createPanel: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.surface,
      borderRadius: 10,
      paddingLeft: 18,
      paddingRight: 10,
      paddingVertical: 10,
      gap: 18,
      borderWidth: 1,
      borderColor: palette.line,
    },
    createInput: {
      minWidth: 220,
      color: palette.text,
      fontSize: 30,
      fontWeight: "300",
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    createButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: palette.background,
      alignItems: "center",
      justifyContent: "center",
    },
    createButtonText: {
      color: palette.text,
      fontSize: 32,
      fontWeight: "300",
      marginTop: -4,
    },
    loadingText: {
      color: palette.muted,
      fontSize: 12,
    },
  });
}
