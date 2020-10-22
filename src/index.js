import React from 'react';
import ReactDOM from 'react-dom';
import './reset.css';
import './index.scss';
import App from './components/App/App';
import { BrowserRouter } from 'react-router-dom';

import * as serviceWorker from './serviceWorker';
import ScrollToTop from './util/ScrollToTop';


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
    <ScrollToTop />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
