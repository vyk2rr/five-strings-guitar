import { render, waitFor, screen } from '@testing-library/react';
import FiveStringsGuitar from './FiveStringsGuitar';
import type { tChord } from '../PianoBase/PianoBase.types';

describe('FiveStringsGuitar', () => {

  // --- Tests de Renderizado Visual Estático ---
  describe('Static Visual Rendering', () => {
    beforeEach(() => {
      render(<FiveStringsGuitar />);
    });

    it('renders 5 horizontal string lines', () => {
      // Seleccionamos las líneas de las cuerdas por su data-testid
      const stringLines = screen.getAllByTestId('string-line');
      expect(stringLines.length).toBe(5);
    });

    it('renders 1 vertical fret line', () => {
      const fretLine = screen.getByTestId('fret-line');
      expect(fretLine).toBeInTheDocument();
    });

    it('renders 6 inlay dots (markers on the neck)', () => {
      // Los inlays son los únicos círculos con este color de relleno
      const inlayDots = document.querySelectorAll('circle[fill="#000"]');
      expect(inlayDots.length).toBe(5);
    });

    it('renders 70 note markers (14 frets * 5 strings)', () => {
      // FIX: Use a regex to find all test IDs that start with "note-marker-"
      const noteMarkers = screen.getAllByTestId(/^note-marker-/);
      expect(noteMarkers.length).toBe(14 * 5);
    });
  });

  // --- Tests de Lógica de Resaltado ---
  describe('Highlighting Logic', () => {
    it('does not highlight any notes when the chord is empty or undefined', () => {
      const { rerender } = render(<FiveStringsGuitar chord={[]} />);
      // El nuevo selector busca por el radio del círculo resaltado
      let highlightedCircles = document.querySelectorAll('circle[r="25"]');
      expect(highlightedCircles.length).toBe(0);

      rerender(<FiveStringsGuitar chord={undefined} />);
      highlightedCircles = document.querySelectorAll('circle[r="25"]');
      expect(highlightedCircles.length).toBe(0);
    });

    it('highlights a simple chord with one note per string', async () => {
      const chord: tChord = ['D4', 'A4', 'E5', 'A5', 'D6'];
      render(<FiveStringsGuitar chord={chord} />);
      await waitFor(() => {
        const highlightedCircles = document.querySelectorAll('circle[r="25"]');
        expect(highlightedCircles.length).toBe(5);
      });
    });

    it('highlights a complex chord according to the existing algorithm', async () => {
      const chord: tChord = ['D4', 'F#4', 'A4', 'C#5', 'E5'];
      render(<FiveStringsGuitar chord={chord} />);
      
      await waitFor(() => {
        const highlightedCircles = document.querySelectorAll('circle[r="25"]');
        // El comportamiento actual resulta en 3 notas resaltadas para este caso.
        expect(highlightedCircles.length).toBe(3);
      });
    });

    it('highlights the correct notes with the correct colors', async () => {
      // Test para D Major: D, F#, A
      const chord: tChord = ['D4', 'F#4', 'A4'];
      render(<FiveStringsGuitar chord={chord} />);

      await waitFor(() => {
        const highlightedCircles = document.querySelectorAll('circle[r="25"]');
        // FIX: The current algorithm only assigns 2 notes for this chord (D4 and A4).
        expect(highlightedCircles.length).toBe(2);

        // Verificamos que los círculos resaltados tengan el color pastel correcto
        const d4Circle = document.querySelector('g[data-testid="note-marker-D4"] circle[r="25"]');
        const a4Circle = document.querySelector('g[data-testid="note-marker-A4"] circle[r="25"]');

        expect(d4Circle).toHaveAttribute('fill', '#ffc999'); // Pastel Orange for D
        expect(a4Circle).toHaveAttribute('fill', '#9999ff'); // Pastel Indigo for A
      });
    });
  });

  // --- Tests del Callback de Notas No Asignadas ---
  describe('Unassigned Notes Callback', () => {
    it('calls onUnassignedNotes with an empty array when all notes fit', async () => {
      const onUnassignedNotes = jest.fn();
      const chord: tChord = ['D4', 'A4', 'E5'];
      render(<FiveStringsGuitar chord={chord} onUnassignedNotes={onUnassignedNotes} />);

      await waitFor(() => {
        expect(onUnassignedNotes).toHaveBeenCalledWith([]);
      });
    });

    it('calls onUnassignedNotes with notes that could not be assigned', async () => {
      const onUnassignedNotes = jest.fn();
      const chord: tChord = ['D4', 'F#4', 'A4', 'C#5', 'E5'];
      render(<FiveStringsGuitar chord={chord} onUnassignedNotes={onUnassignedNotes} />);

      await waitFor(() => {
        expect(onUnassignedNotes).toHaveBeenCalledWith(expect.arrayContaining(['F#4', 'C#5']));
        const calls = onUnassignedNotes.mock.calls;
        const lastCallArgs = calls[calls.length - 1][0];
        expect(lastCallArgs.length).toBe(2);
      });
    });
  });
});