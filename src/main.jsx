import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import QuestionView from "./views/QuestionView.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  }, {
    path: "/*",
    element: <div>Hello World</div>,
  },
  {
    path: "/qaa",
    element: <QuestionView />
  }
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
  ,
)
