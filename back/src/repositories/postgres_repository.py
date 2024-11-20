from datetime import datetime
from typing import List, Optional
import psycopg2
from psycopg2.extras import DictCursor

from ..domain.models import Hand
from .base_repository import BaseHandRepository


class PostgresHandRepository(BaseHandRepository):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string

    def get_connection(self):
        return psycopg2.connect(self.connection_string)

    def init_tables(self) -> None:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS hands (
                        id TEXT PRIMARY KEY,
                        timestamp TIMESTAMP,
                        player_count INTEGER,
                        dealer_position INTEGER,
                        initial_stack_size INTEGER,
                        hands TEXT,
                        board TEXT,
                        actions TEXT,
                        winnings TEXT
                    )
                """)
                conn.commit()

    def save_hand(self, hand: Hand) -> Hand:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO hands (
                        id, timestamp, player_count, dealer_position,
                        initial_stack_size, hands, board, actions, winnings
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    hand.id,
                    hand.timestamp,
                    hand.player_count,
                    hand.dealer_position,
                    hand.initial_stack_size,
                    hand.hole,
                    hand.board,
                    hand.actions,
                    hand.winnings,
                ))
                conn.commit()
        return hand

    def get_hand(self, hand_id: str) -> Optional[Hand]:
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=DictCursor) as cur:
                cur.execute("""
                    SELECT * FROM hands WHERE id = %s
                """, (hand_id,))
                row = cur.fetchone()
                
                if not row:
                    return None

                return Hand(
                    id=row['id'],
                    timestamp=row['timestamp'],
                    player_count=row['player_count'],
                    dealer_position=row['dealer_position'],
                    initial_stack_size=row['initial_stack_size'],
                    hole=row['hands'],
                    board=row['board'],
                    actions=row['actions'],
                    winnings=row['winnings'],
                )

    def get_hands(self) -> List[Hand]:
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=DictCursor) as cur:
                cur.execute("SELECT * FROM hands")
                return [
                    Hand(
                        id=row['id'],
                        timestamp=row['timestamp'],
                        player_count=row['player_count'],
                        dealer_position=row['dealer_position'],
                        initial_stack_size=row['initial_stack_size'],
                        hole=row['hands'],
                        board=row['board'],
                        actions=row['actions'],
                        winnings=row['winnings'],
                    )
                    for row in cur.fetchall()
                ] 