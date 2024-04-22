import styled from "styled-components";

export enum SquareType {
    Undef,
    White,
    Black,
};

export type SquareTypes = SquareType[][];

const StyledSquare = styled.div`
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #007200;
    border: 1px solid #006200;
`;

const BlackSquare = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: black;
`;

const WhiteSquare = styled(BlackSquare)`
    background: white;
`;

export const Square = (
    props: {
        color: SquareType,
        onClick: (x: number, y: number) => void,
        x: number,
        y: number,
    }
) => {
    const {color, onClick, x, y} = props;

    return (
        <StyledSquare onClick={() => onClick(x, y)}>
            {
                color === SquareType.Undef 
                    ? "" 
                    : 
                    color === SquareType.Black 
                        ? <BlackSquare /> 
                        : <WhiteSquare />
            }
        </StyledSquare>
    )
};