import sqlite3
from typing import List, Optional
from datetime import datetime
from ..domain.models import Hand

class HandRepository:
    def __init__(self, db_path="poker.db"):
        self.db_path = db_path
        
    def get_connection(self):
        return sqlite3.connect(self.db_path)
        
    def init_tables(self):
        with self.get_connection() as conn:
            cur = conn.cursor()
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
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO hands (
                    id, timestamp, player_count, dealer_position, 
                    initial_stack_size, hands, board, actions, winnings
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                hand.id, 
                hand.timestamp.isoformat(),
                hand.player_count,
                hand.dealer_position,
                hand.initial_stack_size,
                hand.hands,
                hand.board,
                hand.actions,
                hand.winnings
            ))
            conn.commit()
        return hand
        
    def get_hand(self, hand_id: str) -> Optional[Hand]:
        with self.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, timestamp, player_count, dealer_position, 
                       initial_stack_size, hands, board, actions, winnings
                FROM hands WHERE id = ?
            """, (hand_id,))
            hand_row = cur.fetchone()
            
            if not hand_row:
                return None
                
            return Hand(
                id=hand_row[0],
                timestamp=datetime.fromisoformat(hand_row[1]),
                player_count=hand_row[2],
                dealer_position=hand_row[3],
                initial_stack_size=hand_row[4],
                hands=hand_row[5],
                board=hand_row[6],
                actions=hand_row[7],
                winnings=hand_row[8]
            )
        
    def get_hands(self) -> List[Hand]:
        with self.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, timestamp, player_count, dealer_position, 
                       initial_stack_size, hands, board, actions, winnings
                FROM hands
            """)
            return [
                Hand(
                    id=row[0],
                    timestamp=datetime.fromisoformat(row[1]),
                    player_count=row[2],
                    dealer_position=row[3],
                    initial_stack_size=row[4],
                    hands=row[5],
                    board=row[6],
                    actions=row[7],
                    winnings=row[8]
                )
                for row in cur.fetchall()
            ]