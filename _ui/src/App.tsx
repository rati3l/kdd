import PageContainer from "./components/commons/PageContainer";
import React, { useEffect, useState } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Namespaces from "./pages/Namespaces";
import Namespace from "./pages/Namespace";
import Nodes from "./pages/Nodes";
import Workloads from "./pages/Workloads";
import Workload from "./pages/Workload";

const LOCAL_STORAGE_REFRESH_INTERVAL_KEY = "refreshIntervalMS"
const LOCAL_STORAGE_NAV_OPEN_KEY = "navopen"

function App() {
  const [refreshIntervalMS, setRefreshIntervalMS] = useState<number>(5000)

  const getNavStatus =() => {
    const strNavOpen = localStorage.getItem(LOCAL_STORAGE_NAV_OPEN_KEY);
    if (strNavOpen) {
      return strNavOpen === "true" ? true : false
    }

    return false
  }

  const [navOpen, setNavOpen] = useState<boolean>(getNavStatus())

  const refreshIntervalMSChanged = (ms: number) => {
    setRefreshIntervalMS(ms)
    localStorage.setItem(LOCAL_STORAGE_REFRESH_INTERVAL_KEY, ms.toString())
  }

  const navOpenChanged = (open: boolean) => {
    localStorage.setItem(LOCAL_STORAGE_NAV_OPEN_KEY, open.toString())
    setNavOpen(open)
  }

  useEffect(() => {
    // load last configuration of refresh interval
    const refreshIntervalMS = localStorage.getItem(LOCAL_STORAGE_REFRESH_INTERVAL_KEY);
    if (refreshIntervalMS) {
      setRefreshIntervalMS(parseInt(refreshIntervalMS, 10))
    }
  }, [])

  return (
    <React.Fragment>
      <Router>
        <PageContainer refreshIntervalMS={refreshIntervalMS} onRefreshIntervalChanged={refreshIntervalMSChanged} navOpen={navOpen} onNavOpenChanged={navOpenChanged}>
          <Routes>
            <Route path="/ui" element={<Nodes refreshIntervalMS={refreshIntervalMS} />}></Route>  
            <Route path="/ui/namespaces" element={<Namespaces refreshIntervalMS={refreshIntervalMS} />}></Route>
            <Route path="/ui/namespaces/:name" element={<Namespace refreshIntervalMS={refreshIntervalMS} />}></Route>
            <Route path="/ui/workloads/:workloadType" element={<Workloads refreshIntervalMS={refreshIntervalMS} />}></Route>
            <Route path="/ui/workloads/:workloadType/:namespace/:name" element={<Workload refreshIntervalMS={refreshIntervalMS} />}></Route>
          </Routes>
        </PageContainer>
      </Router>
    </React.Fragment>
  );
}

export default App;
