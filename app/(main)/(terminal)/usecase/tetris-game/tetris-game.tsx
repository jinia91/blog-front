import { type TerminalContext } from '../../domain/terminal-context'

type Tetromino = number[][]
type Direction = 'LEFT' | 'RIGHT' | 'DOWN'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const INITIAL_SPEED = 800
const SPEED_INCREMENT = 50
const LINES_PER_LEVEL = 10

// 테트로미노 정의 (4가지 회전 상태)
const TETROMINOS: Record<string, Tetromino[]> = {
  I: [
    [[1, 1, 1, 1]],
    [[1], [1], [1], [1]]
  ],
  O: [
    [[1, 1], [1, 1]]
  ],
  T: [
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0], [1, 1], [1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[0, 1], [1, 1], [0, 1]]
  ],
  S: [
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0], [1, 1], [0, 1]]
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1], [1, 1], [1, 0]]
  ],
  J: [
    [[1, 0, 0], [1, 1, 1]],
    [[1, 1], [1, 0], [1, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[0, 1], [0, 1], [1, 1]]
  ],
  L: [
    [[0, 0, 1], [1, 1, 1]],
    [[1, 0], [1, 0], [1, 1]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1], [0, 1], [0, 1]]
  ]
}

const TETROMINO_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
const TETROMINO_COLORS = {
  I: '██',
  O: '▓▓',
  T: '▒▒',
  S: '░░',
  Z: '██',
  J: '▓▓',
  L: '▒▒'
}

interface GameState {
  board: number[][]
  currentPiece: {
    type: string
    rotation: number
    x: number
    y: number
  }
  nextPiece: string
  score: number
  level: number
  lines: number
  gameOver: boolean
  speed: number
}

