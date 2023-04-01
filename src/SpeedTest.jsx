import React, { useState } from 'react';

const SpeedTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [testing, setTesting] = useState(false);

  const testDownloadSpeed = async () => {
    setTesting(true);

    const proxyUrl = 'https://aged-butterfly-8219.dupas-dev.workers.dev/?url=';
    const apiUrl = 'https://api.fast.com/netflix/speedtest/v2?https=true&token=YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm&urlCount=5';

    const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
    const data = await response.json();
    const testUrl = data.urls[0];

    const startTime = performance.now();
    const testSize = 25 * 1024 * 1024; // 25 MB

    const testResponse = await fetch(testUrl);
    const testData = new Uint8Array(await testResponse.arrayBuffer());
    const endTime = performance.now();

    const duration = (endTime - startTime) / 1000;
    const speed = (testSize / duration) / (1024 * 1024);

    setDownloadSpeed(speed.toFixed(2));
    setTesting(false);
  };

  return (
    <div>
      <button onClick={testDownloadSpeed} disabled={testing}>
        {testing ? 'Testing...' : 'Test Download Speed'}
      </button>
      {downloadSpeed && <p>Download speed: {downloadSpeed} Mbps</p>}
    </div>
  );
};

export default SpeedTest;
