import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import  { Toaster } from 'react-hot-toast';
import { persistor, store } from './redux/Store';
import { PersistGate } from 'redux-persist/integration/react';
// import { Providers } from './components/createconte';


function App() {

  return (
    <Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
   
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
 
  </PersistGate>
</Provider>
  );
}

export default App;
