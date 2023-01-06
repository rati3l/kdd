import PageContainer from "./components/PageContainer";
import React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Namespaces from "./pages/Namespaces";

function App() {
  return (
    <React.Fragment>
      <Router>
        <PageContainer>
          <Routes>
            <Route path="/ui/namespaces" element={<Namespaces />}></Route>
          </Routes>
        </PageContainer>
      </Router>
    </React.Fragment>
  );
}

export default App;
