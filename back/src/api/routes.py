import os
from fastapi import APIRouter, Depends, HTTPException

from ..domain.models import Hand
from ..repositories.base_repository import BaseHandRepository
from ..repositories.postgres_repository import PostgresHandRepository
from ..services.poker_service import PokerService

router = APIRouter()


def get_repository() -> BaseHandRepository:
    database_url = os.getenv('DATABASE_URL', 'postgresql://poker:poker@db:5432/poker')
    repo = PostgresHandRepository(database_url)
    repo.init_tables()
    return repo


@router.post("/hands", response_model=Hand)
async def create_hand(
    hand: Hand,
    repo: BaseHandRepository = Depends(get_repository),
    poker_service: PokerService = Depends(lambda: PokerService()),
):
    try:
        hand.winnings = poker_service.calculate_winnings(hand)
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error calculating winnings: {str(e)}"
        )

    return repo.save_hand(hand)


@router.get("/hands", response_model=list[Hand])
async def get_hands(repo: BaseHandRepository = Depends(get_repository)):
    return repo.get_hands()


@router.get("/hands/{hand_id}", response_model=Hand)
async def get_hand(
    hand_id: str,
    repo: BaseHandRepository = Depends(get_repository),
):
    hand = repo.get_hand(hand_id)
    if not hand:
        raise HTTPException(status_code=404, detail="Hand not found")
    return hand
