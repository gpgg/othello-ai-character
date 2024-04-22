import styled from "styled-components";
import { SquareType } from "./Square";

export interface IPlayer {
    name: string,
    squareType: SquareType,
};

const StyledPlayerBox = styled.h2`
    position: relative;
    padding: 6px;
    color: #fff;
    border-radius: 10px;
    background-image: -webkit-linear-gradient(315deg, #231557 0%, #44107a 29%, #ff1361 67%, #fff800 100%);
    background-image: linear-gradient(-225deg, #231557 0%, #44107a 29%, #ff1361 67%, #fff800 100%);
    width: 220px;
    left: 450px;
    top: -395px;
    margin-right: 20px;
`;

const StyledPlayer = styled.span`
    display: block;
    padding: 1rem 2rem;
    border-radius: 4px;
    background: rgba(255, 255, 255, .2);
`;

export const firstPlayer: IPlayer = {
    name: "黒",
    squareType: SquareType.Black,
};

export const secondPlayer: IPlayer = {
    name: "白",
    squareType: SquareType.White,
};

export const nextPlayer = (player: IPlayer) => {
    switch (player.squareType) {
        case SquareType.Black:
            return secondPlayer;
        case SquareType.White:
            return firstPlayer;
    }

    return firstPlayer;
}

export const Player = (props: {
    player: IPlayer,
    point: number
}) => {
    const { player, point } = props;

    return (
        <StyledPlayerBox>
            <StyledPlayer>
                {player.name} : {point} points
            </StyledPlayer>
        </StyledPlayerBox>
    )
};