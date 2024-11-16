

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


export var starter_deck: string[] = [
    "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "Tc", "Jc", "Qc", "Kc", "Ac",
    "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "Td", "Jd", "Qd", "Kd", "Ad",
    "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "Th", "Jh", "Qh", "Kh", "Ah",
    "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "Ts", "Js", "Qs", "Ks", "As",
];


export class State {
    public static readonly smallBlind = 20;
    public static readonly bigBlind = 40;
    public static readonly stackSize = 2000;
    public playerCount: number;
    public totalPot: number;
    public roundPot: number;
    public board: string[];
    public hole: string[][];
    public deck: string[];
    public nextCardIndex: number;
    public activePlayerIndex: number;   // the one who's going to make a move
    public roundNumber: number;
    public stack: number[];
    public roundContributions: number[];
    public playerHasMoved: boolean[];
    public foldedPlayerIndices: number[];

    constructor({
        activePlayerIndex,
        roundNumber,
        stack,
        roundContributions,
        playerHasMoved,
        foldedPlayerIndices,
        totalPot,
        roundPot,
        board,
        hole,
        deck,
        nextCardIndex,
        playerCount = 6
    }: {
        activePlayerIndex: number;
        roundNumber: number;
        stack: number[];
        roundContributions: number[];
        playerHasMoved: boolean[];
        foldedPlayerIndices: number[];
        totalPot: number;
        roundPot: number;
        board: string[];
        hole: string[][];
        deck: string[];
        nextCardIndex: number;
        playerCount?: number;
    }) {
        this.activePlayerIndex = activePlayerIndex;
        this.roundNumber = roundNumber;
        this.stack = stack;
        this.roundContributions = roundContributions;
        this.playerHasMoved = playerHasMoved;
        this.foldedPlayerIndices = foldedPlayerIndices;
        this.totalPot = totalPot;
        this.roundPot = roundPot;
        this.board = board;
        this.hole = hole;
        this.deck = deck;
        this.nextCardIndex = nextCardIndex;
        this.playerCount = playerCount;
    }

    static gameInitializedState(playerCount: number = 6): State {
         var state = new State({
            activePlayerIndex: 0,
            roundNumber: 0,
            stack: Array(playerCount).fill(State.stackSize),
            roundContributions: Array(playerCount).fill(0),
            playerHasMoved: Array(playerCount).fill(false),
            foldedPlayerIndices: [],
            totalPot: 0,
            roundPot: 0,
            board: [],
            hole: [],
            deck: starter_deck.slice().sort(() => Math.random() - 0.5),
            nextCardIndex: 0,
            playerCount: playerCount
        });
        
        state.roundPot = 60;
        state.stack[0] -= State.smallBlind;
        state.roundContributions[0] += State.smallBlind;
        state.stack[1] -= State.bigBlind;
        state.activePlayerIndex = 2;
        state.roundContributions[1] += State.bigBlind;
        for(let i = 0; i < playerCount; i++){
            state.hole.push([state.deck[++state.nextCardIndex], state.deck[++state.nextCardIndex]]);
        }
        return state;
    }
}

export function applyMove(state: State, move: string): State {
    var possibleMoves = getPossibleMoves(state);
    if(!possibleMoves.includes(move.charAt(0))){
        throw new Error("Invalid move: " + move);
    }
    console.log("------------------------ applying move", move);
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
            throw new Error("Not enough chips to bet " + amount);
        }
        state.stack[state.activePlayerIndex] -= amount;
        state.roundContributions[state.activePlayerIndex] += amount;
        state.roundPot += amount;
    } else if (command == "c"){
        const increment = highestBet - state.roundContributions[state.activePlayerIndex];
        if (state.stack[state.activePlayerIndex] < increment) {
            throw new Error("Player " + state.activePlayerIndex + " does not have enough chips to call " + highestBet);
        }
        state.stack[state.activePlayerIndex] -= increment;
        state.roundContributions[state.activePlayerIndex] += increment;
        state.roundPot += increment;
    } else if (command == "r"){
        const amount = parseInt(move.substring(1));
        const increment = amount - state.roundContributions[state.activePlayerIndex];
        if (state.stack[state.activePlayerIndex] < increment) {
            throw new Error("Player " + state.activePlayerIndex + " does not have enough chips to raise " + amount);
        }
        state.stack[state.activePlayerIndex] -= increment;
        state.roundContributions[state.activePlayerIndex] += increment;
        state.roundPot += increment;
    } else if (command == "f"){
        state.foldedPlayerIndices.push(state.activePlayerIndex);
    } else if (command == "x"){
        // nothing to do here
    }
    state.playerHasMoved[state.activePlayerIndex] = true;
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
            console.log("showdown", state);
            break;
    }
    state.activePlayerIndex = nextNonFoldedPlayerIndex(state, 0);
    return state;
}

export function getPossibleMoves(state: State): any[] {

    // check if showdown is available
    var canShowdown = state.roundNumber == 3 && allRoundContributionsEqual(state) && allPlayersMoved(state);
    canShowdown = canShowdown || state.foldedPlayerIndices.length == state.playerCount - 1;  // all but one player has folded
    if(canShowdown){
        return ['z'];
    }
    
    // check if deal flop is available
    const canDealFlop = state.roundNumber == 0 && allRoundContributionsEqual(state) && allPlayersMoved(state);
    if(canDealFlop){
        return ['m'];
    }

    // check if deal turn is available
    const canDealTurn = state.roundNumber == 1 && allRoundContributionsEqual(state) && allPlayersMoved(state);
    if(canDealTurn){
        return ['n'];
    }

    // check if deal river is available
    const canDealRiver = state.roundNumber == 2 && allRoundContributionsEqual(state) && allPlayersMoved(state);
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
    var canRaise = state.stack[state.activePlayerIndex] >= (State.bigBlind + highestBet - state.roundContributions[state.activePlayerIndex]);
    canRaise = canRaise && highestBet > 0;
    if(canRaise){
        moves.push('r')
    }
    // check if fold is available
    const canFold = true;   // can fold any time
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

/**
 * Gets the next non-folded player index including the given start index
 */
function nextNonFoldedPlayerIndex(state: State, startIndex: number): number {
    let index = startIndex;
    index = index % state.stack.length;
    while (state.foldedPlayerIndices.includes(index)) {
        index = (index + 1) % state.stack.length;
    }
    return index;
}

function allPlayersMoved(state: State): boolean {
    for (let i = 0; i < state.playerHasMoved.length; i++) {
        if (!state.playerHasMoved[i] && !state.foldedPlayerIndices.includes(i)) {
            return false;
        }
    }
    return true;
}

export function allRoundContributionsEqual(state: State): boolean {
    let firstContribution: number | null = null;
    
    for (let i = 0; i < state.roundContributions.length; i++) {
        // Skip folded players
        if (state.foldedPlayerIndices.includes(i)) {
            continue;
        }
        
        // Set first valid contribution as reference
        if (firstContribution === null) {
            firstContribution = state.roundContributions[i];
            continue;
        }
        
        // Compare with reference
        if (state.roundContributions[i] !== firstContribution) {
            return false;
        }
    }
    
    return true;
}

function allRoundContributionsZero(state: State): boolean {
    // Check if all non-folded players have zero contributions
    for (let i = 0; i < state.roundContributions.length; i++) {
        // Skip folded players
        if (state.foldedPlayerIndices.includes(i)) {
            continue;
        }
        // If any active player has non-zero contribution, return false
        if (state.roundContributions[i] !== 0) {
            return false;
        }
    }
    // All active players have zero contributions
    return true;
}




