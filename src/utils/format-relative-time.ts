export const formatRelativeTime = (targetTimestamp: number): string => {
  const now = Date.now();
  const diffMs = targetTimestamp - now;

  const isFuture = diffMs > 0;
  const absMs = Math.abs(diffMs);

  const totalMinutes = Math.floor(absMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  if (days === 0 && hours === 0 && minutes === 0) {
    return "now";
  }

  let result: string;

  if (days > 0) {
    const dd = String(days).padStart(2, "0");
    const hh = String(hours).padStart(2, "0");
    result = `${dd}d${hh}h`;
  } else {
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    result = `${hh}h${mm}m`;
  }

  return isFuture ? `in ${result}` : `${result} ago`;
}