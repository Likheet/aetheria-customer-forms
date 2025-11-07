import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './index.css'; // Import our custom CSS AFTER Mantine to override it
import { MantineProvider, createTheme } from '@mantine/core';

// Custom dark theme for Mantine components
const theme = createTheme({
  colors: {
    dark: [
      '#d5d7e0', // 0
      '#acaebf', // 1
      '#8c8fa3', // 2
      '#666980', // 3
      '#4d4f66', // 4
      '#34354a', // 5
      '#2b2c3d', // 6
      '#1d1e30', // 7
      '#0c0d21', // 8
      '#01010a', // 9
    ],
  },
  primaryColor: 'yellow',
  defaultRadius: 'md',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </StrictMode>
);
