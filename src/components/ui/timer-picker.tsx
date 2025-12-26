/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

interface Props {
  val: string;
  onChange: (val: string) => void;
}

export const TimePicker = ({ val, onChange }: Props) => {
  const [currVal, setCurrVal] = useState("");
  const [currHour, setCurrHour] = useState<string | null>(null);
  const [currMinute, setCurrMinute] = useState<string | null>(null);

  const generateHours = () => {
    const allHours: string[] = [];

    for (let i = 0; i < 24; i++) {
      allHours.push(i.toString().padStart(2, "0"));
    }

    return allHours;
  };

  const generateMinutes = () => {
    const allMinutes: string[] = [];

    for (let i = 0; i < 60; i += 5) {
      allMinutes.push(i.toString().padStart(2, "0"));
    }

    return allMinutes;
  };

  const parseTime = (time: string) => {
    const splitTime = time?.split(":");
    if (splitTime?.length !== 2) return;

    const hours = splitTime?.[0]?.padStart(2, "0");
    const minutes = splitTime?.[1]?.padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    setCurrVal(parseTime(val) ?? "00:00");
  }, [val]);

  useEffect(() => {
    if (!currHour || !currMinute) return;

    onChange(`${currHour}:${currMinute}`);
  }, [currHour, currMinute]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="h-12 rounded-2xl! bg-slate-900! scale-100!"
        >
          {!currVal ? "Select a time" : currVal}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-fit p-2 rounded-lg">
        <div className="flex shrink-0 items-start h-full gap-1">
          <div>
            <p className="text-xs dark:text-white/70 text-neutral-600 mb-2">
              Hours
            </p>

            <div
              className="grid h-min grid-cols-6 flex-wrap gap-1"
              style={{
                width: "min(350px, 100%",
              }}
            >
              {generateHours().map((hour, i) => (
                <Button
                  size="sm"
                  variant={currHour === hour ? "default" : "ghost"}
                  key={i}
                  onClick={() => setCurrHour(hour)}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-41 border-l pl-4">
            <p className="text-xs dark:text-white/70 text-neutral-600 mb-2">
              Minutes
            </p>

            <div
              className="grid h-min grid-cols-4 gap-1"
              style={{
                width: "min(250px, 100%)",
              }}
            >
              {generateMinutes().map((minute, i) => (
                <Button
                  size="sm"
                  variant={minute === currMinute ? "default" : "ghost"}
                  key={i}
                  onClick={() => setCurrMinute(minute)}
                >
                  {minute}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
