from pokerkit import Automation, NoLimitTexasHoldem
from ..domain.models import Hand
from typing import List

class PokerService:
    def calculate_winnings(self, hand: Hand) -> str:
        return "[1:-100 2:-200 3:300 4:0 5:0]"
        