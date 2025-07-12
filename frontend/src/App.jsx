import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './customer/Dashboard'
import AuthPage from './AuthPage'
import CustomerReturnDashboard from './customer/returnPage';
import Products from './customer/products';
import AdminDashboard from './admin/AdminDashboard';
import ManagerDashboard from './manager/ManagerDashboard';
import ReturnsPage from './manager/ReturnsPage';
import RedistributionPage from './manager/RedistributionPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/customer/dashboard" element={<Dashboard/>} />
        <Route path="/" element={<AuthPage/>} />
        <Route path="/products" element={<Products/>} />
        <Route path="/customer/returns" element={<CustomerReturnDashboard/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        <Route path="/manager/dashboard" element={<ManagerDashboard/>} />
        <Route path="/manager/returns" element={<ReturnsPage/>} />
        <Route path="/manager/redistributions" element={<RedistributionPage/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
