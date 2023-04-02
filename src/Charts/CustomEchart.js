/* eslint-disable consistent-return */
import React, { useEffect, useRef } from 'react';
import { init, getInstanceByDom } from 'echarts';

function CustomEchart({
    option, style, loading, events = {}, shouldAutoResize = true,
}) {
    const chartRef = useRef(null);

    useEffect(() => {
        // Initialize chart
        let chart;
        function resizeChart() {
            chart?.resize();
        }
        if (chartRef.current !== null) {
            chart = init(chartRef.current);
            chart.on('finished', () => {
                setTimeout(resizeChart, 300);
                chart.off('finished');
            });
        }

        if (shouldAutoResize) {
            // Resize chart when sidebar is collapsed/expanded
            window.addEventListener('sidebar', () => { setTimeout(resizeChart, 300); });

            // Add chart resize listener
            // ResizeObserver is leading to a bit janky UX
            window.addEventListener('resize', resizeChart);
        }

        // Return cleanup function
        return () => {
            chart?.dispose();
            if (shouldAutoResize) {
                window.removeEventListener('resize', resizeChart);
            }
        };
    }, []);

    useEffect(() => {
        if (chartRef.current === null) {
            return;
        }
        const chart = getInstanceByDom(chartRef.current);
        if (Object.keys(events).length) {
            Object.entries(events).forEach(([eventName, eventCallback]) => {
                chart.on(eventName, eventCallback);
            });

            return () => {
                Object.keys(events).forEach((eventName) => chart.off(eventName));
            };
        }
        return () => {};
    }, [events]);

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            const chart = getInstanceByDom(chartRef.current);
            const chartOptions = option;

            chart.setOption(chartOptions);
        }
    }, [option]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

    useEffect(() => {
        // Update chart
        if (chartRef.current !== null) {
            const chart = getInstanceByDom(chartRef.current);
            if (loading === true) {
                chart.showLoading();
            } else {
                chart.hideLoading();
            }
        }
    }, [loading]);

    return <div ref={chartRef} style={{ width: '100%', height: '100px', ...style }} />;
}

export default CustomEchart;
