import { BrowserRouter } from 'react-router-dom';
import styled from '@emotion/styled';
import Router from './router';
import './App.css';

const AppContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minWidth: '24.375rem', // 390/16
});

function App() {
  return (
    <AppContainer>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </AppContainer>
  );
}

export default App;
