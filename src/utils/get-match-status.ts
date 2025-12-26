export const getMatchStatus = (timestamp: number, duration: number) => {
  const now = new Date().getTime();

  if (now < timestamp) return "upcoming";
  if (now > timestamp + duration * 60 * 1000) return "finished";

  return "live";
}