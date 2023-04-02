import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function GaugeChart({ title, maxValue, value }) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            const chart = echarts.init(chartRef.current);
            const gaugeOption = {
                title: {
                    text:      title,
                    left:      'center',
                    top:       20,
                    textStyle: {
                        color: '#333',
                    },
                },
                series: [
                    {
                        type:     'gauge',
                        max:      maxValue,
                        progress: {
                            show: true,
                        },
                        detail: {
                            fontSize:       18,
                            formatter:      '{value} Mbps',
                            valueAnimation: true,
                            offsetCenter:   [0, '60%'],
                        },
                        data: [
                            {
                                value,
                                name: 'SCORE',
                            },
                        ],
                    },
                ],
            };

            chart.setOption(gaugeOption);
        }
    }, [title, value]);

    return <div ref={chartRef} style={{ width: '100%', height: '400px' }} className="mt-8" />;
}

export default GaugeChart;
