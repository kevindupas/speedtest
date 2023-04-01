import React, { useState } from "react";

const downloadUrl = 'https://test.kevindupas.com/download-test-file';
const uploadUrl = "https://test.kevindupas.com/upload-test-file";

function SpeedTest() {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);

  async function testDownload() {
    const startTime = new Date().getTime();
    const response = await fetch(downloadUrl);
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;

    const fileSizeInBytes = 50 * 1024 * 1024;
    const fileSizeInBits = fileSizeInBytes * 8;
    const downloadSpeedMbps = (fileSizeInBits / duration) / (1024 * 1024);
    return downloadSpeedMbps;
  }

  async function testUpload() {
    const data = new FormData();
    data.append("file", new Blob([new ArrayBuffer(1)]), "upload-test-file");

    const startTime = new Date().getTime();
    await fetch(uploadUrl, {
      method: "POST",
      body: data,
    });
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;

    const fileSizeInBytes = 1;
    const fileSizeInBits = fileSizeInBytes * 8;
    const uploadSpeedMbps = (fileSizeInBits / duration) / (1024 * 1024);
    return uploadSpeedMbps;
  }

  async function startTest() {
    setDownloadSpeed(null);
    setUploadSpeed(null);

    const downloadResult = await testDownload();
    setDownloadSpeed(downloadResult);

    const uploadResult = await testUpload();
    setUploadSpeed(uploadResult);
  }

  return (
    <div>
      <h1>Test de vitesse</h1>
      <button onClick={startTest}>Commencer le test</button>
      {downloadSpeed && <p>Vitesse de téléchargement : {downloadSpeed.toFixed(2)} Mbps</p>}
      {uploadSpeed && <p>Vitesse de téléversement : {uploadSpeed.toFixed(2)} Mbps</p>}
    </div>
  );
}

export default SpeedTest;
