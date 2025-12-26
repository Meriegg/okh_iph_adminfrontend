import { formatRelativeTime } from "@/utils/format-relative-time";
import { useEffect, useState } from "react";

interface Props {
  timestamp: number;
}

export const UpdateRelativeTime = ({ timestamp }: Props) => {
  const [time, setTime] = useState<string>(formatRelativeTime(timestamp));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatRelativeTime(timestamp));
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [timestamp]);

  return <>{time}</>;
};
