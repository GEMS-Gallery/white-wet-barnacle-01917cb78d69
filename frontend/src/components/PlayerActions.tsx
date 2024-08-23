import React, { useState } from 'react';
import { Box, Button, TextField, CircularProgress } from '@mui/material';

interface PlayerActionsProps {
  placeBet: (amount: number) => void;
  fold: () => void;
  loading: boolean;
}

const PlayerActions: React.FC<PlayerActionsProps> = ({ placeBet, fold, loading }) => {
  const [betAmount, setBetAmount] = useState('');

  const handleBet = () => {
    const amount = parseInt(betAmount);
    if (!isNaN(amount) && amount > 0) {
      placeBet(amount);
      setBetAmount('');
    }
  };

  return (
    <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
      <TextField
        label="Bet Amount"
        variant="outlined"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
        type="number"
        disabled={loading}
      />
      <Button variant="contained" onClick={handleBet} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Bet'}
      </Button>
      <Button variant="outlined" onClick={fold} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Fold'}
      </Button>
    </Box>
  );
};

export default PlayerActions;
