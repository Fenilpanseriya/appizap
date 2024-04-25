import React from 'react';

export default function DbBuilder({ fill = '#C1C8CD', width = '25', className = '', viewBox = '0 0 25 25' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width={width} height={width} viewBox="0 0 823 823">
      <path
        fill={fill}
        d="M411.5 823c210.4 0 381-48.4 381-108V578.8c-2.5 1.9-5 3.7-7.699 5.5-22.701 15.2-54 28.5-93 39.601C616.4 645.2 516.9 657 411.5 657c-105.4 0-204.9-11.8-280.3-33.1-39-11.101-70.3-24.4-93-39.601-2.7-1.8-5.2-3.6-7.7-5.5V715c0 59.6 170.601 108 381 108z"
      />
      <path
        fill={fill}
        d="M411.5 617c203.3 0 369.4-45.1 380.4-102 .4-2 .6-4 .6-6V371.8c-2.5 1.9-5 3.7-7.699 5.5-19.1 12.8-44.4 24.3-75.301 34.2-5.699 1.8-11.6 3.6-17.699 5.4-6.1 1.699-12.301 3.399-18.701 5-14.799 3.699-30.299 7-46.5 10-63.7 11.8-137.799 18.1-215.1 18.1-77.3 0-151.4-6.3-215.2-18.1-16.2-3-31.7-6.4-46.5-10-6.4-1.601-12.6-3.2-18.7-5-6.1-1.7-12-3.5-17.7-5.4-30.9-9.9-56.2-21.4-75.3-34.2-2.7-1.8-5.2-3.6-7.7-5.5V509c0 2 .2 4 .6 6 11.101 56.9 177.201 102 380.5 102z"
      />
      <path
        fill={fill}
        d="M196.3 391.1c20.7 4 42.8 7.5 66.101 10.301 45.8 5.5 96.199 8.6 149.1 8.6 52.9 0 103.3-3.1 149.099-8.6 23.3-2.801 45.4-6.301 66.101-10.301 94.199-18.3 158-48.3 165.199-82.6.5-2.2.699-4.3.699-6.5V108c0-59.6-170.6-108-381-108-210.399 0-381 48.4-381 108v194c0 2.2.2 4.3.7 6.5 7.101 34.3 70.802 64.3 165.001 82.6zm256.2-82.8c0 22.601-18.4 41-41 41s-41-18.399-41-41c0-22.6 18.4-41 41-41s41 18.4 41 41z"
      />
    </svg>
  );
}