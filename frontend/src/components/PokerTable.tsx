import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/system';

const TableContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: 400,
  backgroundColor: '#1E4D2B',
  borderRadius: '50%',
  position: 'relative',
  overflow: 'hidden',
}));

const PlayerPosition = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: theme.palette.secondary.main,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const CommunityCards = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  gap: theme.spacing(1),
}));

const Card = styled(Paper)(({ theme }) => ({
  width: 50,
  height: 70,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

interface PokerTableProps {
  gameState: any; // Replace 'any' with the actual type of your game state
}

const PokerTable: React.FC<PokerTableProps> = ({ gameState }) => {
  const playerPositions = [
    { top: '10%', left: '50%', transform: 'translateX(-50%)' },
    { top: '25%', right: '10%' },
    { bottom: '25%', right: '10%' },
    { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },
    { bottom: '25%', left: '10%' },
    { top: '25%', left: '10%' },
  ];

  return (
    <TableContainer>
      {gameState.players.map((player: any, index: number) => {
        const playerState = gameState.playerStates.find((ps: any) => ps[0] === player);
        return (
          <PlayerPosition key={index} style={playerPositions[index]}>
            <Typography variant="body2">{`Player ${index + 1}`}</Typography>
            <Typography variant="caption">{`Chips: ${playerState ? playerState[1].chips : 'N/A'}`}</Typography>
            {playerState && playerState[1].hand.map((card: any, cardIndex: number) => (
              <Card key={cardIndex}>
                <Typography>{`${card.value}${card.suit[0]}`}</Typography>
              </Card>
            ))}
          </PlayerPosition>
        );
      })}
      <CommunityCards>
        {gameState.communityCards.map((card: any, index: number) => (
          <Card key={index}>
            <Typography>{`${card.value}${card.suit[0]}`}</Typography>
          </Card>
        ))}
      </CommunityCards>
      <Box position="absolute" bottom={16} left={16}>
        <Typography variant="h6" color="secondary">{`Pot: ${gameState.pot}`}</Typography>
      </Box>
    </TableContainer>
  );
};

export default PokerTable;
