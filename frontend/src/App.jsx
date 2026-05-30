import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState('loading...');

  useEffect(() => {
    fetch('api')
      .then((response) => response.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('The backend could not be reached!'));
  }, []);

  return (
    <div>
      <h1>StudentHub Slovenia</h1>
      <p>Backend says: {status}</p>
    </div>
  )
}