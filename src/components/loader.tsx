import { Loader2Icon } from "lucide-react";

export const Loader = () => {
  return (
    <p className="flex w-full py-4 justify-center items-center text-base gap-1.5 font-medium">
      <Loader2Icon className="animate-spin w-4 h-4" strokeWidth={1} />{" "}
      Loading...
    </p>
  );
};
