import { useEffect, useReducer, useState } from "react";
import styled from "styled-components";
import { Board } from "./Board";
import { SquareType, SquareTypes } from "./Square";
import { nextPlayer, IPlayer, Player } from "./Player";


export const initSquares = (): SquareType[][] => {
    const squares: SquareType[][] = [];
    for (let i = 0; i < 8; i++) {
        squares[i] = [];
        for (let j = 0; j < 8; j++) {
            squares[i][j] = SquareType.Undef;
        }
    }

    squares[3][3] = SquareType.White;
    squares[3][4] = SquareType.Black;
    squares[4][3] = SquareType.Black;
    squares[4][4] = SquareType.White;

    return squares;
};

const isWithinBoard = (x: number, y: number) : boolean => {
    if (y < 0 || y >= 8) return false;
    if (x < 0 || x >= 8) return false;
    return true;
}

const getCountFlips = (
    squares: SquareTypes,
    player: IPlayer,
    x: number,
    y: number,
    dx: number,
    dy: number,
): number => {
    let i = 1;
    while (1) {
      const _y = y + i * dy;
      const _x = x + i * dx;
      if (!isWithinBoard(_x, _y)) break;
      if (!(squares[_y][_x] === nextPlayer(player).squareType)) break;
      i++;
    }
  
    if (isWithinBoard(x + i * dx, y + i * dy) && squares[y + i * dy][x + i * dx] === player.squareType) {
      return i - 1;
    }
    return 0;
}
  
const flipPieces = (
    squares: SquareTypes,
    player: IPlayer,
    x: number,
    y: number,
): SquareTypes => {
    const newSquares = [];
    for (const line of squares) {
      newSquares.push([...line]);
    }
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;
  
        const count = getCountFlips(squares, player, x, y, dx, dy);
        for (let i = 0; i <= count; i++) {
          const _y = y + i * dy;
          const _x = x + i * dx;
          if (!isWithinBoard(_x, _y)) continue;
          newSquares[_y][_x] = player.squareType;
        }
      }
    }
    return newSquares;
};
  
const isSkip = (squares: SquareTypes, player: IPlayer): boolean => {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (canPut(squares, player, x, y)) return false;
      }
    }
    return true;
}
  
const canPut = (
    squares: SquareTypes,
    player: IPlayer,
    x: number,
    y: number,
): boolean => {
    if (squares[y][x] !== SquareType.Undef) return false;
  
    let can = false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;
  
        const count = getCountFlips(squares, player, x, y, dx, dy);
        if (count > 0) can = true;
      }
    }
    return can;
}

const calcPoints = (squares: SquareTypes): number[] => {
    let blackPoints = 0, whitePoints = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (squares[y][x] === SquareType.Black) {
          blackPoints++;
        } else if (squares[y][x] === SquareType.White) {
          whitePoints++;
        }
      }
    }
    return [blackPoints, whitePoints];
};
  
const InitButton = styled.button`
    background: linear-gradient(to right,red,orange,yellow,green,aqua,blue,purple);
    width: 100px;
    font-size: 20px;
    font-weight: 900;
    position: absolute;
    border-radius: 10px;
    left: 510px;
    top: -140px; 
`;
  
const Option = styled.div`
    position: relative;
`;

type State = {
    squares: SquareType[][],
    currentPlayer: IPlayer,
};

type Action = { t: 'init', player: IPlayer }
    | { t: 'turn', x: number, y: number }
    | { t: 'skip' };

const reducer = (state: State, action: Action): State => {
    switch (action.t) {
      case 'init':
          return {
              squares: initSquares(),
              currentPlayer: action.player,
          };
      case 'turn':
          if (canPut(state.squares, state.currentPlayer, action.x, action.y)) {
              return {
                  squares: flipPieces(state.squares, state.currentPlayer, action.x, action.y),
                  currentPlayer: nextPlayer(state.currentPlayer),
              };
          }
          return {
              ...state,
          };
      case 'skip':
          return {
              ...state,
              currentPlayer: nextPlayer(state.currentPlayer),
          };
    }
};

