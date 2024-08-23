import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor TexasHoldem {
  // Types
  type PlayerId = Principal;
  type Card = { suit : Text; value : Nat };
  type Hand = [Card];
  type CommunityCards = [Card];
  type PlayerState = {
    chips : Nat;
    hand : ?Hand;
    bet : Nat;
    folded : Bool;
  };
  type GameState = {
    players : [PlayerId];
    playerStates : [(PlayerId, PlayerState)];
    communityCards : CommunityCards;
    currentPlayer : Nat;
    pot : Nat;
    deck : [Card];
    stage : Text; // "preflop", "flop", "turn", "river", "showdown"
  };

  // Stable variables
  stable var gameId : Nat = 0;
  var games : [(Nat, GameState)] = [];

  // Mutable variables
  var currentGame : ?GameState = null;

  // Helper functions
  func createDeck() : [Card] {
    let suits = ["hearts", "diamonds", "clubs", "spades"];
    let values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11 = Jack, 12 = Queen, 13 = King, 14 = Ace
    Array.flatten(Array.map(suits, func (suit : Text) : [Card] {
      Array.map(values, func (value : Nat) : Card {
        { suit = suit; value = value }
      })
    }))
  };

  func shuffleDeck(deck : [Card]) : [Card] {
    let mutableDeck = Array.thaw<Card>(deck);
    let size = mutableDeck.size();
    for (i in Iter.range(0, size - 1)) {
      let j = i + Nat.abs(Time.now()) % (size - i);
      let temp = mutableDeck[i];
      mutableDeck[i] := mutableDeck[j];
      mutableDeck[j] := temp;
    };
    Array.freeze(mutableDeck)
  };

  func dealCards(deck : [Card], count : Nat) : ([Card], [Card]) {
    let dealtCards = Array.tabulate(count, func(i : Nat) : Card { deck[i] });
    let remainingDeck = Array.tabulate(deck.size() - count, func(i : Nat) : Card { deck[i + count] });
    (remainingDeck, dealtCards)
  };

  // Game logic functions
  public shared(msg) func createGame() : async Result.Result<Nat, Text> {
    let newGameId = gameId + 1;
    let newGame : GameState = {
      players = [msg.caller];
      playerStates = [(msg.caller, {
        chips = 1000; // Starting chips
        hand = null;
        bet = 0;
        folded = false;
      })];
      communityCards = [];
      currentPlayer = 0;
      pot = 0;
      deck = shuffleDeck(createDeck());
      stage = "preflop";
    };
    games := Array.append(games, [(newGameId, newGame)]);
    gameId := newGameId;
    currentGame := ?newGame;
    #ok(newGameId)
  };

  public shared(msg) func joinGame(id : Nat) : async Result.Result<(), Text> {
    switch (Array.find(games, func((gameId, _) : (Nat, GameState)) : Bool { gameId == id })) {
      case (?(_, game)) {
        if (game.players.size() >= 6) {
          return #err("Game is full");
        };
        if (Option.isSome(Array.find(game.players, func(p : PlayerId) : Bool { p == msg.caller }))) {
          return #err("You are already in this game");
        };
        let updatedPlayers = Array.append(game.players, [msg.caller]);
        let updatedPlayerStates = Array.append(game.playerStates, [(msg.caller, {
          chips = 1000; // Starting chips
          hand = null;
          bet = 0;
          folded = false;
        })]);
        let updatedGame = {
          players = updatedPlayers;
          playerStates = updatedPlayerStates;
          communityCards = game.communityCards;
          currentPlayer = game.currentPlayer;
          pot = game.pot;
          deck = game.deck;
          stage = game.stage;
        };
        games := Array.map<(Nat, GameState), (Nat, GameState)>(games, func((gameId, gameState)) {
          if (gameId == id) { (gameId, updatedGame) } else { (gameId, gameState) }
        });
        currentGame := ?updatedGame;
        #ok()
      };
      case null {
        #err("Game not found")
      };
    }
  };

  public shared(msg) func placeBet(amount : Nat) : async Result.Result<(), Text> {
    switch (currentGame) {
      case (?game) {
        if (game.players[game.currentPlayer] != msg.caller) {
          return #err("It's not your turn");
        };
        switch (Array.find(game.playerStates, func((id, _) : (PlayerId, PlayerState)) : Bool { id == msg.caller })) {
          case (?(_, playerState)) {
            if (playerState.chips < amount) {
              return #err("Not enough chips");
            };
            let updatedPlayerState = {
              chips = playerState.chips - amount;
              hand = playerState.hand;
              bet = playerState.bet + amount;
              folded = playerState.folded;
            };
            let updatedPlayerStates = Array.map<(PlayerId, PlayerState), (PlayerId, PlayerState)>(game.playerStates, func((id, state)) {
              if (id == msg.caller) { (id, updatedPlayerState) } else { (id, state) }
            });
            let updatedGame = {
              players = game.players;
              playerStates = updatedPlayerStates;
              communityCards = game.communityCards;
              currentPlayer = (game.currentPlayer + 1) % game.players.size();
              pot = game.pot + amount;
              deck = game.deck;
              stage = game.stage;
            };
            currentGame := ?updatedGame;
            #ok()
          };
          case null {
            #err("Player not found")
          };
        }
      };
      case null {
        #err("No active game")
      };
    }
  };

  public shared(msg) func fold() : async Result.Result<(), Text> {
    switch (currentGame) {
      case (?game) {
        if (game.players[game.currentPlayer] != msg.caller) {
          return #err("It's not your turn");
        };
        switch (Array.find(game.playerStates, func((id, _) : (PlayerId, PlayerState)) : Bool { id == msg.caller })) {
          case (?(_, playerState)) {
            let updatedPlayerState = {
              chips = playerState.chips;
              hand = playerState.hand;
              bet = playerState.bet;
              folded = true;
            };
            let updatedPlayerStates = Array.map<(PlayerId, PlayerState), (PlayerId, PlayerState)>(game.playerStates, func((id, state)) {
              if (id == msg.caller) { (id, updatedPlayerState) } else { (id, state) }
            });
            let updatedGame = {
              players = game.players;
              playerStates = updatedPlayerStates;
              communityCards = game.communityCards;
              currentPlayer = (game.currentPlayer + 1) % game.players.size();
              pot = game.pot;
              deck = game.deck;
              stage = game.stage;
            };
            currentGame := ?updatedGame;
            #ok()
          };
          case null {
            #err("Player not found")
          };
        }
      };
      case null {
        #err("No active game")
      };
    }
  };

  public query func getGameState() : async Result.Result<GameState, Text> {
    switch (currentGame) {
      case (?game) {
        #ok(game)
      };
      case null {
        #err("No active game")
      };
    }
  };

  // System functions
  system func preupgrade() {
    // No need to store games in stable storage for this example
  };

  system func postupgrade() {
    // No need to restore games from stable storage for this example
  };
}
