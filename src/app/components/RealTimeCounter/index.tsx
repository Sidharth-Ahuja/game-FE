"use client";
import { database, ref, onValue  } from '@/app/firebase-int';
import React, { useEffect, useState } from 'react';

const CIRCUMFERENCE = 2 * Math.PI * 50; // Circumference of the circle with radius 50

const RealTimeCounter: React.FC = () => {
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    const timerRef = ref(database, "timer");
    const onTimerChange = (snapshot: any) => {
        console.log("timer changed")
      const data = snapshot.val();
      setTimer(data);
    };

    // Set up listener
    onValue(timerRef, onTimerChange);

    // Cleanup listener on unmount
    // return () => timerRef.off('value', onTimerChange);
  }, []);

  if (timer === null) return <div>Loading...</div>;

  const radius = 50;
  const strokeWidth = 10;
  const strokeLength = CIRCUMFERENCE - (CIRCUMFERENCE / 15) * (15 - timer); // Calculate the stroke length based on the timer

  return (
    <div style={styles.container}>
      <svg width={(radius + strokeWidth)} height={(radius + strokeWidth)} viewBox={`0 0 ${2 * (radius + strokeWidth)} ${2 * (radius + strokeWidth)}`}>
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="#990000"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="grey" 
          strokeWidth={strokeWidth}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeLength}
          fill="none"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
        <text
          x={radius + strokeWidth}
          y={radius + strokeWidth}
          fontSize="36"
          textAnchor="middle"
          alignmentBaseline="central"
          fill="#333"
        >
          {timer}
        </text>
      </svg>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
};

export default RealTimeCounter;
