import React from 'react';
import { Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AudioUploader from './components/AudioUploader/AudioUploader';
import TrackList from './components/TrackList/TrackList';
import './App.css';

const App: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h1" align="center" gutterBottom>
        Playforward
      </Typography>
      <Grid container flexDirection="column" spacing={3} justifyContent="center" alignItems="center">
        <Grid container justifyContent="center">
          <AudioUploader />
        </Grid>
        <Grid>
          <TrackList />
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;