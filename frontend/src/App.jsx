import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './customer/Dashboard'
import AuthPage from './AuthPage'
import CustomerReturnDashboard from './customer/returnPage';
import Products from './customer/products';
import AdminDashboard from './admin/AdminDashboard';
import ManagerDashboard from './Manager/ManagerDashboard';
import ReturnsPage from './manager/ReturnsPage';
import RedistributionPage from './Manager/RedistributionPage';
import ManagerReturnDashboard from './Manager/ManagerReturnDashboard';

function App() {

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
        <Route path="/manager/returns" element={<ManagerReturnDashboard/>} />
        <Route path="/manager/redistributions" element={<RedistributionPage/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
