import { SAMPLE_NOTES, Note } from '../constants/sampleData';

type Listener = (notes: Note[]) => void;

class NotesStore {
  private notes: Note[] = [...SAMPLE_NOTES];
  private listeners: Set<Listener> = new Set();

  getNotes() {
    return this.notes;
  }

  addNote(newNote: Omit<Note, 'id' | 'date' | 'timestamp'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timestamp = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const noteWithId: Note = {
      ...newNote,
      id,
      date,
      timestamp,
    };

    this.notes = [noteWithId, ...this.notes];
    this.notify();
    console.log('Store: Note added. Total:', this.notes.length);
  }

  updateNote(id: string, updatedData: Partial<Note>) {
    this.notes = this.notes.map((note) =>
      note.id === id ? { ...note, ...updatedData } : note
    );
    this.notify();
    console.log('Store: Note updated:', id);
  }

  deleteNote(id: string) {
    this.notes = this.notes.filter((note) => note.id !== id);
    this.notify();
    console.log('Store: Note deleted:', id);
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.notes));
  }
}

export const notesStore = new NotesStore();
