from dataclasses import field
from datetime import datetime
from pydantic.dataclasses import dataclass
from typing import Optional
import uuid

@dataclass
class Hand:
    player_count: int
    dealer_position: int
    initial_stack_size: int
    hands: str
    board: str
    actions: str
    id: Optional[str] = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: Optional[datetime] = field(default_factory=datetime.now)
    winnings: Optional[str] = field(default="")
    