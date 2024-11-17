from pokerkit import Automation, NoLimitTexasHoldem
from ..domain.models import Hand
from typing import List

class PokerService:
    def calculate_winnings(self, hand: Hand) -> str:
        state = NoLimitTexasHoldem.create_state(
            (
                Automation.ANTE_POSTING,
                Automation.BET_COLLECTION,
                Automation.BLIND_OR_STRADDLE_POSTING,
                Automation.HOLE_CARDS_SHOWING_OR_MUCKING,
                Automation.HAND_KILLING,
                Automation.CHIPS_PUSHING,
                Automation.CHIPS_PULLING,
            ),
            True,
            0,  # No antes
            (20, 40),  # Small blind, big blind
            40,  # Min-bet
            tuple([hand.initial_stack_size] * hand.player_count),
            hand.player_count
        )
        
        # Deal hole cards
        hands = eval(hand.hands)  # Convert string representation to list
        for hole_cards in hands:
            state.deal_hole("".join(hole_cards))
            
        # Process actions
        for action in hand.actions.split(":"):
            action_type = action[0]
            if action_type == 'f':
                state.fold()
            elif action_type == 'c':
                state.check_or_call()
            elif action_type in ['r', 'b']:
                amount = int(action[1:])
                state.complete_bet_or_raise_to(amount)
            elif action_type == 'm':
                # deal flop
                board_cards = eval(hand.board)
                for i in range(3):
                    state.deal_board(board_cards[i])
            elif action_type == 'n':
                # deal turn
                state.deal_board(eval(hand.board)[3])
            elif action_type == 'r':
                # deal river
                state.deal_board(eval(hand.board)[4])
                
                
        # Format winnings as semi-colon-separated string: "player_id:amount;player_id:amount;..."
        winnings = []
        for i, final_stack in enumerate(state.stacks):
            amount = final_stack - hand.initial_stack_size
            winnings.append(f"{i}:{amount}")
            
        return ";".join(winnings) 