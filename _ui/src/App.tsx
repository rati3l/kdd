import PageContainer from "./components/PageContainer";
import React, { useEffect, useState } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Namespaces from "./pages/Namespaces";
import Namespace from "./pages/Namespace";
import Deployments from "./pages/Deployments";
import StatefulSets from "./pages/Statefulsets";
import DaemonSets from "./pages/Daemonsets";
import Deployment from "./pages/Deployment";

const LOCAL_STORAGE_REFRESH_INTERVAL_KEY = "refreshIntervalMS"

function App() {
  const [refreshIntervalMS, setRefreshIntervalMS] = useState(5000)

  const refreshIntervalMSChanged = (ms : number) => {
    setRefreshIntervalMS(ms)
    localStorage.setItem(LOCAL_STORAGE_REFRESH_INTERVAL_KEY, ms.toString())
  }

  useEffect(()=>{
    /**
     * load last configuration of refresh interval
     */

     const refreshIntervalMS = localStorage.getItem(LOCAL_STORAGE_REFRESH_INTERVAL_KEY);
     if (refreshIntervalMS) {
      setRefreshIntervalMS(parseInt(refreshIntervalMS, 10))
     }

  }, [])

  return (
    <React.Fragment>
      <Router>
        <PageContainer refreshIntervalMS={refreshIntervalMS} onRefreshIntervalChanged={refreshIntervalMSChanged}>
          <Routes>
            <Route path="/ui/namespaces" element={<Namespaces  refreshIntervalMS={refreshIntervalMS} />}></Route>
            <Route path="/ui/namespace/:name" element={<Namespace  refreshIntervalMS={refreshIntervalMS} />}></Route>
            <Route path="/ui/workloads/deployments" element={<Deployments  refreshIntervalMS={refreshIntervalMS} />}></Route>
            <Route path="/ui/workloads/deployments/:namespace/:name" element={<Deployment  refreshIntervalMS={refreshIntervalMS} />}></Route>
            <Route path="/ui/workloads/statefulsets" element={<StatefulSets  refreshIntervalMS={refreshIntervalMS} />}></Route>
            <Route path="/ui/workloads/daemonsets" element={<DaemonSets  refreshIntervalMS={refreshIntervalMS} />}></Route>
          </Routes>
        </PageContainer>
      </Router>
    </React.Fragment>
  );
}

export default App;
