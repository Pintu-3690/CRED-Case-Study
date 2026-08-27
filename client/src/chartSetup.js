import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const inkDim = "#a7a7ad";
export const gridColor = "rgba(255,255,255,0.07)";

ChartJS.defaults.color = inkDim;
ChartJS.defaults.font.family = "'Inter', system-ui, sans-serif";

export default ChartJS;
