import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Note } from '../constants/sampleData';
import { notesStore } from '../store/notesStore';

interface NotesContextType {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'date' | 'timestamp'>) => void;
  updateNote: (id: string, updatedData: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [notes, setNotes] = useState<Note[]>(notesStore.getNotes());
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  useEffect(() => {
    setIsDark(systemScheme === 'dark');
  }, [systemScheme]);

  useEffect(() => {
    const unsubscribe = notesStore.subscribe((updatedNotes) => {
      setNotes(updatedNotes);
    });
    return () => { unsubscribe(); };
  }, []);

  const addNote = (newNote: Omit<Note, 'id' | 'date' | 'timestamp'>) => {
    notesStore.addNote(newNote);
  };

  const updateNote = (id: string, updatedData: Partial<Note>) => {
    notesStore.updateNote(id, updatedData);
  };

  const deleteNote = (id: string) => {
    notesStore.deleteNote(id);
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, isDark, setIsDark }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};