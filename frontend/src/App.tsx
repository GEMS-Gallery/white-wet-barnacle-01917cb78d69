import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { AuthClient } from '@dfinity/auth-client';
import { Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import PokerTable from './components/PokerTable';
import PlayerActions from './components/PlayerActions';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [gameId, setGameId] = useState<number | null>(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
    };
    initAuth();
  }, []);

  const login = async () => {
    if (authClient) {
      await authClient.login({
        identityProvider: 'https://identity.ic0.app/#authorize',
        onSuccess: () => setIsAuthenticated(true),
      });
    }
  };

  const createGame = async () => {
    setLoading(true);
    try {
      const result = await backend.createGame();
      if ('ok' in result) {
        setGameId(Number(result.ok));
        await fetchGameState();
      } else {
        console.error('Failed to create game:', result.err);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
    setLoading(false);
  };

  const joinGame = async () => {
    if (gameId === null) return;
    setLoading(true);
    try {
      const result = await backend.joinGame(BigInt(gameId));
      if ('ok' in result) {
        await fetchGameState();
      } else {
        console.error('Failed to join game:', result.err);
      }
    } catch (error) {
      console.error('Error joining game:', error);
    }
    setLoading(false);
  };

  const fetchGameState = async () => {
    try {
      const result = await backend.getGameState();
      if ('ok' in result) {
        setGameState(result.ok);
      } else {
        console.error('Failed to fetch game state:', result.err);
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  };

  const placeBet = async (amount: number) => {
    setLoading(true);
    try {
      const result = await backend.placeBet(BigInt(amount));
      if ('ok' in result) {
        await fetchGameState();
      } else {
        console.error('Failed to place bet:', result.err);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
    }
    setLoading(false);
  };

  const fold = async () => {
    setLoading(true);
    try {
      const result = await backend.fold();
      if ('ok' in result) {
        await fetchGameState();
      } else {
        console.error('Failed to fold:', result.err);
      }
    } catch (error) {
      console.error('Error folding:', error);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Texas Hold'em
          </Typography>
          <Button variant="contained" onClick={login}>
            Login with Internet Identity
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Texas Hold'em
        </Typography>
        {!gameId && (
          <Button variant="contained" onClick={createGame} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create Game'}
          </Button>
        )}
        {gameId && !gameState && (
          <Button variant="contained" onClick={joinGame} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Join Game'}
          </Button>
        )}
      </Box>
      {gameState && (
        <>
          <PokerTable gameState={gameState} />
          <PlayerActions placeBet={placeBet} fold={fold} loading={loading} />
        </>
      )}
    </Container>
  );
}

export default App;
