
export var starter_deck: string[] = [
    "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "Tc", "Jc", "Qc", "Kc", "Ac",
    "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "Td", "Jd", "Qd", "Kd", "Ad",
    "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "Th", "Jh", "Qh", "Kh", "Ah",
    "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "Ts", "Js", "Qs", "Ks", "As",
];


export class State {
    public static readonly smallBlind = 20;
    public static readonly bigBlind = 40;
    public stackSize = 2000;
    public playerCount: number;
    public totalPot: number;
    public roundPot: number;
    public lastNetIncrement: number;
    public board: string[];
    public hole: string[][];
    public deck: string[];
    public nextCardIndex: number;
    public dealerIndex: number;
    public activePlayerIndex: number;   // the one who's going to make a move
    public roundNumber: number;
    public stack: number[];
    public roundContributions: number[];
    public playerHasMoved: boolean[];
    public foldedPlayerIndices: number[];
    public moveHistory: [string, number][];

    constructor({
        stackSize,
        activePlayerIndex,
        roundNumber,
        stack,
        roundContributions,
        playerHasMoved,
        foldedPlayerIndices,
        totalPot,
        roundPot,
        lastNetRaise,
        board,
        hole,
        deck,
        nextCardIndex,
        dealerIndex,
        playerCount = 6,
        moveHistory,
    }: {
        stackSize: number;
        activePlayerIndex: number;
        roundNumber: number;
        stack: number[];
        roundContributions: number[];
        playerHasMoved: boolean[];
        foldedPlayerIndices: number[];
        totalPot: number;
        roundPot: number;
        lastNetRaise: number;
        board: string[];
        hole: string[][];
        deck: string[];
        nextCardIndex: number;
        dealerIndex: number;
        playerCount?: number;
        moveHistory?: [string, number][];
    }) {
        this.stackSize = stackSize;
        this.activePlayerIndex = activePlayerIndex;
        this.roundNumber = roundNumber;
        this.stack = stack;
        this.roundContributions = roundContributions;
        this.playerHasMoved = playerHasMoved;
        this.foldedPlayerIndices = foldedPlayerIndices;
        this.totalPot = totalPot;
        this.roundPot = roundPot;
        this.lastNetIncrement = lastNetRaise;
        this.board = board;
        this.hole = hole;
        this.deck = deck;
        this.nextCardIndex = nextCardIndex;
        this.dealerIndex = dealerIndex;
        this.playerCount = playerCount;
        this.moveHistory = moveHistory ?? [];
    }

    static gameInitializedState(playerCount: number = 6, stackSize: number = 2000, dealerIndex: number = -1): State {
         var state = new State({
            stackSize: stackSize,
            dealerIndex: dealerIndex == -1 ? playerCount - 1 : dealerIndex,
            activePlayerIndex: (dealerIndex + 1) % playerCount,
            roundNumber: 0,
            stack: Array(playerCount).fill(stackSize),
            roundContributions: Array(playerCount).fill(0),
            playerHasMoved: Array(playerCount).fill(false),
            foldedPlayerIndices: [],
            totalPot: 0,
            roundPot: 0,
            lastNetRaise: 0,
            board: [],
            hole: [],
            deck: starter_deck.slice().sort(() => Math.random() - 0.5),
            nextCardIndex: 0,
            playerCount: playerCount
        });
        
        state.roundPot = 60;
        state.stack[state.activePlayerIndex] -= State.smallBlind;
        state.roundContributions[(state.dealerIndex+1)%playerCount] += State.smallBlind;
        state.stack[(state.activePlayerIndex+1)%playerCount] -= State.bigBlind;
        state.roundContributions[(state.activePlayerIndex+1)%playerCount] += State.bigBlind;
        state.lastNetIncrement = State.bigBlind;
        state.activePlayerIndex = (state.activePlayerIndex + 2) % playerCount;
        for(let i = 0; i < playerCount; i++){
            state.hole.push([state.deck[++state.nextCardIndex], state.deck[++state.nextCardIndex]]);
        }
        return state;
    }

    copy(): State {
        return new State({
            stackSize: this.stackSize,
            dealerIndex: this.dealerIndex,
            activePlayerIndex: this.activePlayerIndex,
            roundNumber: this.roundNumber,
            stack: [...this.stack],
            roundContributions: [...this.roundContributions], 
            playerHasMoved: [...this.playerHasMoved],
            foldedPlayerIndices: [...this.foldedPlayerIndices],
            totalPot: this.totalPot,
            roundPot: this.roundPot,
            lastNetRaise: this.lastNetIncrement,
            board: [...this.board],
            hole: [...this.hole],
            deck: [...this.deck],
            nextCardIndex: this.nextCardIndex,
            playerCount: this.playerCount,
            moveHistory: [...this.moveHistory]
        });
    }
}