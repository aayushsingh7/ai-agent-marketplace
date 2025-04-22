import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/contextAPI.tsx'
import { Bounce, ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <AppProvider>
    <BrowserRouter>
    <App />
    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </BrowserRouter>
    </AppProvider>
  // </StrictMode>,
)