const convertSquaresToString = (squares: SquareType[][]): string => {
    let boardStr = "";
    for (let j = 0; j < squares.length; j++) {
        for (let i = 0; i < squares[0].length; i++) {
            if (squares[i][j] === SquareType.Black) {
                boardStr += "B";
            } else if (squares[i][j] === SquareType.White) {
                boardStr += "W";
            } else if (squares[i][j] === SquareType.Undef) {
                boardStr += "*"
            }
        }
        boardStr += "\n";
    }
    return boardStr;
}

const getAvailableMoves = (
    squares: SquareTypes,
    player: IPlayer,
): number[][] => {
    let availableMoves = [];
    for (let j = 0; j < squares.length; j++) {
        for (let i = 0; i < squares[0].length; i++) {
            if (canPut(squares, player, i, j)) {
                let move = [i, j];
                availableMoves.push(move);
            }
        }
    
    }
    return availableMoves;
}

const convertAvaiableMovesToStr = (moves: number[][]): string => {
    let movesStr = "";
    for (const move of moves) {
        movesStr += "(";
        movesStr += move.toString();
        movesStr += ") ";
    }

    return movesStr
}

export const Game = (props: {
    players: IPlayer[],
  }) => {
    const { players } = props;
    const [state, dispatch] = useReducer(reducer, {
      squares: initSquares(),
      currentPlayer: players[0],
    });
    const [points, setPoints] = useState([0, 0]);
  
    useEffect(() => {
        const isSkipCurrentUser = isSkip(state.squares, state.currentPlayer);
        const isFinish = isSkipCurrentUser &&
          isSkip(state.squares, nextPlayer(state.currentPlayer));
    
        if (isFinish) {
            alert('finish');
            dispatch({ t: 'init', player: players[0] });
            return;
        }
    
        if (isSkipCurrentUser) {
            alert('skip');
            dispatch({ t: 'skip' });
        }
        const points = calcPoints(state.squares);
        setPoints(points);

        if (state.currentPlayer.squareType === SquareType.White) {
            // Now it's AI's turn.
            // dispatch({t: "turn", x: 3, y: 5})
            // print the current state of board
            const boardStr = convertSquaresToString(state.squares);
            // console.log(boardStr);

            const availableMoves = getAvailableMoves(state.squares, state.currentPlayer);
            // console.log(availableMoves);
            
            const availableMovesStr = convertAvaiableMovesToStr(availableMoves);
            // console.log(availableMovesStr);
            const instructionMsg = "You are a beginner player of the Othello game, and your task is to compete against another player. Your piece is white. In each round, you will receive a game board which is a 0-7 * 0-7 grid labeled starting from 0 and available moves for the white pieces. You must choose the appropriate position you want to place your white piece, formatted as (row_position, column_position).  Also, you need to explain your thought process in simple Japanese, and keep it brief. Please output the position and Japanese explanation only. Example:\n\n\n User:\n********\n********\n********\n***WB***\n***BBB**\n********\n********\n******** Available moves of white pieces: (3,5), (5,3), (5,5)\n Output: Position: (5,3)\nJapanese Explanation: 横5縦3の位置に白い駒を置くと、縦の黒い駒を白い駒で挟むことができます。これにより、黒い駒を白い駒に変えることができるため、この位置を選びます。";
            const userMsg = `${boardStr}\nAvailable moves of white pieces: ${availableMovesStr}`;
            const finalMsg = `${instructionMsg} User: ${userMsg}`;

            (async () => {
                const rawResponse = await fetch('http://127.0.0.1:5000/api/user_msg', {
                    method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({"user_msg": finalMsg})
                });
                const content = await rawResponse.json();
                // console.log(content);
                const move = content.move;
                // console.log(move)
                //   console.log(move);
                let x = move[0];
                let y = move[1];
                console.log(x, y);
                dispatch({t: "turn", x: x, y: y});
            })();

            console.log(userMsg);
        }
    }, [state, players]);
  
    return (
      <>
        <Board SquareTypes={state.squares} onClick={(x: number, y: number) => {
            console.log(x, y);
            dispatch({ t: 'turn', x: x, y: y });
        }} />
        <Option>
            <InitButton onClick={() => dispatch({ t: 'init', player: players[0] })}>init</InitButton>
            <Player player={players[0]} point={points[0]} />
            <Player player={players[1]} point={points[1]} />
        </Option>
      </>
    );
};