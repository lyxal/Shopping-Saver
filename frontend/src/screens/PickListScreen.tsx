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
  onDirectCompare,
}: {
  lists: ListSummary[];
  loading: boolean;
  newListName: string;
  onNewListNameChange: (value: string) => void;
  onCreateList: () => void;
  onPickList: (list: ListSummary) => void;
  onBackToLogin: () => void;
  onDirectCompare: (list: ListSummary) => void;
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
        <View>
          <Text style={styles.brand}>Open.</Text>
          <Text style={styles.title}>Your Lists</Text>
        </View>
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
              <View key={list.ListID} style={styles.listCard}>
                <View style={styles.listCardContent}>
                  <View style={styles.listCardLeft}>
                    <Text style={styles.listTitle}>{list.ListName}</Text>
                    <Text style={styles.listMeta}>{list.ProductCount} item(s) • Created {new Date(list.CreatedAt).toLocaleDateString()} • Last Edited {new Date(list.LastEdited).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.listCardRight}>
                    <Pressable onPress={() => onPickList(list)} style={styles.editButton}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable style={styles.compareButton} onPress={() => onDirectCompare(list)}>
                      <Text style={styles.compareButtonText}>Compare</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
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
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 14,
      marginBottom: 20,
    },
    brand: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "300",
      letterSpacing: -0.9,
      marginBottom: 2,
    },
    title: {
      color: palette.text,
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "600",
      letterSpacing: -0.6,
    },
    topBarActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    createListButton: {
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: palette.accent,
    },
    createListButtonText: {
      color: palette.black,
      fontSize: 13,
      fontWeight: "600",
    },
    body: {
      flex: 1,
      marginTop: 0,
    },
    listColumn: {
      gap: 10,
    },
    listCard: {
      borderWidth: 1.5,
      borderColor: palette.line,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: palette.surface,
    },
    listCardContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    listCardLeft: {
      flex: 1,
    },
    listTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "500",
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    listMeta: {
      color: palette.muted,
      fontSize: 11,
      fontWeight: "400",
    },
    listCardRight: {
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
    },
    editButton: {
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: palette.background,
    },
    editButtonText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: "500",
    },
    compareButton: {
      borderWidth: 1.5,
      borderColor: palette.accent,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: palette.accentSoft,
    },
    compareButtonText: {
      color: palette.accentDeep,
      fontSize: 12,
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
