import { State } from "./game_state";
import { nextNonFoldedPlayerIndex, allRoundContributionsEqual, allPlayersMoved, allRoundContributionsZero, stackZero } from "./helpers";


// command move representations
// b<amount> bet <amount>
// c call
// r<amount> raise <amount>
// f fold
// x check

// m deal flop
// n deal turn
// o deal river
// z showdown



export function applyMove(state: State, move: string): State {
    var possibleMoves = getPossibleMoves(state);
    if(!possibleMoves.includes(move.charAt(0))){
        throw new Error("Invalid move: " + move);
    }
    
    const command = move.charAt(0);

    if (["m", "n", "o", "z"].includes(command)) {
        return applyDealingMove(state, command);
    } else if(["b", "c", "r", "f", "x"].includes(command)){
        return applyPlayerMove(state, move);
    } else {
        throw new Error("Invalid move: " + move);
    }
}

function applyPlayerMove(state: State, move: string) {
    const command = move.charAt(0);
    const highestBet = Math.max(...state.roundContributions);
    if(command == "b"){
        const amount = parseInt(move.substring(1));
        if (state.stack[state.activePlayerIndex] < amount) {
            throw new Error("Not enough chips to bet");
        }
        if(amount < State.bigBlind){
            throw new Error("Bet amount should be at least big blind");
        }
        state.stack[state.activePlayerIndex] -= amount;
        state.roundContributions[state.activePlayerIndex] += amount;
        state.roundPot += amount;
        state.lastNetIncrement = amount;
    } else if (command == "c"){
        const increment = highestBet - state.roundContributions[state.activePlayerIndex];
        if (state.stack[state.activePlayerIndex] < increment) {
            throw new Error("Player does not have enough chips to call");
        }
        state.stack[state.activePlayerIndex] -= increment;
        state.roundContributions[state.activePlayerIndex] += increment;
        state.roundPot += increment;
    } else if (command == "r"){
        const amount = parseInt(move.substring(1));
        if(amount < highestBet + state.lastNetIncrement){
            throw new Error("Raise amount should be at least round bet + last net increment");
        }
        const increment = amount - state.roundContributions[state.activePlayerIndex];
        if (state.stack[state.activePlayerIndex] < increment) {
            throw new Error("Player does not have enough chips to raise");
        }
        state.stack[state.activePlayerIndex] -= increment;
        state.roundContributions[state.activePlayerIndex] += increment;
        state.roundPot += increment;
        state.lastNetIncrement = amount - highestBet;
    } else if (command == "f"){
        state.foldedPlayerIndices.push(state.activePlayerIndex);
    } else if (command == "x"){
        // nothing to do here
    }
    state.playerHasMoved[state.activePlayerIndex] = true;
    state.moveHistory.push([move, state.activePlayerIndex]);    // make sure to do this before updating the activePlayerIndex
    state.activePlayerIndex = nextNonFoldedPlayerIndex(state, (state.activePlayerIndex + 1) % state.playerCount);
    return state;
}

function applyDealingMove(state: State, command: string) {
    state.totalPot += state.roundPot;
    state.roundPot = 0;
    state.roundContributions = state.roundContributions.map(() => 0);

    switch (command) {
        case "m":
            state.board.push(state.deck[state.nextCardIndex++]);
            state.board.push(state.deck[state.nextCardIndex++]);
            state.board.push(state.deck[state.nextCardIndex++]);
            state.roundNumber = 1;
            state.playerHasMoved = state.playerHasMoved.map(() => false);
            break;
        case "n":
            state.board.push(state.deck[state.nextCardIndex++]);
            state.roundNumber = 2;
            state.playerHasMoved = state.playerHasMoved.map(() => false);
            break;
        case "o":
            state.board.push(state.deck[state.nextCardIndex++]);
            state.roundNumber = 3;
            state.playerHasMoved = state.playerHasMoved.map(() => false);
            break;
        case "z":
            // nothing to do here
            break;
    }
    state.moveHistory.push([command, -1]); // make sure to do this before updating the activePlayerIndex
    state.activePlayerIndex = nextNonFoldedPlayerIndex(state, (state.dealerIndex + 1) % state.playerCount);
    state.lastNetIncrement = 0;
    return state;
}

export function getPossibleMoves(state: State): any[] {

    // check if showdown is available
    var canShowdown = state.roundNumber == 3 && ((allRoundContributionsEqual(state) && allPlayersMoved(state)) || stackZero(state));
    canShowdown = canShowdown || state.foldedPlayerIndices.length == state.playerCount - 1;  // all but one player has folded
    if(canShowdown){
        return ['z'];
    }
    
    // check if deal flop is available
    const canDealFlop = state.roundNumber == 0 && ((allRoundContributionsEqual(state) && allPlayersMoved(state)) || stackZero(state));
    if(canDealFlop){
        return ['m'];
    }

    // check if deal turn is available
    const canDealTurn = state.roundNumber == 1 && ((allRoundContributionsEqual(state) && allPlayersMoved(state)) || stackZero(state));
    if(canDealTurn){
        return ['n'];
    }

    // check if deal river is available
    const canDealRiver = state.roundNumber == 2 && ((allRoundContributionsEqual(state) && allPlayersMoved(state)) || stackZero(state));
    if(canDealRiver){
        return ['o'];
    }


    // check if player has already folded
    if(state.foldedPlayerIndices.includes(state.activePlayerIndex)){
        return [];
    }

    var moves = []
    const highestBet = Math.max(...state.roundContributions);
    // check if bet is available:
    var canBet = allRoundContributionsZero(state);
    const hasPlayerMoved = state.playerHasMoved[state.activePlayerIndex];
    canBet = canBet && !hasPlayerMoved;
    if (canBet) {
        moves.push("b");
    }
    // check if call is avalilable
    var canCall = state.roundContributions[state.activePlayerIndex] <= highestBet;
    canCall = canCall && highestBet > 0;
    if(canCall){
        moves.push('c')
    }
    // check if raise is available
    var canRaise = state.stack[state.activePlayerIndex] >= (state.lastNetIncrement + highestBet - state.roundContributions[state.activePlayerIndex]);
    canRaise = canRaise && highestBet > 0;
    if(canRaise){
        moves.push('r')
    }
    // check if fold is available
    const canFold = highestBet > state.roundContributions[state.activePlayerIndex];
    if(canFold){
        moves.push('f')
    }
    // check if check is available
    var canCheck = allRoundContributionsEqual(state);
    canCheck = canCheck && !hasPlayerMoved;
    if(canCheck){
        moves.push('x')
    }
    
    return moves;
}





