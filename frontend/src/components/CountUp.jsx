import { useEffect, useRef, useState } from "react";

// Animates a number from its previous value to `value` (ease-out).
function CountUp({ value, duration = 900 }) {

  const [shown, setShown] = useState(0);
  const last = useRef(0);

  useEffect(() => {

    const begin = last.current;
    const start = performance.now();
    let frame;

    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(begin + (value - begin) * eased);
      last.current = v;
      setShown(v);
      if (t < 1) frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);

  }, [value, duration]);

  return <>{shown}</>;
}

export default CountUp;
