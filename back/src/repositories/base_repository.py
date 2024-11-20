from abc import ABC, abstractmethod
from typing import List, Optional

from ..domain.models import Hand


class BaseHandRepository(ABC):
    @abstractmethod
    def save_hand(self, hand: Hand) -> Hand:
        """Save a hand and return the saved hand"""
        pass

    @abstractmethod
    def get_hand(self, hand_id: str) -> Optional[Hand]:
        """Get a hand by its ID"""
        pass

    @abstractmethod
    def get_hands(self) -> List[Hand]:
        """Get all hands"""
        pass

    @abstractmethod
    def init_tables(self) -> None:
        """Initialize any necessary database tables"""
        pass 