import { useState } from 'react'
import { BrowserRouter, Routes, Route } from  "react-router-dom";
import Dashboard from "./pages/Dashboard";
import BoardPage from "./pages/BoardPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/board/:id" element={<BoardPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
