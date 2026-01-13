import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import {store} from "./redux/states/store.ts"
import { BrowserRouter } from 'react-router-dom'

import './assets/css/app-rtl.min.css'
import './assets/css/app.css'
import './assets/css/app.min.css'
import './assets/css/bootstrap-rtl.min.css'
import './assets/css/bootstrap.css'
import './assets/css/bootstrap.min.css'
import './assets/css/icons-rtl.min.css'
import './assets/css/icons.css'
import './assets/css/icons.min.css'
import './assets/css/toastr.min.css'



createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
