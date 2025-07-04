import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import { generateNotes, getAlternativeNotation, getBlackKeyLeft, getBlackKeyWidth } from "./PianoBase.utils";
import type { tChord, tOctaveRange, tNoteWithOctave, tSequenceToPlayProps, iChordEvent, tMelodySequence } from "./PianoBase.types";
import type { PianoObserver } from "../PianoObserver/PianoObserver";
import useHighlight from "../hooks/useHighlight/useHighlight";
import useToneJs from "../hooks/useToneJs/useToneJs";
import type { SupportedSynthType } from "../hooks/useToneJs/useToneJs";
import './PianoBase.css';

export interface RenderUIParams {
  white: tChord;
  black: tChord;
  octaves: tOctaveRange;
  octave: tOctaveRange;
  handlePianoKeyClick: (note: tNoteWithOctave) => void;
  isNoteActive: (note: tNoteWithOctave) => {
    clicked: boolean;
    group1: boolean;
    group2: boolean;
  };
  getBlackKeyLeft: (note: tNoteWithOctave, whiteKeys: tChord) => string;
  getBlackKeyWidth: (octaves: tOctaveRange) => string;
  getAlternativeNotation: (note: tNoteWithOctave) => string;
}

export interface PianoBaseProps {
  octave?: tOctaveRange;
  octaves?: tOctaveRange;
  highlightOnThePiano?: tChord;
  errorNotes?: tChord;
  sequenceToPlay?: tSequenceToPlayProps;
  pianoObservable?: PianoObserver;
  className?: string;
  renderUI?: (params: RenderUIParams) => React.ReactNode;
  createSynth?: () => SupportedSynthType;
}

export type PianoBaseHandle = {
  handleMelodyEvent: (event: iChordEvent) => void;
  scheduleMelody: (
    sequence: tMelodySequence,
    onEventCallback: (event: iChordEvent) => void,
    onComplete?: () => void
  ) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  isReady: boolean;
  startTone: () => Promise<void>;
  playArpeggio: (chord: tChord, duration?: string, interval?: string, velocity?: number) => Promise<void>;
  playChord: (chord: tChord, duration?: string, time?: string, velocity?: number) => Promise<void>;
};

const PianoBase = forwardRef<PianoBaseHandle, PianoBaseProps>(({
  octave = 4,
  octaves = 3,
  highlightOnThePiano,
  errorNotes = [], // Receive errorNotes
  pianoObservable,
  className,
  renderUI,
  createSynth,
}, ref) => {
  const { white, black } = generateNotes(octaves, octave);

  const {
    highlightNoteInGroup,
    highlightClickedNote,
    clearGroupHighlights,
    isNoteClicked,
    isNoteInGroup,
  } = useHighlight();

  const {
    isReady,
    start: startTone,
    play,
    pause,
    stop,
    scheduleMelody,
    playNote,
    durationToMs,
    playArpeggio,
    playChord,
  } = useToneJs({ bpm: 80, createSynth });

  useEffect(() => {
    clearGroupHighlights(0);
    if (highlightOnThePiano) {
      const chordArray = Array.isArray(highlightOnThePiano) ? highlightOnThePiano : [highlightOnThePiano];

      playArpeggio(chordArray, "4n", "16n", 0.7);

      chordArray.forEach(note => {
        highlightNoteInGroup(note, Infinity, 0);
      });
    }
  }, [highlightOnThePiano, highlightNoteInGroup, clearGroupHighlights, playArpeggio]);

  const handleMelodyEvent = (event: iChordEvent) => {
    const { pitches, duration, highlightGroup } = event;
    if (!pitches || pitches.length === 0 || !durationToMs) return;

    console.log('Resaltando acorde:', pitches, 'con duración:', duration);

    pianoObservable?.notify({ type: "chordPlayed", chord: pitches });

    if (highlightGroup !== undefined) {
      const visualDurationMs = durationToMs(duration) + 80;
      pitches.forEach(note => {
        highlightNoteInGroup(note, visualDurationMs, highlightGroup - 1);
      });
    }
  };

  const handlePianoKeyClick = (note: tNoteWithOctave) => {
    highlightClickedNote(note, 180);
    playNote(note);
    pianoObservable?.notify({ type: "notePlayed", note });
  };

  useImperativeHandle(ref, () => ({
    handleMelodyEvent,
    scheduleMelody,
    play,
    pause,
    stop,
    isReady,
    startTone,
    playArpeggio,
    playChord
  }));

  const isErrorNote = (note: tNoteWithOctave) => errorNotes.includes(note);

  return (
    <div className={`piano-base ${className || ''}`} data-testid="piano-base">
      {renderUI ? renderUI({
        white,
        black,
        octaves,
        octave,
        handlePianoKeyClick,
        isNoteActive: (note: tNoteWithOctave) => ({
          clicked: isNoteClicked(note),
          group1: isNoteInGroup(note, 0),
          group2: isNoteInGroup(note, 1)
        }),
        getBlackKeyLeft: (note: tNoteWithOctave, whiteKeys: tChord) => getBlackKeyLeft(note, whiteKeys),
        getBlackKeyWidth: (octaves: tOctaveRange) => getBlackKeyWidth(octaves),
        getAlternativeNotation,
      }) : (
        <div className="piano">
          <div className="white-keys">
            {white.map(note => {
              const errorHighlight = isErrorNote(note);
              const clicked = isNoteClicked(note);
              const group1 = isNoteInGroup(note, 0);
              const group2 = isNoteInGroup(note, 1);
              return (
                <div
                  key={note}
                  className={`
                    white-key
                    ${errorHighlight ? 'error-highlight' : ''}
                    ${!errorHighlight && clicked ? "active-key" : ""}
                    ${!errorHighlight && group1 ? "highlight-group-1" : ""}
                    ${!errorHighlight && group2 ? "highlight-group-2" : ""}
                  `}
                  data-note={note}
                  onClick={() => handlePianoKeyClick(note)}
                >
                  {(group1 || group2 || note.startsWith('C') || errorHighlight) && <span className="note-name">{note}</span>}
                </div>
              );
            })}
          </div>
          <div className="black-keys">
            {black.map(noteString => {
              const errorHighlight = isErrorNote(noteString);
              const clicked = isNoteClicked(noteString);
              const group1 = isNoteInGroup(noteString, 0);
              const group2 = isNoteInGroup(noteString, 1);
              return (
                <div
                  key={noteString}
                  className={`
                    black-key
                    ${errorHighlight ? 'error-highlight' : ''}
                    ${!errorHighlight && clicked ? "active-key" : ""}
                    ${!errorHighlight && group1 ? "highlight-group-1" : ""}
                    ${!errorHighlight && group2 ? "highlight-group-2" : ""}
                  `}
                  style={{
                    pointerEvents: "all",
                    left: getBlackKeyLeft(noteString, white),
                    width: getBlackKeyWidth(octaves)
                  }}
                  data-note={noteString}
                  onClick={() => handlePianoKeyClick(noteString)}
                >
                  {(group1 || group2 || errorHighlight) && (
                    <span className="note-name">
                      <span>{noteString}</span>
                      <span className="flat-notation">{getAlternativeNotation(noteString)}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default PianoBase;