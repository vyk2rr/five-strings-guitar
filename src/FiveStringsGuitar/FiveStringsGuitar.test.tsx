import { render, waitFor } from '@testing-library/react';
import FiveStringsGuitar from './FiveStringsGuitar';
import type { tChord } from '../PianoBase/PianoBase.types';

describe('FiveStringsGuitar', () => {
  it('renders without crashing', () => {
    render(<FiveStringsGuitar />);
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders the correct number of strings and frets', () => {
    render(<FiveStringsGuitar />);
    const strings = document.querySelectorAll('line');
    expect(strings.length).toBe(5);

    const frets = document.querySelectorAll('circle');
    expect(frets.length).toBe(14 * 5);
  });

  describe('Highlighting Logic (Current Behavior)', () => {
    it('does not highlight any notes when the chord is empty or undefined', () => {
      const { rerender } = render(<FiveStringsGuitar chord={[]} />);
      let yellowCircles = document.querySelectorAll('circle[fill="yellow"]');
      expect(yellowCircles.length).toBe(0);

      rerender(<FiveStringsGuitar chord={undefined} />);
      yellowCircles = document.querySelectorAll('circle[fill="yellow"]');
      expect(yellowCircles.length).toBe(0);
    });

    it('highlights a simple chord with one note per string', async () => {
      const chord: tChord = ['D4', 'A4', 'E5', 'A5', 'D6'];
      render(<FiveStringsGuitar chord={chord} />);
      await waitFor(() => {
        const yellowCircles = document.querySelectorAll('circle[fill="yellow"]');
        expect(yellowCircles.length).toBe(5);
      });
    });

    it('highlights a complex chord according to the existing algorithm', async () => {
      // Este test valida el comportamiento actual.
      // La lógica existente asigna una nota por cuerda, priorizando el traste más bajo para esa cuerda.
      // Para este acorde, asigna D4 (cuerda 1), A4 (cuerda 2) y E5 (cuerda 3).
      // F#4 y C#5 no se asignan porque sus cuerdas óptimas ya están ocupadas.
      const chord: tChord = ['D4', 'F#4', 'A4', 'C#5', 'E5'];
      render(<FiveStringsGuitar chord={chord} />);
      
      await waitFor(() => {
        const yellowCircles = document.querySelectorAll('circle[fill="yellow"]');
        // El comportamiento actual resulta en 3 notas resaltadas para este caso.
        expect(yellowCircles.length).toBe(3);
      });
    });
  });

  describe('Unassigned Notes Callback (Current Behavior)', () => {
    it('calls onUnassignedNotes with an empty array when all notes fit', async () => {
      const onUnassignedNotes = jest.fn();
      const chord: tChord = ['D4', 'A4', 'E5'];
      render(<FiveStringsGuitar chord={chord} onUnassignedNotes={onUnassignedNotes} />);

      await waitFor(() => {
        expect(onUnassignedNotes).toHaveBeenCalledWith([]);
      });
    });

    it('calls onUnassignedNotes with notes that could not be assigned by the current logic', async () => {
      const onUnassignedNotes = jest.fn();
      const chord: tChord = ['D4', 'F#4', 'A4', 'C#5', 'E5'];
      render(<FiveStringsGuitar chord={chord} onUnassignedNotes={onUnassignedNotes} />);

      await waitFor(() => {
        // Con la lógica actual, F#4 y C#5 no se pueden asignar en este acorde.
        // Usamos `expect.arrayContaining` porque el orden no está garantizado.
        expect(onUnassignedNotes).toHaveBeenCalledWith(expect.arrayContaining(['F#4', 'C#5']));
        // Verificamos que la longitud sea la correcta.
        const calls = onUnassignedNotes.mock.calls;
        const lastCallArgs = calls[calls.length - 1][0];
        expect(lastCallArgs.length).toBe(2);
      });
    });

    it('calls onUnassignedNotes with notes that are out of the fretboard range', async () => {
      const onUnassignedNotes = jest.fn();
      const chord: tChord = ['D4', 'A4', 'C1']; // C1 está fuera de rango
      render(<FiveStringsGuitar chord={chord} onUnassignedNotes={onUnassignedNotes} />);

      await waitFor(() => {
        expect(onUnassignedNotes).toHaveBeenCalledWith(['C1']);
      });
    });
  });
});