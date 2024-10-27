import { type TerminalContext } from '../../domain/terminal-context'

export const startSnakeGame = async (
  setContext: (args: ((prev: TerminalContext) => TerminalContext) | TerminalContext) => void
): Promise<void> => {
  const BOARD_SIZE = 10
  const INITIAL_SNAKE = [{ x: 0, y: 0 }]
  const INITIAL_DIRECTION = 'RIGHT'

  setContext((prevContext) => ({
    ...prevContext,
    view: ['🐍 게임을 시작합니다!'],
    processContext: {
      bufferedView: prevContext.view,
      snake: INITIAL_SNAKE,
      direction: INITIAL_DIRECTION,
      food: generateFood(),
      gameOver: false,
      point: 0
    }
  }))

  function generateFood (): { x: number, y: number } {
    const x = Math.floor(Math.random() * BOARD_SIZE)
    const y = Math.floor(Math.random() * BOARD_SIZE)
    return { x, y }
  }

  const processGame = (processContext: any): any => {
    const newSnake = [...processContext.snake]
    const head = { ...newSnake[0] }

    switch (processContext.direction) {
      case 'UP':
        head.y -= 1
        break
      case 'DOWN':
        head.y += 1
        break
      case 'LEFT':
        head.x -= 1
        break
      case 'RIGHT':
        head.x += 1
        break
    }

    if (
      head.x < 0 ||
      head.x >= BOARD_SIZE ||
      head.y < 0 ||
      head.y >= BOARD_SIZE ||
      newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      return {
        ...processContext,
        gameOver: true
      }
    }

    if (head.x === processContext.food.x && head.y === processContext.food.y) {
      newSnake.unshift(head)
      return {
        ...processContext,
        snake: newSnake,
        point: processContext.point + 1,
        food: generateFood()
      }
    } else {
      newSnake.pop()
      newSnake.unshift(head)
      return { ...processContext, snake: newSnake }
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    setContext((prevContext) => {
      const newDirection = (() => {
        switch (e.key) {
          case 'ArrowUp':
            return prevContext.processContext.direction !== 'DOWN' ? 'UP' : prevContext.processContext.direction
          case 'ArrowDown':
            return prevContext.processContext.direction !== 'UP' ? 'DOWN' : prevContext.processContext.direction
          case 'ArrowLeft':
            return prevContext.processContext.direction !== 'RIGHT' ? 'LEFT' : prevContext.processContext.direction
          case 'ArrowRight':
            return prevContext.processContext.direction !== 'LEFT' ? 'RIGHT' : prevContext.processContext.direction
          default:
            return prevContext.processContext.direction
        }
      })()
      return {
        ...prevContext,
        processContext: {
          ...prevContext.processContext,
          direction: newDirection
        }
      }
    })
  }

  const exitGame = (e: KeyboardEvent): void => {
    if (e.ctrlKey && e.key === 'c') {
      clearInterval(intervalId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', exitGame)
      setContext((prevContext) => ({
        ...prevContext,
        view: prevContext.processContext.bufferedView.concat('게임 종료!'),
        processContext: null
      }))
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keydown', exitGame)
  const intervalId = setInterval(() => {
    setContext((prevContext) => {
      const updatedProcessContext = processGame(prevContext.processContext)

      if (updatedProcessContext.gameOver === true) {
        clearInterval(intervalId)
        window.removeEventListener('keydown', handleKeyDown)
        return {
          ...prevContext,
          view: prevContext.processContext.bufferedView.concat('게임 오버!, 점수: ' + prevContext.processContext.point),
          processContext: null
        }
      }

      const newView = Array.from({ length: BOARD_SIZE }, (_, y) => {
        return Array.from({ length: BOARD_SIZE }, (_, x) => {
          const isSnake = updatedProcessContext.snake.some((segment: any) => segment.x === x && segment.y === y)
          const isFood = updatedProcessContext.food.x === x && updatedProcessContext.food.y === y
          return isSnake === true ? '🐍' : isFood ? '🍎' : '⬜️'
        }).join('')
      })

      return {
        ...prevContext,
        view: ['현재 게임 상태:', ...newView],
        processContext: updatedProcessContext
      }
    })
  }, 300)
}
