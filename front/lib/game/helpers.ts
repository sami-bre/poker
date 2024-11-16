import { State } from "./game_state";

/**
 * Gets the next non-folded player index including the given start index
 */
export function nextNonFoldedPlayerIndex(state: State, startIndex: number): number {
    let index = startIndex;
    index = index % state.stack.length;
    while (state.foldedPlayerIndices.includes(index)) {
        index = (index + 1) % state.stack.length;
    }
    return index;
}

export function allPlayersMoved(state: State): boolean {
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

export function allRoundContributionsZero(state: State): boolean {
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
