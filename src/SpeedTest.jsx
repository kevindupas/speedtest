import React, { useState } from 'react';

const SpeedTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [testing, setTesting] = useState(false);

  const getNearestServer = async () => {
    const response = await fetch('https://locate.measurementlab.net/v2/nearest/ndt');
    const data = await response.json();
    return data;
  };

  const testSpeed = async () => {
    setTesting(true);
    const nearestServer = await getNearestServer();
    const ndtServer = `${nearestServer.url}ndt/v7/download`;

    const websocket = new WebSocket(ndtServer);

    websocket.onopen = () => {
      console.log('WebSocket connection opened');
      websocket.send(JSON.stringify({ msg: 'start', tests: 'download,upload' }));
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.msg === 'measurement' && message.result) {
        if (message.result.download) {
          setDownloadSpeed((message.result.download * 0.000008).toFixed(2));
        }
        if (message.result.upload) {
          setUploadSpeed((message.result.upload * 0.000008).toFixed(2));
        }
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setTesting(false);
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
      setTesting(false);
    };
  };

  return (
    <div>
      <button onClick={testSpeed} disabled={testing}>
        Tester la vitesse de connexion
      </button>
      <p>Vitesse de téléchargement: {downloadSpeed} Mbps</p>
      <p>Vitesse de téléversement: {uploadSpeed} Mbps</p>
    </div>
  );
};

export default SpeedTest;
