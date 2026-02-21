import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import React from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import './styles/AppRoutes.css'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <div className="routes-wrapper">
          <Routes>
            <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path='/chat/:chatId' element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
          </Routes>
        </div>
    </BrowserRouter>
  )
}

export default AppRoutes
