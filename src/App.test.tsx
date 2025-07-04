import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App Integration Tests', () => {
  it('renders the initial state with piano, guitar, and chord buttons', () => {
    render(<App />);
    expect(screen.getByTestId('piano-base')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
    const dChordButtons = screen.getAllByRole('button', { name: /Dmaj/i });
    expect(dChordButtons[0]).toBeInTheDocument();
  });

  it('handles chord selection and highlights unassigned notes on the piano', async () => {
    render(<App />);

    const dMaj7Button = screen.getByRole('button', { name: /^Dmaj7$/i });
    const piano = screen.getByTestId('piano-base');
    
    // FIX: Use piano.querySelector directly.
    const cSharp6Key = piano.querySelector('[data-note="C#6"]');
    expect(cSharp6Key).not.toHaveClass('error-highlight');

    fireEvent.click(dMaj7Button);

    await waitFor(() => {
      // FIX: Use piano.querySelector directly.
      const cSharp6KeyAfterClick = piano.querySelector('[data-note="C#6"]');
      expect(cSharp6KeyAfterClick).toHaveClass('error-highlight');

      // FIX: Use piano.querySelector directly.
      const d4KeyAfterClick = piano.querySelector('[data-note="D4"]');
      expect(d4KeyAfterClick).not.toHaveClass('error-highlight');
      expect(d4KeyAfterClick).toHaveClass('highlight-group-1');

      const unassignedNotesDiv = screen.getByText(/unassignedNotes:/i);
      expect(unassignedNotesDiv).toHaveTextContent('C#6');
    });
  });

  it('clears highlights when a new, smaller chord is selected', async () => {
    render(<App />);
    const piano = screen.getByTestId('piano-base');

    const dMaj7Button = screen.getByRole('button', { name: /^Dmaj7$/i });
    fireEvent.click(dMaj7Button);

    await waitFor(() => {
      // FIX: Use piano.querySelector directly.
      const cSharp6KeyAfterClick = piano.querySelector('[data-note="C#6"]');
      expect(cSharp6KeyAfterClick).toHaveClass('error-highlight');
    });

    const dMajButton = screen.getByRole('button', { name: /^Dmaj$/i });
    fireEvent.click(dMajButton);

    await waitFor(() => {
      // FIX: Use piano.querySelector directly.
      const cSharp6KeyAfterNewClick = piano.querySelector('[data-note="C#6"]');
      expect(cSharp6KeyAfterNewClick).not.toHaveClass('error-highlight');
      expect(cSharp6KeyAfterNewClick).not.toHaveClass('highlight-group-1');

      // FIX: Use piano.querySelector directly.
      const d4KeyAfterNewClick = piano.querySelector('[data-note="D4"]');
      expect(d4KeyAfterNewClick).toHaveClass('highlight-group-1');
    });
  });
});