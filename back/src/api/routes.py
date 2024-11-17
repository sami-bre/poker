from fastapi import APIRouter, Depends, HTTPException
from ..repositories.hand_repository import HandRepository
from ..services.poker_service import PokerService
from ..domain.models import Hand
from datetime import datetime
import uuid

router = APIRouter()

def get_repository():
    repo = HandRepository("poker.db")
    repo.init_tables()
    return repo

@router.post("/hands", response_model=Hand)
async def create_hand(
    hand: Hand,
    repo: HandRepository = Depends(get_repository),
    poker_service: PokerService = Depends(lambda: PokerService())
):
    # No need to set defaults - dataclass handles this
    # No need for explicit validation - Pydantic handles this
    hand.winnings = poker_service.calculate_winnings(hand)
    return repo.save_hand(hand)

@router.get("/hands", response_model=list[Hand])
async def get_hands(
    repo: HandRepository = Depends(get_repository)
):
    return repo.get_hands()

@router.get("/hands/{hand_id}", response_model=Hand)
async def get_hand(
    hand_id: str,
    repo: HandRepository = Depends(get_repository)
):
    hand = repo.get_hand(hand_id)
    if not hand:
        raise HTTPException(status_code=404, detail="Hand not found")
    return hand

