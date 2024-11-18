"use client"

import { useState, useEffect } from "react"
import { State } from "@/lib/game/game_state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getPossibleMoves, applyMove } from "@/lib/game/game"
import { MoveLog } from "@/components/poker/move_log"


import { Hand } from "@/src/models/Hand"
import { getHands, saveHand } from "@/src/services/api"

export default function Home() {
  const [gameState, setGameState] = useState<State | null>(null)
  const [betAmount, setBetAmount] = useState(40)
  const [raiseAmount, setRaiseAmount] = useState(40)
  const [stackSize, setStackSize] = useState(2000)
  const [dealerPosition, setDealerPosition] = useState(5) // last index
  const [hands, setHands] = useState<Hand[]>([])

  useEffect(() => {
    setGameState(State.gameInitializedState(6, stackSize, dealerPosition))
  }, [])

  useEffect(() => {
    loadHandHistory()
  }, [])

  const loadHandHistory = async () => {
    try {
      const handHistory = await getHands()
      setHands(handHistory)
    } catch (error) {
      console.error('Failed to load hand history:', error)
    }
  }

  const adjustBet = (amount: number) => {
    setBetAmount(Math.max(State.bigBlind, betAmount + amount))
  }

  const adjustRaise = (amount: number) => {
    setRaiseAmount(Math.max(State.bigBlind, raiseAmount + amount))
  }

  const possibleMoves = gameState ? getPossibleMoves(gameState) : []

  const handleMove = (move: string) => {
    if (!gameState) return
    try {
      const newState = applyMove(gameState, move)
      setGameState(newState.copy())
      const nextMoves = getPossibleMoves(newState)
      
      if (nextMoves.includes('z')) {
        setDealerPosition((prev) => (prev + 1) % gameState.playerCount)
        console.log()
        handleGameEnd()
      }
      
      if (['m', 'n', 'o'].some(move => nextMoves.includes(move))) {
        handleMove(nextMoves[0])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleReset = () => {
    if (gameState === null) {
      setGameState(State.gameInitializedState(6, stackSize, dealerPosition))
    } else {
      setGameState(null)
      setBetAmount(40)
      setRaiseAmount(40)
    }
  }

  const handleGameEnd = async () => {
    try {
      const newHand = Hand.fromGameState(gameState!)
      
      const savedHand = await saveHand(newHand)
      
      setHands(prevHands => [...prevHands, savedHand])
      
      handleReset()
    } catch (error) {
      console.error('Failed to save hand:', error)
    }
  }

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Playing Field Log Section */}
      <Card>
        <CardHeader>
          <CardTitle>Playing field log</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span>Stacks</span>
              <Input
                type="number"
                value={stackSize}
                onChange={(e) => setStackSize(Number(e.target.value))}
                className="w-24"
                disabled={gameState !== null}
              />
            </div>
            <Button variant={gameState === null ? "outline" : "destructive"} onClick={handleReset}>
              {gameState === null ? "Start" : "Reset"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-1 font-mono text-sm">
              {gameState && <MoveLog gameState={gameState} />}
            </div>
          </ScrollArea>
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                data-testid='fold_button'
                size="sm"
                disabled={!possibleMoves.includes('f')}
                onClick={() => handleMove('f')}
              >
                Fold
              </Button>
              <Button
                data-testid='check_button'
                size="sm"
                disabled={!possibleMoves.includes('x')}
                onClick={() => handleMove('x')}
              >
                Check
              </Button>
              <Button
                data-testid='call_button'
                size="sm"
                disabled={!possibleMoves.includes('c')}
                onClick={() => handleMove('c')}
              >
                Call
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => adjustBet(-40)}
                disabled={!possibleMoves.includes('b')}
              >
                -
              </Button>
              <Button
                data-testid='bet_button'
                size="sm"
                disabled={(() => {
                  var betPossible = possibleMoves.includes('b');
                  const requiredChips = betAmount;
                  return !betPossible || requiredChips > (gameState?.stack[gameState.activePlayerIndex] ?? 0);
                })()}
                onClick={() => handleMove(`b${betAmount}`)}
              >
                Bet {betAmount}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => adjustBet(40)}
                disabled={!possibleMoves.includes('b')}
              >
                +
              </Button>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustRaise(-40)}
                disabled={!possibleMoves.includes('r')}
              >
                -
              </Button>
              <Button
                data-testid='raise_button'
                size="sm"
                disabled={(() => {
                  var raisePossible = possibleMoves.includes('r')
                  // Check if raise amount is valid
                  const highestBet = Math.max(...(gameState?.roundContributions ?? []));
                  const requiredChips = raiseAmount - (gameState?.roundContributions[gameState.activePlayerIndex] ?? 0);
                  return !raisePossible || requiredChips > (gameState?.stack[gameState.activePlayerIndex] ?? 0) || raiseAmount < highestBet + 40;
                })()}
                onClick={() => handleMove(`r${raiseAmount}`)}
              >
                Raise to {raiseAmount}
              </Button>
              <Button
                data-testid='raise_button_plus'
                size="sm"
                variant="outline"
                onClick={() => adjustRaise(40)}
                disabled={!possibleMoves.includes('r')}
              >
                +
              </Button>
              <Button
                data-testid='allin_button'
                size="sm"
                variant="destructive"
                disabled={!(possibleMoves.includes('r') || possibleMoves.includes('b'))}
                onClick={() => {
                  if(possibleMoves.includes('r')){
                    handleMove(`r${gameState?.stack[gameState.activePlayerIndex] ?? 0}`)
                  } else {
                    handleMove(`b${gameState?.stack[gameState.activePlayerIndex] ?? 0}`)
                  }
                }}
              >
                ALLIN
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hand History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hand history</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4">
              {hands.map(hand => (
                <div key={hand.id} className="hand-entry">
                  <div>Time: {new Date(hand.timestamp!).toLocaleString()}</div>
                  <div>Players: {hand.player_count}</div>
                  <div>Dealer: Player {hand.dealer_position}</div>
                  <div>Stack Size: {hand.initial_stack_size}</div>
                  <div>Winnings: {hand.winnings}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
