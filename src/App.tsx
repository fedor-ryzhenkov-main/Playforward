import React from 'react';
import { Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import './App.css';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { ContextMenuProvider } from './contexts/ContextMenuContext';
import TrackListController from './components/TrackList/Controller';
import { ModalProvider } from './contexts/ModalContext';

const App: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h1" align="center" gutterBottom>
        Playforward
      </Typography>
      <Grid container flexDirection="column" spacing={3} justifyContent="center" alignItems="center">
        <div style={{ width: '100%' }}>
          <ModalProvider>
            <ContextMenuProvider>
              <AudioPlayerProvider>
                <TrackListController />
              </AudioPlayerProvider>
            </ContextMenuProvider>
          </ModalProvider>
        </div>
      </Grid>
    </Container>
  );
};

export default App;