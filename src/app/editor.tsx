import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  useWindowDimensions,
  Alert,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/theme';
import { useNotes } from '../context/NotesContext';
import { useEffect } from 'react';

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notes, addNote, updateNote, deleteNote, isDark } = useNotes();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState(0);
  const { width } = useWindowDimensions();

  const theme = isDark ? Colors.dark : Colors.light;
  const isTablet = width >= 768;
  const contentRef = useRef<TextInput>(null);

  const TAGS = ['Personal', 'Work', 'Learning'];
  const tagColors = [
    { bg: theme.tag1, text: theme.tag1Text },
    { bg: theme.tag2, text: theme.tag2Text },
    { bg: theme.tag3, text: theme.tag3Text },
  ];

  // Load existing note if editing
  useEffect(() => {
    if (id) {
      const existingNote = notes.find((n) => n.id === id);
      if (existingNote) {
        setTitle(existingNote.title);
        setContent(existingNote.content);
        setSelectedTag(existingNote.tagIndex || 0);
      }
    }
  }, [id]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title to your note before saving.', [
        { text: 'OK' },
      ]);
      return;
    }

    if (id) {
      // Update existing
      updateNote(id, {
        title,
        content,
        tag: TAGS[selectedTag],
        tagIndex: selectedTag,
      });
      Alert.alert('Note Updated!', `"${title}" has been updated.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      // Add new
      addNote({
        title: title,
        content: content,
        tag: TAGS[selectedTag],
        tagIndex: selectedTag,
        pinned: false,
      });
      Alert.alert('Note Saved!', `"${title}" has been saved successfully.`, [
        { text: 'Back to Notes', onPress: () => router.back() },
      ]);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            deleteNote(id);
            router.back();
          } 
        },
      ]
    );
  };

  const handleBack = () => {
    if (title.trim() || content.trim()) {
      const original = id ? notes.find(n => n.id === id) : null;
      const hasChanged = original 
        ? (original.title !== title || original.content !== content || original.tagIndex !== selectedTag)
        : true;

      if (hasChanged) {
        Alert.alert('Discard Changes?', 'You have unsaved changes that will be lost.', [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]);
        return;
      }
    }
    router.back();
  };

  const dynamicContentArea = StyleSheet.flatten([
    styles.contentScrollArea,
    { backgroundColor: theme.background },
  ]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {/* ── ImageBackground Header ── */}
        <ImageBackground
          source={require('../../assets/images/header-bg.png')}
          style={[styles.headerBg, isTablet && styles.headerBgTablet]}
          resizeMode="cover"
        >
          <View style={[styles.headerOverlay, { backgroundColor: theme.headerOverlay }]}>

            <View style={styles.headerActionsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.backBtn,
                  pressed && styles.btnPressed,
                ]}
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backBtnText}>← Back</Text>
              </Pressable>

              <Text style={styles.headerLabel}>{id ? 'Edit Note' : 'New Note'}</Text>

              <View style={styles.headerRightActions}>
                {id && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.deleteBtn,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={handleDelete}
                    accessibilityRole="button"
                    accessibilityLabel="Delete note"
                  >
                    <Text style={[styles.deleteBtnText, { color: theme.danger }]}>🗑️</Text>
                  </Pressable>
                )}
                
                <Pressable
                  style={({ pressed }) => [
                    styles.saveBtn,
                    { backgroundColor: theme.primary },
                    pressed && styles.btnPressed,
                  ]}
                  onPress={handleSave}
                  accessibilityRole="button"
                  accessibilityLabel="Save note"
                >
                  <Text style={styles.saveBtnText}>{id ? 'Update' : 'Save'}</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.headerDate}>{today}</Text>
            <TextInput
              style={[
                styles.titleInput,
                isTablet && styles.titleInputTablet,
              ]}
              placeholder="Note title..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              onSubmitEditing={() => contentRef.current?.focus()}
              maxLength={100}
              accessibilityLabel="Note title input"
            />
          </View>
        </ImageBackground>

        <View style={[styles.tagRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.tagLabel, { color: theme.textSecondary }]}>Category:</Text>
          <View style={styles.tagOptions}>
            {TAGS.map((tag, idx) => {
              const isSelected = selectedTag === idx;
              const tColor = tagColors[idx];
              const tagPillStyle = StyleSheet.compose(styles.tagPill, {
                backgroundColor: isSelected ? tColor.bg : 'transparent',
                borderColor: tColor.text + '60',
              }) as StyleProp<ViewStyle>;
              return (
                <Pressable
                  key={tag}
                  style={({ pressed }) => [
                    tagPillStyle,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setSelectedTag(idx)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${tag} category`}
                >
                  <Text
                    style={[
                      styles.tagPillText,
                      { color: isSelected ? tColor.text : theme.textSecondary },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.statsBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.statText, { color: theme.textTertiary }]}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </Text>
          <View style={[styles.statDot, { backgroundColor: theme.border }]} />
          <Text style={[styles.statText, { color: theme.textTertiary }]}>
            {charCount} characters
          </Text>
          <View style={[styles.statDot, { backgroundColor: theme.border }]} />
          <Text style={[styles.statText, { color: theme.textTertiary }]}>
            ~{Math.max(1, Math.ceil(wordCount / 200))} min read
          </Text>
        </View>

        <ScrollView
          style={dynamicContentArea}
          contentContainerStyle={[
            styles.contentScrollContainer,
            isTablet && styles.contentScrollContainerTablet,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            ref={contentRef}
            style={[
              styles.contentInput,
              { color: theme.text },
              isTablet && styles.contentInputTablet,
            ]}
            placeholder={
              'Start writing your note here...\n\nThis editor supports long-form writing. Your thoughts, ideas, and reflections all in one place. Use the keyboard freely — the view will adjust automatically so your content is always visible.'
            }
            placeholderTextColor={theme.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
            accessibilityLabel="Note content input"
          />
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.discardBtn,
              { borderColor: theme.border },
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Discard note"
          >
            <Text style={[styles.discardBtnText, { color: theme.textSecondary }]}>
              Discard
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.saveBottomBtn,
              { backgroundColor: theme.primary },
              pressed && { opacity: 0.82, transform: [{ scale: 0.96 }] },
            ]}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save note"
          >
            <Text style={styles.saveBottomBtnText}>Save Note</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },

  headerBg: {
    width: '100%',
    height: 200,
  },
  headerBgTablet: {
    height: 260,
  },
  headerOverlay: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 36 : 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.94 }],
  },
  headerDate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  titleInput: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingBottom: 6,
    paddingTop: 2,
  },
  titleInputTablet: {
    fontSize: 28,
  },

  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  tagLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '500',
  },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  statText: {
    fontSize: 11,
    fontWeight: '400',
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },

  contentScrollArea: {
    flex: 1,
  },
  contentScrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  contentScrollContainerTablet: {
    paddingHorizontal: 40,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    minHeight: 300,
  },
  contentInputTablet: {
    fontSize: 18,
    lineHeight: 30,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  discardBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBottomBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBottomBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
