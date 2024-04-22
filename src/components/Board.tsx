import styled from "styled-components";
import { Square, SquareType } from "./Square";

const StyledBoard = styled.div`
    background-color: #008000;
    display: grid;
    grid-template-columns: repeat(8, 50px);
    grid-template-rows: repeat(8, 50px);
    gap: 1px;
`;

export const Board = (props: {
    SquareTypes: SquareType[][],
    onClick: (x: number, y: number) => void,
}) => {
    const { SquareTypes, onClick } = props;

    const squares = (
        SquareTypes.map((line, y) => {
            return (
                <div key={y}>
                    {
                        line.map((row, x) => {
                            return (
                                <Square 
                                    color={row} 
                                    onClick={onClick}
                                    x={x}
                                    y={y}
                                    key={`${x}-${y}`}
                                />
                            )
                        })
                    }
                </div>
            )
        })
    );

    return (
        <StyledBoard>
            {squares}
        </StyledBoard>
    )
};