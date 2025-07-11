import { shiftOctave, spreadVoicing } from './FiveStringsGuitar.utils';
import type { tChord } from '../PianoBase/PianoBase.types';

describe('FiveStringsGuitar.utils', () => {
  describe('shiftOctave', () => {
    it('should raise the octave by 1 when shift is 1', () => {
      expect(shiftOctave('D4', 1)).toBe('D5');
      expect(shiftOctave('F#4', 1)).toBe('F#5');
    });

    it('should lower the octave by 1 when shift is -1', () => {
      expect(shiftOctave('G4', -1)).toBe('G3');
      expect(shiftOctave('A#5', -1)).toBe('A#4');
    });

    it('should handle shift of 2 or more', () => {
      expect(shiftOctave('C3', 2)).toBe('C5');
    });
  });

  describe('spreadVoicing', () => {
    it('returns triad with 5 notes when input has length 3', () => {
      const triad: tChord = ['D4', 'F#4', 'A4'];
      const result = spreadVoicing(triad);
      expect(result).toEqual([
        'D4',    // i1
        'A4',    // i3
        'F#5',   // shiftOctave(i2, 1)
        'A5',    // shiftOctave(i3, 1)
        'D6'     // shiftOctave(i1, 2)
      ]);
    });

    it('returns tetrad with 6 notes when input has length 4', () => {
      const tetrad: tChord = ['D4', 'F#4', 'A4', 'C5'];
      const result = spreadVoicing(tetrad);
      expect(result).toEqual([
        'D4',    // i1
        'A4',    // i3
        'F#5',   // shiftOctave(i2, 1)
        'C6',    // shiftOctave(i4, 1)
        'A5',    // shiftOctave(i3, 1)
        'D6'     // shiftOctave(i1, 2)
      ]);
    });

    it('returns the same chord if it has an unexpected length', () => {
      const chord5: tChord = ['D4', 'E4', 'F4', 'G4', 'A4'];
      expect(spreadVoicing(chord5)).toEqual(chord5);

      const chord2: tChord = ['G4', 'B4'];
      expect(spreadVoicing(chord2)).toEqual(chord2);
    });
  });
});