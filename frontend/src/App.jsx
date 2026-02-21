import { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import store from './redux/store'
import AppRoutes from './AppRoutes'
import './styles/global.css'
import './styles/theme.css'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  )
}

export default App
