import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import ManagerReturnDashboard from './Manager/ManagerReturnDashboard'
import Dashboard from './customer/Dashboard'
import AuthPage from './AuthPage'
import CustomerReturnDashboard from './customer/returnPage';
import Products from './customer/products';
import ManagerProducts from './Manager/Productslist';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/customer/dashboard" element={<Dashboard/>} />
        <Route path="/login" element={<AuthPage/>} />
        <Route path="/products" element={<Products/>} />
        <Route path="/manager/productsList" element={<ManagerProducts/>} />
        <Route path="/customer/returns" element={<CustomerReturnDashboard/>} />
        <Route path="/manager/dashboard" element={<ManagerReturnDashboard/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
