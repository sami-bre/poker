import { getPossibleMoves } from "@/lib/game/game";
import { State } from "@/lib/game/game_state"

interface MoveLogProps {
  gameState: State
}

export function MoveLog({ gameState }: MoveLogProps) {
  return (
    <div data-testid='move_log'>
      {gameState?.hole.map((cards, playerIndex) => (
        <p key={playerIndex}>
          Player {playerIndex + 1} is dealt {cards[0]}{cards[1]}
        </p>
      ))}
      {gameState && (<p className="font-bold">Player {(gameState.dealerIndex % gameState.playerCount) + 1} is dealer</p>)}
      {gameState && (<p>Player {((gameState.dealerIndex + 1) % gameState.playerCount) + 1} posts small blind - {State.smallBlind} chips</p>)}
      {gameState && (<p>Player {((gameState.dealerIndex + 2) % gameState.playerCount) + 1} posts big blind - {State.bigBlind} chips</p>)}

      {gameState?.moveHistory.map(([move, playerIndex], index) => {
        const command = move.charAt(0);
        let text = '';
        let dealerMove = ['m', 'n', 'o'].includes(command);

        if (command === 'c') {
          text = `Player ${playerIndex + 1} calls`;
        } else if (command === 'f') {
          text = `Player ${playerIndex + 1} folds`;
        } else if (command === 'r') {
          const amount = move.substring(1);
          text = `Player ${playerIndex + 1} raises to ${amount}`;
        } else if (command === 'x') {
          text = `Player ${playerIndex + 1} checks`;
        } else if (command === 'b') {
          const amount = move.substring(1);
          text = `Player ${playerIndex + 1} bets ${amount}`;
        } else if (command === 'm') {
          text = `Dealing flop: ${gameState.board.slice(0,3).join(' ')}`;
        } else if (command === 'n') {
          text = `Dealing turn: ${gameState.board[3]}`;
        } else if (command === 'o') {
          text = `Dealing river: ${gameState.board[4]}`;
        } else if (command === 'z') {
          text = 'Showdown';
        }

        return (
          <>
            <p className={dealerMove ? 'font-bold' : ''}>{text}</p>
            {dealerMove && <hr className="my-2" />}
          </>
        );
        
      })}

      {gameState && (
        <p className="mt-4 font-semibold">
          {getPossibleMoves(gameState).includes('z') ? 'Game end. See the winner in the hand history.' : `Waiting for Player ${gameState.activePlayerIndex + 1}...`}
        </p>
      )}
    </div>
  )
} 