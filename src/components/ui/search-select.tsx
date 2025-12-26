/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CheckIcon, ChevronDown } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { capitalizeFirstLetter } from "@/utils/capitalize-first-letter";

interface Props {
  value?: string;
  onValueChange: (val: string, groupName?: string) => void;
  items: {
    value: string;
    text: string;
    ui?: React.ReactNode;
    groupName?: string;
  }[];
  placeholder?: string;
  className?: string;
}

export const SearchSelect = ({
  value,
  placeholder,
  items,
  onValueChange,
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currItems, setCurrItems] = useState(items);

  const itemsByGroup = currItems.reduce((acc, item) => {
    const existingArr = acc[item.groupName ?? "[DEFAULT]"] ?? [];
    existingArr.push(item);
    acc[item.groupName ?? "[DEFAULT]"] = existingArr;
    return acc;
  }, {} as Record<string, { value: string; text: string; ui?: React.ReactNode; groupName?: string }[]>);

  useEffect(() => {
    let temp = [...items];

    temp = temp.filter((item) => {
      const includesSearchQuery = item.text
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return includesSearchQuery;
    });

    setCurrItems(temp);
  }, [searchQuery, items]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "h-10.25 justify-between scale-100! rounded-full bg-slate-900",
            className
          )}
        >
          {value
            ? items.find((item) => item.value === value.split("::")[0])?.text
            : placeholder ?? "Select an item"}{" "}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[50vh] z-50 p-0 overflow-y-auto">
        {/* <pre>{JSON.stringify(items, null, 2)}</pre> */}

        {/* <p>{searchQuery}</p> */}
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search"
          className="w-full border-b focus:outline-none z-30 py-3 sticky top-0 bg-slate-900 px-4 text-sm"
        />

        {Object.keys(itemsByGroup).map((group, idx) => (
          <div key={idx} className="mt-2 w-full">
            {group !== "[DEFAULT]" && (
              <p className="px-2 text-sm font-semibold text-neutral-600 dark:text-white/70">
                {capitalizeFirstLetter(group)}
              </p>
            )}

            <div
              className={cn(
                "w-full",
                group !== "[DEFAULT]" && "mt-2 flex flex-col gap-0"
              )}
            >
              {itemsByGroup[group].map((item, idx) => {
                const valueToCheck = value?.split(":")[0] ?? null;
                const groupNameToCheck = value?.split(":")?.[1] ?? null;

                let isSelected = valueToCheck === item.value;
                if (groupNameToCheck) {
                  isSelected =
                    isSelected && groupNameToCheck === item.groupName;
                }

                return (
                  <button
                    key={idx}
                    className="flex w-full scale-100! text-left pl-8 relative items-center justify-between gap-2 px-3 py-3 text-sm outline-none hover:bg-neutral-100 dark:hover:bg-white/10"
                    onClick={() => {
                      onValueChange(item.value, item.groupName);
                      setOpen(false);
                    }}
                  >
                    {isSelected && (
                      <CheckIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 transform" />
                    )}
                    {item?.ui ? item.ui : item.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};
