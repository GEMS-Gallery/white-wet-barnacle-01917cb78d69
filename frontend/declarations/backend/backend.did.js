export const idlFactory = ({ IDL }) => {
  const Result_2 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const PlayerId = IDL.Principal;
  const Card = IDL.Record({ 'value' : IDL.Nat, 'suit' : IDL.Text });
  const Hand = IDL.Vec(Card);
  const PlayerState = IDL.Record({
    'bet' : IDL.Nat,
    'hand' : Hand,
    'chips' : IDL.Nat,
    'folded' : IDL.Bool,
  });
  const CommunityCards = IDL.Vec(Card);
  const GameState = IDL.Record({
    'pot' : IDL.Nat,
    'playerStates' : IDL.Vec(IDL.Tuple(PlayerId, PlayerState)),
    'currentPlayer' : IDL.Nat,
    'deck' : IDL.Vec(Card),
    'communityCards' : CommunityCards,
    'stage' : IDL.Text,
    'players' : IDL.Vec(PlayerId),
  });
  const Result_1 = IDL.Variant({ 'ok' : GameState, 'err' : IDL.Text });
  return IDL.Service({
    'createGame' : IDL.Func([], [Result_2], []),
    'fold' : IDL.Func([], [Result], []),
    'getGameState' : IDL.Func([], [Result_1], ['query']),
    'joinGame' : IDL.Func([IDL.Nat], [Result], []),
    'placeBet' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
