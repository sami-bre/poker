"use client"

import { useState, useEffect } from "react"
import { State } from "@/lib/game/game_state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getPossibleMoves, applyMove } from "@/lib/game/game"
import { MoveLog } from "@/components/poker/move_log"

export default function Home() {
  const [gameState, setGameState] = useState<State | null>(null)
  const [betAmount, setBetAmount] = useState(40)
  const [raiseAmount, setRaiseAmount] = useState(40)
  const [stackSize, setStackSize] = useState(2000)
  const [dealerPosition, setDealerPosition] = useState(5) // last index

  useEffect(() => {
    setGameState(State.gameInitializedState(6, stackSize, dealerPosition))
  }, [])

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
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg bg-muted">
                  <p className="font-mono text-xs">Hand #{`39b5999a-cdc1-4469-947e-649d30ae6158`}</p>
                  <p>Stack 10000; Dealer: Player 3; Plater 4 Small blind; Player 6</p>
                  <p>Hands: Player 1: Tc2c; Player 2: 5d4c; Player 3: Ah4s; Player 4: QcTd</p>
                  <p>Actions: f:f:f:r300:c:f 3hKdQs x:b100:c Ac x:x Th b80:r160:c</p>
                  <p>Winnings: Player 1: -40; Player 2: 0; Player 3: -560; Player 4: +600</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
