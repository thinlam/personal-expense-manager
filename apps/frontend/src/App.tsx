import { useEffect, useState } from "react";
import "./App.css";
import Loading from "./components/Loading";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <Loading />}
      {!loading && <div className="container"></div>}
    </>
  );
}

export default App;
