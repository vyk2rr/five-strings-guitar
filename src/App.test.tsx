import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App Integration Tests', () => {
  // --- Test de Renderizado Inicial ---
  it('renders the initial state with piano, guitar, and default chord buttons', () => {
    render(<App />);
    expect(screen.getByTestId('piano-base')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument(); // Guitarra
    // FIX: Use a specific regex to find only the root position chord button.
    expect(screen.getByRole('button', { name: /^Dmaj$/i })).toBeInTheDocument();
  });

  // --- Tests de Interacción con Acordes ---
  describe('Chord Selection and Interaction', () => {
    it('highlights assigned notes and error-highlights unassigned notes on the piano', async () => {
      render(<App />);
      const piano = screen.getByTestId('piano-base');
      // FIX: Use a specific regex for the button.
      const dMaj7Button = screen.getByRole('button', { name: /^Dmaj7$/i });

      const cSharp6Key = piano.querySelector('[data-note="C#6"]');
      expect(cSharp6Key).not.toHaveClass('error-highlight');

      fireEvent.click(dMaj7Button);

      await waitFor(() => {
        const cSharp6KeyAfterClick = piano.querySelector('[data-note="C#6"]');
        expect(cSharp6KeyAfterClick).toHaveClass('error-highlight');

        const d4KeyAfterClick = piano.querySelector('[data-note="D4"]');
        expect(d4KeyAfterClick).not.toHaveClass('error-highlight');
        expect(d4KeyAfterClick).toHaveClass('highlight-group-1');
      });
    });

    it('displays the selected chord name and applies the selected class to the button on click', async () => {
      render(<App />);
      const dMajButton = screen.getByRole('button', { name: /^Dmaj$/i });

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(dMajButton).not.toHaveClass('selected');

      fireEvent.click(dMajButton);

      await waitFor(() => {
        const title = screen.getByRole('heading', { name: /Dmaj/i });
        expect(title).toBeInTheDocument();
        expect(dMajButton).toHaveClass('selected');
      });
    });
  });

  // --- Tests de Interacción con el Dropdown de Nota Raíz ---
  describe('Root Note Dropdown Interaction', () => {
    it('updates the chord list and resets selection when root note is changed', async () => {
      render(<App />);
      
      // 1. Verificamos el estado inicial y seleccionamos un acorde.
      // FIX: Use a specific regex for the button.
      const dMajButton = screen.getByRole('button', { name: /^Dmaj$/i });
      expect(dMajButton).toBeInTheDocument();
      fireEvent.click(dMajButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Dmaj/i })).toBeInTheDocument();
      });

      // 2. Cambiamos la nota raíz a 'E' usando el select.
      const noteSelector = screen.getByLabelText(/Nota Raíz/i);
      fireEvent.change(noteSelector, { target: { value: 'E' } });

      await waitFor(() => {
        // 3. Verificamos los resultados del cambio.
        expect(screen.queryByRole('button', { name: /^Dmaj$/i })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^Emaj$/i })).toBeInTheDocument();
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      });
    });
  });

  // --- Tests para el botón de Inversiones ---
  describe('Inversions Toggle Button', () => {
    it('should toggle the visibility of chord inversions', async () => {
      render(<App />);

      const toggleButton = screen.getByRole('button', { name: /inversiones/i });

      // 1. Estado inicial: Las inversiones se muestran
      expect(toggleButton).toHaveTextContent('Ocultar Inversiones');
      expect(screen.getByRole('button', { name: /Dmaj \(1ª\)/i })).toBeInTheDocument();

      // 2. Ocultar inversiones
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(toggleButton).toHaveTextContent('Mostrar Inversiones');
        expect(screen.queryByRole('button', { name: /Dmaj \(1ª\)/i })).not.toBeInTheDocument();
      });

      // 3. Mostrar inversiones de nuevo
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveTextContent('Ocultar Inversiones');
        expect(screen.getByRole('button', { name: /Dmaj \(1ª\)/i })).toBeInTheDocument();
      });
    });
  });
});