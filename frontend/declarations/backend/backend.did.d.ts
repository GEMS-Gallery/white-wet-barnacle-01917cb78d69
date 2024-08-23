import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Card { 'value' : bigint, 'suit' : string }
export type CommunityCards = Array<Card>;
export interface GameState {
  'pot' : bigint,
  'playerStates' : Array<[PlayerId, PlayerState]>,
  'currentPlayer' : bigint,
  'deck' : Array<Card>,
  'communityCards' : CommunityCards,
  'stage' : string,
  'players' : Array<PlayerId>,
}
export type Hand = Array<Card>;
export type PlayerId = Principal;
export interface PlayerState {
  'bet' : bigint,
  'hand' : Hand,
  'chips' : bigint,
  'folded' : boolean,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : GameState } |
  { 'err' : string };
export type Result_2 = { 'ok' : bigint } |
  { 'err' : string };
export interface _SERVICE {
  'createGame' : ActorMethod<[], Result_2>,
  'fold' : ActorMethod<[], Result>,
  'getGameState' : ActorMethod<[], Result_1>,
  'joinGame' : ActorMethod<[bigint], Result>,
  'placeBet' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
