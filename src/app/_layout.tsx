import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotesProvider, useNotes } from '../context/NotesContext';

function NavStack() {
  const { isDark } = useNotes();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: isDark ? '#0C0A09' : '#FAFAF8',
        },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <NotesProvider>
        <NavStack />
      </NotesProvider>
    </SafeAreaProvider>
  );
}
