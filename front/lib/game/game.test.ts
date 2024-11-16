import { getPossibleMoves, applyMove } from './game';
import { State } from './game_state';
import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Poker Game', () => {
    let state: State;
    let player_count = 5;

    beforeEach(() => {
        state = State.gameInitializedState(player_count); // Fresh state before each test
    });

    test('initial state should be properly set up', () => {
        expect(state.playerCount).toBe(player_count);
        expect(state.activePlayerIndex).toBe(2);  // First to act after blinds
        expect(state.roundNumber).toBe(0);
        expect(state.roundPot).toBe(60);  // SB + BB
        expect(state.board).toHaveLength(0);
        expect(state.hole).toHaveLength(player_count); 
        expect(state.foldedPlayerIndices).toHaveLength(0);
        expect(state.playerHasMoved.every(moved => moved === false)).toBeTruthy();
        expect(state.roundContributions[0]).toBe(20);
        expect(state.roundContributions[1]).toBe(40);
    });

    test('playthrough 1', () => {
        var cfr = new Set(["c", "f", "r"])
        var cfrx = new Set(["c", "f", "r", "x"])
        expect(new Set(getPossibleMoves(state))).toEqual(cfr);
        state = applyMove(state, "c");  // Player 2 calls
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "f");  // Player 3 folds
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "c");  // Player 4 calls
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "c");  // Player 0 calls
        expect(new Set(getPossibleMoves(state))).toEqual(cfrx)
        state = applyMove(state, "x");  // Player 1 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["m"]))
        state = applyMove(state, "m");  // Deal flop
        expect(state.board).toHaveLength(3)
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x");  // Player 0 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x");  // Player 1 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x");  // Player 2 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "b80");  // Player 4 bets
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "f");  // player 0 folds
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "r120")    // player 1 raised
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "c")   // player 2 called
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "f")   // player 4 folds
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["n"]))
        state = applyMove(state, "n")
        expect(state.board).toHaveLength(4)
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x")   // player 1 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "b40")   // player 2 bets
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(cfr))
        state = applyMove(state, "f")   // player 2 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["z"]))
        state = applyMove(state, "z")
    });

    test("playthrough 2", () => {
        var cfr = new Set(["c", "f", "r"])
        var cfrx = new Set(["c", "f", "r", "x"])
        expect(new Set(getPossibleMoves(state))).toEqual(cfr);
        state = applyMove(state, "c");  // Player 2 calls
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "f");  // Player 3 folds
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "c");  // Player 4 calls
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "c");  // Player 0 calls
        expect(new Set(getPossibleMoves(state))).toEqual(cfrx)
        state = applyMove(state, "x");  // Player 1 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["m"]))
        state = applyMove(state, "m");  // Deal flop
        expect(state.board).toHaveLength(3)
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x");  // Player 0 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x");  // Player 1 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x");  // Player 2 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "b80");  // Player 4 bets
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "f");  // player 0 folds
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "r120")    // player 1 raised
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "c")   // player 2 called
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "f")   // player 4 folds
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["n"]))
        state = applyMove(state, "n")
        expect(state.board).toHaveLength(4)
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x")   // player 1 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "f")   // player 2 folds
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["z"]))
    })

    test("playthrough 3", () => {
        var cfr = new Set(["c", "f", "r"])
        var cfrx = new Set(["c", "f", "r", "x"])
        expect(new Set(getPossibleMoves(state))).toEqual(cfr);
        state = applyMove(state, "c");  // Player 2 calls
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "f");  // Player 3 folds
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "c");  // Player 4 calls
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "c");  // Player 0 calls
        expect(new Set(getPossibleMoves(state))).toEqual(cfrx)
        state = applyMove(state, "x");  // Player 1 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["m"]))
        state = applyMove(state, "m");  // Deal flop
        expect(state.board).toHaveLength(3)
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x");  // Player 0 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x");  // Player 1 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x");  // Player 2 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "b80");  // Player 4 bets
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "f");  // player 0 folds
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "r120")    // player 1 raised
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "c")   // player 2 called
        expect(new Set(getPossibleMoves(state))).toEqual(cfr)
        state = applyMove(state, "f")   // player 4 folds
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["n"]))
        state = applyMove(state, "n")
        expect(state.board).toHaveLength(4)
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "b100")   // player 1 bets
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(cfr))
        state = applyMove(state, "c")   // player 2 calls
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["o"]))
        state = applyMove(state, "o")
        expect(state.board).toHaveLength(5)
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x")   // player 1 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["b", "x", "f"]))
        state = applyMove(state, "x")   // player 2 checks
        expect(new Set(getPossibleMoves(state))).toEqual(new Set(["z"]))
    })
}); 
