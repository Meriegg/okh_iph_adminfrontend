import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast.error("Error", {
            description: error?.response?.data?.message ?? "Unable to perform action, please try again later.",
          })
          return;
        }

        toast.error("Error", {
          description: error?.message ?? "Unable to perform action, please try again later.",
        })
      }
    }
  }
})