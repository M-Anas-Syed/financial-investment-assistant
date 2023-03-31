import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Main from './pages/Main';
import Register from './pages/Register';
import AskExpert from './components/AskExpert';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Main/>}/>
        <Route path="/register" element={<Register />} />
        <Route path='/askexpert' element={<AskExpert/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
