import React, { useMemo, useState } from "react";
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
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateClick = () => {
    if (newListName.trim()) {
      onCreateList();
      setShowCreateModal(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Your Lists</Text>
        <View style={styles.topBarActions}>
          <Pressable onPress={() => setShowCreateModal(true)} style={styles.createListButton}>
            <Text style={styles.createListButtonText}>+ New List</Text>
          </Pressable>
          <SecondaryButton label="Log Out" onPress={onBackToLogin} />
          <ThemeToggle />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.listColumn}>
          {lists.length === 0 ? (
            <EmptyState title="No lists yet" body="Create your first shopping list to begin." />
          ) : (
            lists.map((list) => (
              <Pressable key={list.ListID} onPress={() => onPickList(list)} style={styles.listCard}>
                <View style={styles.listCardContent}>
                  <View style={styles.listCardLeft}>
                    <Text style={styles.listTitle}>{list.ListName}</Text>
                    <Text style={styles.listMeta}>xx items • Created xx/yy/zz • Last Edited xx/yy/zz</Text>
                  </View>
                  <View style={styles.listCardRight}>
                    <Pressable style={styles.editButton}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.compareButton}>
                      <Text style={styles.compareButtonText}>Compare</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </View>

      {showCreateModal ? (
        <View style={styles.modalScrim}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowCreateModal(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New List</Text>
              <Pressable onPress={() => setShowCreateModal(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              value={newListName}
              onChangeText={onNewListNameChange}
              placeholder="List name"
              placeholderTextColor={palette.muted}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleCreateClick}
                disabled={loading || !newListName.trim()}
              >
                <Text style={styles.modalSubmitButtonText}>
                  {loading ? "Creating..." : "Create"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
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
      alignItems: "center",
      gap: 16,
      marginBottom: 24,
    },
    title: {
      flex: 1,
      color: palette.text,
      fontSize: 40,
      lineHeight: 44,
      fontWeight: "400",
      letterSpacing: -1.2,
    },
    topBarActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    createListButton: {
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: palette.accent,
    },
    createListButtonText: {
      color: palette.black,
      fontSize: 14,
      fontWeight: "600",
    },
    body: {
      flex: 1,
      marginTop: 0,
    },
    listColumn: {
      gap: 12,
    },
    listCard: {
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: palette.surface,
    },
    listCardContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16,
    },
    listCardLeft: {
      flex: 1,
    },
    listTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "500",
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    listMeta: {
      color: palette.muted,
      fontSize: 12,
      fontWeight: "400",
    },
    listCardRight: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    editButton: {
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: palette.background,
    },
    editButtonText: {
      color: palette.text,
      fontSize: 13,
      fontWeight: "500",
    },
    compareButton: {
      borderWidth: 1.5,
      borderColor: palette.accent,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: palette.accentSoft,
    },
    compareButtonText: {
      color: palette.accentDeep,
      fontSize: 13,
      fontWeight: "600",
    },
    modalScrim: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    modalCard: {
      width: "100%",
      maxWidth: 420,
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 24,
      backgroundColor: palette.background,
      paddingHorizontal: 28,
      paddingTop: 28,
      paddingBottom: 24,
      gap: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalTitle: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "400",
      letterSpacing: -0.7,
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      backgroundColor: palette.surface,
    },
    modalCloseButtonText: {
      color: palette.muted,
      fontSize: 18,
      fontWeight: "400",
    },
    modalInput: {
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: palette.text,
      fontSize: 16,
      fontWeight: "400",
      backgroundColor: palette.surface,
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 4,
    },
    modalButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    modalCancelButton: {
      borderWidth: 1.5,
      borderColor: palette.line,
      backgroundColor: palette.surface,
    },
    modalCancelButtonText: {
      color: palette.text,
      fontSize: 15,
      fontWeight: "500",
    },
    modalSubmitButton: {
      backgroundColor: palette.accent,
    },
    modalSubmitButtonText: {
      color: palette.black,
      fontSize: 15,
      fontWeight: "600",
    },
  });
}
