import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Switch,
  StyleSheet,
  StatusBar,
  useColorScheme,
  useWindowDimensions,
  ListRenderItemInfo,
  ViewStyle,
  StyleProp,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { Colors } from '../constants/theme';
import { Note } from '../constants/sampleData';
import { useNotes } from '../context/NotesContext';

export default function NotesListScreen() {
  const { notes, isDark, setIsDark } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const { width } = useWindowDimensions();

  const theme = isDark ? Colors.dark : Colors.light;
  const isTablet = width >= 768;
  const cardWidth = isTablet ? (width - 64) / 2 : width - 32;

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.tag.toLowerCase().includes(q)
    );
  }, [searchQuery, notes]);

  const tagColors = [
    { bg: theme.tag1, text: theme.tag1Text },
    { bg: theme.tag2, text: theme.tag2Text },
    { bg: theme.tag3, text: theme.tag3Text },
  ];



  const renderNote = ({ item }: ListRenderItemInfo<Note>) => {
    const tag = tagColors[item.tagIndex % 3];

    const cardBase = StyleSheet.compose(styles.card, {
      backgroundColor: isDark ? 'rgba(28, 25, 23, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
      width: cardWidth,
    }) as StyleProp<ViewStyle>;

    return (
      <Pressable
        style={({ pressed }) => [
          cardBase,
          pressed && styles.cardPressed,
        ]}
        onPress={() => router.push({ pathname: '/editor', params: { id: item.id } })}
        accessibilityRole="button"
        accessibilityLabel={`Open note: ${item.title}`}
      >
        <GlassView 
          glassEffectStyle="regular" 
          colorScheme={isDark ? 'dark' : 'light'} 
          style={styles.glassWrapper}
        >
          {item.pinned && (
            <View style={[styles.pinnedStrip, { backgroundColor: theme.primary }]} />
          )}

          <View style={styles.cardInner}>
          <View style={styles.cardTopRow}>
            <View style={[styles.tagBadge, { backgroundColor: tag.bg }]}>
              <Text style={[styles.tagText, { color: tag.text }]}>{item.tag}</Text>
            </View>
            {item.pinned && (
              <Text style={[styles.pinIcon, { color: theme.primary }]}>📌</Text>
            )}
          </View>

          {/* Title */}
          <Text
            style={[styles.noteTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {/* Content preview */}
          <Text
            style={[styles.noteContent, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {item.content}
          </Text>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={[styles.footerDate, { color: theme.textTertiary }]}>
              {item.date}
            </Text>
            <Text style={[styles.footerTime, { color: theme.textTertiary }]}>
              {item.timestamp}
            </Text>
          </View>
        </View>
      </GlassView>
    </Pressable>
  );
};

  return (
    <ImageBackground
      source={require('../../assets/images/app-background.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />

        {/* ── Header ── */}
        <View style={[styles.header, { borderBottomColor: theme.border + '40', backgroundColor: isDark ? 'rgba(12, 10, 9, 0.4)' : 'rgba(250, 250, 248, 0.4)' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Notes</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {notes.length} notes total
          </Text>
        </View>

        <View style={[styles.themeToggleWrap, { backgroundColor: theme.toggleBg }]}>
          <Text style={styles.themeEmoji}>{isDark ? '🌙' : '☀️'}</Text>
          <Switch
            value={isDark}
            onValueChange={setIsDark}
            trackColor={{ false: '#D6D3D1', true: theme.primary + 'AA' }}
            thumbColor={isDark ? theme.primary : '#FFFFFF'}
            ios_backgroundColor="#D6D3D1"
            accessibilityLabel="Toggle dark mode"
          />
        </View>
      </View>

        {/* ── Search Bar ── */}
        <View
          style={[
            styles.searchWrap,
            { 
              backgroundColor: isDark ? 'rgba(28, 25, 23, 0.5)' : 'rgba(255, 255, 255, 0.5)', 
              borderColor: theme.border + '40' 
            },
          ]}
        >
        <Text style={styles.searchEmoji}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search notes..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          accessibilityLabel="Search notes input"
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Clear search"
            hitSlop={8}
          >
            <Text style={[styles.clearBtn, { color: theme.textSecondary }]}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* ── Results count ── */}
      {searchQuery.length > 0 && (
        <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
          {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''} found
        </Text>
      )}

      {/* ── Notes FlatList ── */}
      <FlatList
        data={filteredNotes}
        extraData={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        numColumns={isTablet ? 2 : 1}
        key={isTablet ? 'tablet-2col' : 'phone-1col'}
        contentContainerStyle={[
          styles.listContent,
          filteredNotes.length === 0 && styles.listEmpty,
        ]}
        columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No notes found
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Try a different search term or create a new note
            </Text>
          </View>
        }
      />

      {/* ── Floating Action Button ── */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: theme.primary },
          pressed && styles.fabPressed,
        ]}
        onPress={() => router.push('/editor')}
        accessibilityRole="button"
        accessibilityLabel="Create new note"
      >
        <Text style={styles.fabIcon}>＋</Text>
        </Pressable>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },
  themeToggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 24,
    gap: 6,
  },
  themeEmoji: {
    fontSize: 16,
  },

  // ── Search ──
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 14,
    paddingHorizontal: 4,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 12,
    marginHorizontal: 20,
    marginBottom: 4,
    fontWeight: '500',
  },

  // ── List ──
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
  },
  columnWrapper: {
    gap: 12,
  },

  // ── Note Card ──
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  glassWrapper: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.984 }],
  },
  pinnedStrip: {
    height: 3,
    width: '100%',
  },
  cardInner: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  pinIcon: {
    fontSize: 14,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerTime: {
    fontSize: 12,
    fontWeight: '400',
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.88,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 36,
    fontWeight: '300',
  },
});
