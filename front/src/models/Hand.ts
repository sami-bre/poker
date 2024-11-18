import { State } from "@/lib/game/game_state";

export class Hand {
    player_count: number;
    dealer_position: number;
    initial_stack_size: number;
    hole: string;
    board: string;
    actions: string;
    id?: string;
    timestamp?: string;
    winnings: string;

    constructor(
        player_count: number,
        dealer_position: number,
        initial_stack_size: number,
        hole: string,
        board: string,
        actions: string,
        winnings: string = "",
        id?: string,
        timestamp?: string
    ) {
        this.player_count = player_count;
        this.dealer_position = dealer_position;
        this.initial_stack_size = initial_stack_size;
        this.hole = hole;
        this.board = board;
        this.actions = actions;
        this.winnings = winnings;
        this.id = id;
        this.timestamp = timestamp;
    }

    // Helper method to create Hand from game state
    static fromGameState(gameState: State): Hand {
        return new Hand(
            gameState.playerCount,
            gameState.dealerIndex,
            gameState.stackSize,
            JSON.stringify(gameState.hole),
            JSON.stringify(gameState.board),
            JSON.stringify(gameState.moveHistory),
        );
    }

    // Helper method to parse winnings string
    getPlayerWinnings(): number[] {
        if (!this.winnings) return [];
        return this.winnings.split(';').map(w => {
            const [_, amount] = w.split(':');
            return parseInt(amount);
        });
    }
} 