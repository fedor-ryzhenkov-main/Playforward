import React from 'react';
import { Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import TrackList from './components/TrackList/TrackList';
import './App.css';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { ContextMenuProvider } from './contexts/ContextMenuContext';

const App: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h1" align="center" gutterBottom>
        Playforward
      </Typography>
      <Grid container flexDirection="column" spacing={3} justifyContent="center" alignItems="center">
        <div style={{ width: '100%' }}>
          <ContextMenuProvider>
            <AudioPlayerProvider>
              <TrackList />
            </AudioPlayerProvider>
          </ContextMenuProvider>
        </div>
      </Grid>
    </Container>
  );
};

export default App;