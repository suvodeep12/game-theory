import { createRoot } from 'react-dom/client';
import '@fontsource/lilita-one/latin-400.css';
import '@fontsource/rethink-sans/latin-500.css';
import '@fontsource/rethink-sans/latin-600.css';
import '@fontsource/rethink-sans/latin-700.css';
import '@fontsource/rethink-sans/latin-800.css';
import App from './App.tsx';
import './styles.css';
createRoot(document.getElementById('root')!).render(<App />);
