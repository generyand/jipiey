import "./App.css";
import GWACalculator from "./components/GWACalculator";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <Analytics />
      <GWACalculator />
    </>
  );
}

export default App;
