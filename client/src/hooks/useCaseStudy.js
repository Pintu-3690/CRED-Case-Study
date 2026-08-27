import { useEffect, useState } from "react";
import { defaultCaseStudyData } from "../defaultData";

export default function useCaseStudy() {
  const [data, setData] = useState(defaultCaseStudyData);
  const [error, setError] = useState(null);
  const [isLiveSync, setIsLiveSync] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/case-study")
      .then((r) => {
        if (!r.ok) throw new Error(`API error ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!cancelled && json) {
          setData(json);
          setIsLiveSync(true);
        }
      })
      .catch((e) => {
        // Fallback already in place, log gentle warning without breaking UI
        console.warn("Backend API sync notice (using bundled high-fidelity dataset):", e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, isLiveSync };
}
