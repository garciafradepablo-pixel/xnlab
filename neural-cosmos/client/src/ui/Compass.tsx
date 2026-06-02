/**
 * Orientation compass — North / South / East / West plus a Depth (profundidad)
 * tick driven by camera pitch. Reads the shared heading channel on its own rAF
 * loop so it never triggers React re-renders.
 */
import { useEffect, useRef } from "react";
import { heading } from "../engine/heading";

export default function Compass() {
  const dial = useRef<HTMLDivElement>(null);
  const depth = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const deg = (heading.yaw * 180) / Math.PI;
      if (dial.current)
        dial.current.style.transform = `rotate(${-deg}deg)`;
      if (depth.current) {
        const p = (heading.pitch * 180) / Math.PI; // -90 (down) … +90 (up)
        depth.current.style.transform = `translateY(${(-p / 90) * 12}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="compass" aria-hidden>
      <div className="compass-dial" ref={dial}>
        <span className="c-n">N</span>
        <span className="c-e">E</span>
        <span className="c-s">S</span>
        <span className="c-o">O</span>
      </div>
      <div className="compass-depth">
        <div className="compass-depth-tick" ref={depth} />
      </div>
    </div>
  );
}
