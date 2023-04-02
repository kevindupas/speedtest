/* eslint-disable no-await-in-loop */
import React, { useEffect, useState } from 'react';
import GaugeChart from './Charts/GaugeChart';

const downloadUrl = 'https://test.kevindupas.com/download-test-file';
const uploadUrl = 'https://test.kevindupas.com/upload-test-file';
const numberOfTests = 10;
const testDuration = 1000; // 1000 ms = 1 s
const downloadFileSize = 1.5 * 1024 * 1024; // 5 Mo
const uploadFileSize = 1.5 * 1024 * 1024; // 1 Mo

function SpeedTest() {
    const [downloadSpeed, setDownloadSpeed] = useState(null);
    const [uploadSpeed, setUploadSpeed] = useState(null);
    const [ping, setPing] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const [showUploadChart, setShowUploadChart] = useState(false);
    const [showDownloadChart, setShowDownloadChart] = useState(false);
    const [showResultsTable, setShowResultsTable] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadTestIndex, setDownloadTestIndex] = useState(0);
    const [uploadTestIndex, setUploadTestIndex] = useState(0);
    const [testResults, setTestResults] = useState(null);
    const [testTime, setTestTime] = useState('');

    async function testDownload() {
        const downloadResults = [];

        for (let i = 0; i < numberOfTests; i++) {
            const startTime = new Date().getTime();
            const response = await fetch(downloadUrl, { cache: 'no-store' });
            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000;

            const fileSizeInBytes = downloadFileSize;
            const fileSizeInBits = fileSizeInBytes * 8;
            const downloadSpeedMbps = (fileSizeInBits / duration) / (1024 * 1024);
            downloadResults.push(downloadSpeedMbps);
            setDownloadSpeed(downloadSpeedMbps);
            setDownloadTestIndex(i + 1);

            if (i < numberOfTests - 1) {
                await new Promise((resolve) => setTimeout(resolve, testDuration));
            }
        }

        const averageDownloadSpeed = downloadResults.reduce((a, b) => a + b, 0) / numberOfTests;
        return averageDownloadSpeed;
    }

    async function testUpload() {
        const uploadResults = [];

        for (let i = 0; i < numberOfTests; i++) {
            const data = new FormData();
            data.append('file', new Blob([new ArrayBuffer(uploadFileSize)]), 'upload-test-file');

            const startTime = new Date().getTime();
            await fetch(uploadUrl, {
                method: 'POST',
                body:   data,
            });
            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000;

            const fileSizeInBytes = uploadFileSize;
            const fileSizeInBits = fileSizeInBytes * 8;
            const uploadSpeedMbps = (fileSizeInBits / duration) / (1024 * 1024);
            uploadResults.push(uploadSpeedMbps);
            setUploadSpeed(uploadSpeedMbps);
            setUploadTestIndex(i + 1);

            if (i < numberOfTests - 1) {
                await new Promise((resolve) => setTimeout(resolve, testDuration));
            }
        }

        const averageUploadSpeed = uploadResults.reduce((a, b) => a + b, 0) / numberOfTests;
        return averageUploadSpeed;
    }

    async function testPing() {
        const pingResults = [];
        const testUrl = `${downloadUrl}?t=${Date.now()}`; // Ajouter un paramètre unique pour éviter la mise en cache

        for (let i = 0; i < numberOfTests; i++) {
            const startTime = new Date().getTime();
            await fetch(testUrl, { method: 'HEAD', cache: 'no-store' });
            const endTime = new Date().getTime();

            const pingTime = endTime - startTime;
            pingResults.push(pingTime);

            // Attendre le prochain test
            if (i < numberOfTests - 1) {
                await new Promise((resolve) => setTimeout(resolve, testDuration));
            }
        }

        const averagePing = pingResults.reduce((a, b) => a + b, 0) / numberOfTests;
        return averagePing;
    }

    async function startTest() {
        setIsTesting(true);
        setDownloadSpeed(null);
        setUploadSpeed(null);
        setPing(null);
        setShowDownloadChart(false);
        setShowUploadChart(false);
        setShowResultsTable(false);

        // Enregistrez l'heure actuelle du test
        setTestTime(new Date());

        // Test de ping
        const pingResult = await testPing();
        setPing(pingResult);

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Test de téléchargement
        setShowDownloadChart(true);
        const downloadResult = await testDownload();
        setDownloadSpeed(downloadResult);
        setShowDownloadChart(false);

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Test de téléversement
        setShowUploadChart(true);
        const uploadResult = await testUpload();
        setUploadSpeed(uploadResult);
        setShowUploadChart(false);

        setIsTesting(false);
        setShowResultsTable(true);

        // Enregistrez les résultats du test
        setTestResults({ downloadSpeed: downloadResult, uploadSpeed: uploadResult, ping: pingResult });
    }

    const testProgress = () => {
        if (showDownloadChart) {
            return 50 * downloadTestIndex / numberOfTests;
        }
        if (showUploadChart) {
            return 50 + 50 * uploadTestIndex / numberOfTests;
        }
        return 0;
    };

    useEffect(() => {
        if (isTesting) {
            const updateProgress = () => {
                const currentProgress = testProgress();
                setProgress(currentProgress);
            };

            const interval = setInterval(updateProgress, 100);
            return () => clearInterval(interval);
        }
        setProgress(0);
    }, [isTesting, showDownloadChart, showUploadChart, downloadTestIndex, uploadTestIndex]);

    return (
        <div className="min-h-screen">
            {(isTesting || testResults) && (
                <div className="flex items-center justify-center">
                    <dl className="mt-5 grid gap-5 grid-cols-3">
                        {/* PING */}
                        <div className="overflow-hidden rounded-lg bg-white text-center">
                            {/* Titre et unité */}
                            <dt className="truncate text-sm font-medium text-gray-500">PING</dt>
                            <dt className="truncate text-sm font-medium text-gray-500 my-2">ms</dt>
                            {/* Loader ou résultat */}
                            <dd className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
                                {ping === null && isTesting ? (
                                    <dt className="flex items-center justify-center space-x-4 text-sm font-medium text-gray-500 my-2">
                                        <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                            <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z" />
                                        </svg>
                                    </dt>
                                ) : (
                                    ping.toFixed(2)
                                )}
                            </dd>
                        </div>

                        {/* DESCENDANT */}
                        <div className="overflow-hidden rounded-lg bg-white text-center">
                            {/* Titre et unité */}
                            <dt className="truncate text-sm font-medium text-gray-500">DESCENDANT</dt>
                            <dt className="flex items-center justify-center space-x-4 text-sm font-medium text-gray-500 my-2">
                                <svg className="w-5 h-5 mx-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM127 281c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l71 71L232 136c0-13.3 10.7-24 24-24s24 10.7 24 24l0 182.1 71-71c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L273 393c-9.4 9.4-24.6 9.4-33.9 0L127 281z" />
                                </svg>
                                Mbps
                            </dt>
                            {/* Loader ou résultat */}
                            <dd className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
                                {downloadSpeed === null && isTesting ? (
                                    <dt className="flex items-center justify-center space-x-4 text-sm font-medium text-gray-500 my-2">
                                        <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                            <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z" />
                                        </svg>
                                    </dt>
                                ) : (
                                    downloadSpeed.toFixed(2)
                                )}
                            </dd>
                        </div>

                        {/* ASCENDANT */}
                        <div className="overflow-hidden rounded-lg bg-white text-center">
                            {/* Titre et unité */}
                            <dt className="truncate text-sm font-medium text-gray-500">ASCENDANT</dt>
                            <dt className="flex items-center justify-center space-x-4 text-sm font-medium text-gray-500 my-2">
                                <svg className="w-5 h-5 mx-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM385 231c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-71-71V376c0 13.3-10.7 24-24 24s-24-10.7-24-24V193.9l-71 71c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L239 119c9.4-9.4 24.6-9.4 33.9 0L385 231z" /></svg>
                                Mbps
                            </dt>
                            {/* Loader ou résultat */}
                            <dd className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
                                {uploadSpeed === null && isTesting ? (
                                    <dt className="flex items-center justify-center space-x-4 text-sm font-medium text-gray-500 my-2">
                                        <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                            <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z" />
                                        </svg>
                                    </dt>
                                ) : (
                                    uploadSpeed.toFixed(2)
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}

            {!isTesting && !testResults && (
                <div className="flex justify-center items-center h-screen">
                    <div className="w-64 h-64 relative flex justify-center items-center">
                        <div className="spinner-sector spinner-sector-green absolute inset-0 rounded-full border-4 border-transparent mix-blend-overlay animate-spin-slow" />
                        <button
                            type="button"
                            onClick={startTest}
                            disabled={isTesting}
                            className="flex items-center justify-center w-48 h-48 z-50 rounded-full bg-blue-400 hover:scale-105 text-white"
                        >
                            <span className="font-medium text-xl w-36">Démarrer le test</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Ici, vous pouvez ajouter les jauges pour les tests de téléchargement, de téléversement et de ping. */}
            <div className={`${showDownloadChart ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 w-full`}>
                {showDownloadChart && (
                    <GaugeChart
                        title="Vitesse de download"
                        maxValue={500}
                        value={downloadSpeed ? downloadSpeed.toFixed(2) : 0}
                    />
                )}
            </div>
            <div className={`${showUploadChart ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 w-full`}>
                {showUploadChart && (
                    <GaugeChart
                        title="Vitesse d'upload"
                        maxValue={200}
                        value={uploadSpeed ? uploadSpeed.toFixed(2) : 0}
                    />
                )}
            </div>

            {/* Progress Bar et bouton "Annuler le test" */}
            {isTesting && (
                <div className="absolute bottom-8 left-0 w-full">
                    {/* Ici, vous pouvez ajouter la barre de progression et le bouton "Annuler le test". */}
                    {isTesting && (
                        <div className="w-full px-6">
                            <div className="shadow w-full bg-gray-200">
                                <div
                                    className="bg-blue-500 text-xs leading-none py-1 text-center text-white transition-all duration-100 rounded-lg"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center mt-2">
                                En cours :
                                {' '}
                                {progress.toFixed(0)}
                                %
                            </p>
                        </div>
                    )}
                    <div className="flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsTesting(null);
                            }}
                            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Annuler
                        </button>

                    </div>
                </div>
            )}

            {/* Bouton "Redémarrer le test" */}
            <div className={`${!isTesting && testResults ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 w-full`}>

                {!isTesting && testResults && (
                    <div className="my-4">
                        <h2 className="bg-blue-500 text-xl font-bold mb-4 text-center p-1 text-white flex items-center justify-center">
                            <svg className="w-4 h-4 mx-3" xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 512 512">
                                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                            </svg>
                            Test de vitesse terminé
                        </h2>
                        <ul className="divide-y divide-gray-200">
                            <li className="relative bg-white px-4 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50">
                                <div className="flex justify-between space-x-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="block focus:outline-none">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            <p className="truncate text-sm font-medium text-gray-900">Opérateur</p>
                                        </div>
                                    </div>
                                    <time dateTime="2021-01-27T16:35" className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">Orange France</time>
                                </div>
                            </li>
                            <li className="relative bg-white px-4 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50">
                                <div className="flex justify-between space-x-3">
                                    <div className="min-w-0 flex-1">
                                        <div href="#" className="block focus:outline-none">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            <p className="truncate text-sm font-medium text-gray-900">Serveur</p>
                                        </div>
                                    </div>
                                    <time dateTime="2021-01-27T16:35" className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">Orange, France</time>
                                </div>
                            </li>
                            <li className="relative bg-white px-4 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50">
                                <div className="flex justify-between space-x-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="block focus:outline-none">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            <p className="truncate text-sm font-medium text-gray-900">Type de connexion</p>
                                        </div>
                                    </div>
                                    <time dateTime="2021-01-27T16:35" className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">4G</time>
                                </div>
                            </li>
                            <li className="relative bg-white px-4 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50">
                                <div className="flex justify-between space-x-3">
                                    <div className="min-w-0 flex-1">
                                        <div href="#" className="block focus:outline-none">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            <p className="truncate text-sm font-medium text-gray-900">Heure du test</p>
                                        </div>
                                    </div>
                                    <time dateTime="2021-01-27T16:35" className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">{testTime.toLocaleString()}</time>
                                </div>
                            </li>

                        </ul>
                        {/* Je veux un bouton "Recommencer le test" */}
                        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-2 mt-3">
                            <li className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
                                <div className="flex flex-1 flex-col p-4 justify-center items-center">
                                    <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM256 416c35.3 0 64-28.7 64-64c0-17.4-6.9-33.1-18.1-44.6L366 161.7c5.3-12.1-.2-26.3-12.3-31.6s-26.3 .2-31.6 12.3L257.9 288c-.6 0-1.3 0-1.9 0c-35.3 0-64 28.7-64 64s28.7 64 64 64zM176 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM96 288a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm352-32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" /></svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Redémarrer le test</h3>
                                </div>
                            </li>
                            <li className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
                                <div className="flex flex-1 flex-col p-4 justify-center items-center">
                                    <svg className="w-8 h-8" fill="red" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" /></svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Signaler un problème</h3>
                                </div>
                            </li>
                            <li className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
                                <div className="flex flex-1 flex-col p-4 justify-center items-center">
                                    <svg className="w-8 h-8" fill="blue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z" /></svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Mon historique de tests</h3>
                                </div>
                            </li>
                            <li className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
                                <div className="flex flex-1 flex-col p-4 items-center justify-center">
                                    <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M352 224c53 0 96-43 96-96s-43-96-96-96s-96 43-96 96c0 4 .2 8 .7 11.9l-94.1 47C145.4 170.2 121.9 160 96 160c-53 0-96 43-96 96s43 96 96 96c25.9 0 49.4-10.2 66.6-26.9l94.1 47c-.5 3.9-.7 7.8-.7 11.9c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-25.9 0-49.4 10.2-66.6 26.9l-94.1-47c.5-3.9 .7-7.8 .7-11.9s-.2-8-.7-11.9l94.1-47C302.6 213.8 326.1 224 352 224z" /></svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Partager le résultat</h3>
                                </div>
                            </li>

                        </ul>
                        {/* <button
                            type="button"
                            onClick={() => {
                                setTestResults(null);
                                startTest();
                            }}
                            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Recommencer le test
                        </button> */}
                    </div>
                )}
            </div>

        </div>
    );
}

export default SpeedTest;
