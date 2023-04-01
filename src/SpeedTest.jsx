import React, { useState } from "react";

const downloadUrl = 'https://test.kevindupas.com/download-test-file';
const uploadUrl = "https://test.kevindupas.com/upload-test-file";
const numberOfTests = 10;
const testDuration = 1000; // 1000 ms = 1 s
const uploadFileSize = 512 * 1024; // 512 Ko

function SpeedTest() {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);

  async function testDownload() {
    let downloadResults = [];

    for (let i = 0; i < numberOfTests; i++) {
      const startTime = new Date().getTime();
      const response = await fetch(downloadUrl, { cache: "no-store" });
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000;

      const fileSizeInBytes = 10 * 1024 * 1024; // 10 Mo
      const fileSizeInBits = fileSizeInBytes * 8;
      const downloadSpeedMbps = (fileSizeInBits / duration) / (1024 * 1024);
      downloadResults.push(downloadSpeedMbps);
      setDownloadSpeed(downloadSpeedMbps);

      // Wait for the next test
      if (i < numberOfTests - 1) {
        await new Promise((resolve) => setTimeout(resolve, testDuration));
      }
    }

    const averageDownloadSpeed = downloadResults.reduce((a, b) => a + b, 0) / numberOfTests;
    return averageDownloadSpeed;
  }

  async function testUpload() {
    let uploadResults = [];

    for (let i = 0; i < numberOfTests; i++) {
      const data = new FormData();
      data.append("file", new Blob([new ArrayBuffer(uploadFileSize)]), "upload-test-file");

      const startTime = new Date().getTime();
      await fetch(uploadUrl, {
        method: "POST",
        body: data,
      });
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000;

      const fileSizeInBytes = uploadFileSize;
      const fileSizeInBits = fileSizeInBytes * 8;
      const uploadSpeedMbps = (fileSizeInBits / duration) / (1024 * 1024);
      uploadResults.push(uploadSpeedMbps);
      setUploadSpeed(uploadSpeedMbps);

      // Wait for the next test
      if (i < numberOfTests - 1) {
        await new Promise((resolve) => setTimeout(resolve, testDuration));
      }
    }

    const averageUploadSpeed = uploadResults.reduce((a, b) => a + b, 0) / numberOfTests;
    return averageUploadSpeed;
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
