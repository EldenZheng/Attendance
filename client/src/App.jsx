import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Login from './Login'
import Home from './Home'
import Attendance from './Attendance'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />}></Route>
          <Route path='/Home' element={<Home />}></Route>
          <Route path='/Attendance' element={<Attendance />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App