export const startTetrisGame = async (
  setContext: (args: ((prev: TerminalContext) => TerminalContext) | TerminalContext) => void
): Promise<void> => {
  const createEmptyBoard = (): number[][] => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  }

  const getRandomPiece = (): string => {
    return TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)]
  }

  const initialNextPiece = getRandomPiece()
  const initialPieceType = getRandomPiece()

  setContext((prevContext): any => ({
    ...prevContext,
    view: ['🎮 TETRIS 게임을 시작합니다!', '', '조작: ← → 이동 | ↑ 회전 | ↓ 빠른 낙하 | Space 즉시 낙하 | Q 종료'],
    processContext: {
      bufferedView: prevContext.view,
      gameState: {
        board: createEmptyBoard(),
        currentPiece: {
          type: initialPieceType,
          rotation: 0,
          x: Math.floor(BOARD_WIDTH / 2) - 1,
          y: 0
        },
        nextPiece: initialNextPiece,
        score: 0,
        level: 1,
        lines: 0,
        gameOver: false,
        speed: INITIAL_SPEED
      }
    }
  }))

  const canMove = (
    board: number[][],
    piece: Tetromino,
    x: number,
    y: number
  ): boolean => {
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col] !== 0) {
          const newX = x + col
          const newY = y + row

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }

          if (newY >= 0 && board[newY][newX] !== 0) {
            return false
          }
        }
      }
    }
    return true
  }

  const mergePiece = (
    board: number[][],
    piece: Tetromino,
    x: number,
    y: number,
    pieceType: string
  ): number[][] => {
    const newBoard = board.map((row): number[] => [...row])
    const typeIndex = TETROMINO_TYPES.indexOf(pieceType) + 1

    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col] !== 0 && y + row >= 0) {
          newBoard[y + row][x + col] = typeIndex
        }
      }
    }
    return newBoard
  }

  const clearLines = (board: number[][]): { newBoard: number[][], linesCleared: number } => {
    let linesCleared = 0
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++
        return false
      }
      return true
    })

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0) as number[])
    }

    return { newBoard, linesCleared }
  }

  const calculateScore = (linesCleared: number, level: number): number => {
    const baseScores = [0, 100, 300, 500, 800]
    return baseScores[linesCleared] * level
  }

  const spawnNewPiece = (gameState: GameState): GameState => {
    const newPieceType = gameState.nextPiece
    const nextPiece = getRandomPiece()
    const piece = TETROMINOS[newPieceType][0]

    const startX = Math.floor(BOARD_WIDTH / 2) - Math.floor(piece[0].length / 2)
    const startY = 0

    if (!canMove(gameState.board, piece, startX, startY)) {
      return { ...gameState, gameOver: true }
    }

    return {
      ...gameState,
      currentPiece: {
        type: newPieceType,
        rotation: 0,
        x: startX,
        y: startY
      },
      nextPiece
    }
  }

  const movePiece = (gameState: GameState, direction: Direction): GameState => {
    const { currentPiece } = gameState
    const piece = TETROMINOS[currentPiece.type][currentPiece.rotation]

    let newX = currentPiece.x
    let newY = currentPiece.y

    switch (direction) {
      case 'LEFT':
        newX -= 1
        break
      case 'RIGHT':
        newX += 1
        break
      case 'DOWN':
        newY += 1
        break
    }

    if (canMove(gameState.board, piece, newX, newY)) {
      return {
        ...gameState,
        currentPiece: { ...currentPiece, x: newX, y: newY }
      }
    }

    // 아래로 이동 불가능한 경우 피스를 고정
    if (direction === 'DOWN') {
      const mergedBoard = mergePiece(gameState.board, piece, currentPiece.x, currentPiece.y, currentPiece.type)
      const { newBoard, linesCleared } = clearLines(mergedBoard)
      const scoreGain = calculateScore(linesCleared, gameState.level)
      const newLines = gameState.lines + linesCleared
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1
      const newSpeed = Math.max(100, INITIAL_SPEED - (newLevel - 1) * SPEED_INCREMENT)

      const newGameState = {
        ...gameState,
        board: newBoard,
        score: gameState.score + scoreGain,
        lines: newLines,
        level: newLevel,
        speed: newSpeed
      }

      return spawnNewPiece(newGameState)
    }

    return gameState
  }

  const rotatePiece = (gameState: GameState): GameState => {
    const { currentPiece } = gameState
    const rotations = TETROMINOS[currentPiece.type]
    const newRotation = (currentPiece.rotation + 1) % rotations.length
    const rotatedPiece = rotations[newRotation]

    if (canMove(gameState.board, rotatedPiece, currentPiece.x, currentPiece.y)) {
      return {
        ...gameState,
        currentPiece: { ...currentPiece, rotation: newRotation }
      }
    }

    return gameState
  }

  const dropPiece = (gameState: GameState): GameState => {
    let state = gameState
    const piece = TETROMINOS[state.currentPiece.type][state.currentPiece.rotation]

    while (canMove(state.board, piece, state.currentPiece.x, state.currentPiece.y + 1)) {
      state = {
        ...state,
        currentPiece: { ...state.currentPiece, y: state.currentPiece.y + 1 }
      }
    }

    // 즉시 고정
    return movePiece(state, 'DOWN')
  }

  const renderGame = (gameState: GameState): string[] => {
    const { board, currentPiece, nextPiece, score, level, lines } = gameState
    const displayBoard = board.map(row => [...row])

    // 현재 피스를 임시 보드에 그리기
    const piece = TETROMINOS[currentPiece.type][currentPiece.rotation]
    const typeIndex = TETROMINO_TYPES.indexOf(currentPiece.type) + 1

    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (piece[row][col] !== 0) {
          const y = currentPiece.y + row
          const x = currentPiece.x + col
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            displayBoard[y][x] = typeIndex
          }
        }
      }
    }

    const output: string[] = []
    output.push('┌────────────────────┬──────────────┐')

    // 게임 보드 렌더링
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      let row = '│'
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cellValue = displayBoard[y][x]
        if (cellValue === 0) {
          row += '  '
        } else {
          const type = TETROMINO_TYPES[cellValue - 1]
          row += TETROMINO_COLORS[type as keyof typeof TETROMINO_COLORS]
        }
      }

      // 사이드 정보
      if (y === 0) {
        row += '│  TETRIS      │'
      } else if (y === 2) {
        row += `│  Score:${score.toString().padStart(5, ' ')} │`
      } else if (y === 3) {
        row += `│  Level:${level.toString().padStart(5, ' ')} │`
      } else if (y === 4) {
        row += `│  Lines:${lines.toString().padStart(5, ' ')} │`
      } else if (y === 6) {
        row += '│  Next:       │'
      } else if (y === 7 || y === 8) {
        const nextRotations = TETROMINOS[nextPiece]
        const nextShape = nextRotations[0]
        const nextColor = TETROMINO_COLORS[nextPiece as keyof typeof TETROMINO_COLORS]

        if (y - 7 < nextShape.length) {
          const shapeRow = nextShape[y - 7]
          let preview = '│  '
          for (let i = 0; i < 4; i++) {
            if (i < shapeRow.length && shapeRow[i] === 1) {
              preview += nextColor
            } else {
              preview += '  '
            }
          }
          preview += '    │'
          row += preview
        } else {
          row += '│              │'
        }
      } else {
        row += '│              │'
      }

      output.push(row)
    }

    output.push('└────────────────────┴──────────────┘')
    output.push('')
    output.push('조작: ← → 이동 | ↑ 회전 | ↓ 빠른 낙하 | Space 즉시 낙하 | Q 종료')

    return output
  }

  let intervalId: NodeJS.Timeout | null = null

  const startGameLoop = (speed: number): void => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }

    intervalId = setInterval(() => {
      setContext((prevContext) => {
        if (prevContext.processContext?.gameState?.gameOver === true) {
          return prevContext
        }

        const updatedGameState = movePiece(prevContext.processContext.gameState as GameState, 'DOWN')

        if (updatedGameState.gameOver) {
          if (intervalId !== null) {
            clearInterval(intervalId)
          }
          window.removeEventListener('keydown', handleKeyDown)
          window.removeEventListener('keydown', exitGameKeyDown)
          return {
            ...prevContext,
            view: prevContext.processContext.bufferedView.concat([
              '',
              '🎮 게임 오버!',
              `최종 점수: ${updatedGameState.score}`,
              `레벨: ${updatedGameState.level}`,
              `라인: ${updatedGameState.lines}`
            ]),
            processContext: null
          }
        }

        // 레벨업 시 속도 조정
        if (updatedGameState.speed !== prevContext.processContext.gameState.speed) {
          startGameLoop(updatedGameState.speed)
        }

        return {
          ...prevContext,
          view: renderGame(updatedGameState),
          processContext: {
            ...prevContext.processContext,
            gameState: updatedGameState
          }
        }
      })
    }, speed)
  }

  const handleKeyDown = (e: KeyboardEvent): void => {
    setContext((prevContext) => {
      if (prevContext.processContext?.gameState?.gameOver === true) {
        return prevContext
      }

      let updatedGameState: GameState = prevContext.processContext.gameState

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          updatedGameState = movePiece(updatedGameState, 'LEFT')
          break
        case 'ArrowRight':
          e.preventDefault()
          updatedGameState = movePiece(updatedGameState, 'RIGHT')
          break
        case 'ArrowDown':
          e.preventDefault()
          updatedGameState = movePiece(updatedGameState, 'DOWN')
          break
        case 'ArrowUp':
          e.preventDefault()
          updatedGameState = rotatePiece(updatedGameState)
          break
        case ' ':
          e.preventDefault()
          updatedGameState = dropPiece(updatedGameState)
          break
        default:
          return prevContext
      }

      return {
        ...prevContext,
        view: renderGame(updatedGameState),
        processContext: {
          ...prevContext.processContext,
          gameState: updatedGameState
        }
      }
    })
  }

  const exitGameKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
      if (intervalId !== null) {
        clearInterval(intervalId)
      }
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', exitGameKeyDown)
      setContext((prevContext) => ({
        ...prevContext,
        view: prevContext.processContext.bufferedView.concat(['', '🎮 게임 종료!']),
        processContext: null
      }))
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keydown', exitGameKeyDown)
  startGameLoop(INITIAL_SPEED)
}
