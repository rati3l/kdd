import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LinkBehavior from './components/commons/LinkBehavior';
import { LinkProps } from '@mui/material';

import "./index.css"

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const theme = createTheme({
  components: {
    MuiListItemButton: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      }
    },
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      } as LinkProps,
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior,
      },
    },
  },
  typography: {
    fontFamily: ['"Montserrat"', 'Open Sans'].join(','),
    fontSize: 12,
    h1: {
      fontSize: 26,
    },
    h2: {
      fontSize: 20,
    },
    h3: {
      fontSize: 16,
    },
    h4: {
      fontSize: 14,
    }
  },
  palette: {
    primary: {
      main: '#f50057',
    },
    secondary: {
      main: '#004a43',
    }
  }
})


root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
