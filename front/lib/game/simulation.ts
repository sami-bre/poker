import { applyMove, getPossibleMoves } from './game';
import { State } from './game_state';
import * as readline from 'readline-sync';

const state = State.gameInitializedState();



console.log("initial state", state)
console.log("Available moves for player", state.activePlayerIndex, ":", getPossibleMoves(state));

var input = readline.question('Enter move: ');

while(input !== "quit"){
    console.log(applyMove(state, input));
    console.log("Available moves for player", state.activePlayerIndex, ":", getPossibleMoves(state));
    input = readline.question('Enter move: ');
}