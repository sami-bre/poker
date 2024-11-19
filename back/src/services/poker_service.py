from pokerkit import Automation, NoLimitTexasHoldem

from ..domain.models import Hand


class PokerService:
    def __init__(self):
        self.deck = [
            "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "Tc", "Jc", "Qc", "Kc", "Ac",
            "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "Td", "Jd", "Qd", "Kd", "Ad",
            "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "Th", "Jh", "Qh", "Kh", "Ah",
            "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "Ts", "Js", "Qs", "Ks", "As"
        ]

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
            ante_trimming_status=True,
            raw_antes=0,  # No antes
            raw_blinds_or_straddles=(20, 40),  # Small blind, big blind
            min_bet=40,  # Min-bet
            raw_starting_stacks=tuple([hand.initial_stack_size] * hand.player_count),
            player_count=hand.player_count,
            
        )

        hole = eval(hand.hole)  # Convert string representation to list
        board = eval(hand.board)

        used_cards = board.copy()
        for item in hole:
            used_cards.extend(item)

        # Deal hole cards
        
        for hole_cards in hole:
            state.deal_hole("".join(hole_cards))

        # Process actions
        actions = eval(hand.actions)  # Convert string representation to list

        for i in range(len(actions)):
            action_and_player = actions[i]
            action = action_and_player[0]
            action_type = action[0]
            if action_type == "f":
                state.fold()
            elif action_type in ["c", "x"]:
                state.check_or_call()
            elif action_type in ["r", "b"]:
                amount = int(action[1:])
                state.complete_bet_or_raise_to(amount)
            elif action_type == "m":
                # Burn a card before dealing flop
                state.burn_card(self.next_card_to_burn(used_cards))
                # deal flop
                for i in range(3):
                    state.deal_board(board[i])
            elif action_type == "n":
                state.burn_card(self.next_card_to_burn(used_cards))
                # deal turn
                state.deal_board(board[3])
            elif action_type == "o":
                state.burn_card(self.next_card_to_burn(used_cards))
                # deal river
                state.deal_board(board[4])

        # Format winnings as semi-colon-separated
        # string: "player_id:amount;player_id:amount;..."
        winnings = []
        for i, final_stack in enumerate(state.stacks):
            amount = final_stack - hand.initial_stack_size
            winnings.append(f"{i}:{amount}")

        # Calculate shift amount - when dealer is at last position (len-1), this gives 0
        shift_amount = (len(winnings) - 1 - hand.dealer_position) % len(winnings)
        # Rotate list left by shift amount
        winnings = winnings[shift_amount:] + winnings[:shift_amount]
        return ";".join(winnings)

        
    
    def next_card_to_burn(self, used_cards):
        for card in self.deck:
            if card not in used_cards:
                used_cards.append(card)
                return card
        raise Exception("No more cards to burn")
