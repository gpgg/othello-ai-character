import styled from "styled-components"
import { Game } from './components/Game';
import { firstPlayer, secondPlayer } from './components/Player';


const StyledApp = styled.div`
  text-align: center;
`;

function App() {


  return (
    <StyledApp>
      <Game players={[firstPlayer, secondPlayer]} />
    </StyledApp>
  )
}

export default App
