import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/axios";
import type { AxiosError } from "axios";
import { queryClient } from "../lib/query-client";

export const Page_ChangePFP = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File>();

  const [generalError, setGeneralError] = useState<string | null>();

  const changePassword = useMutation({
    mutationFn: async () => {
      if (!file) {
        setGeneralError("Choose an image!");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      return await api.post("/user/change-profile-picture", formData);
    },
    onError: (
      error: AxiosError<{
        message: string;
        formErrors?: { field: string; message: string }[];
      }>
    ) => {
      setGeneralError(
        error?.response?.data?.message ||
          "Unable to change pfp, please try again later."
      );
    },
    onSuccess: () => {
      navigate("/");
      queryClient.invalidateQueries({ queryKey: ["user.me"] });
    },
  });

  return (
    <div className="w-full h-full">
      <div className="max-w-112.5 flex flex-col gap-2 mx-auto">
        <div className=" flex flex-col gap-0.75 bg-(--lifted) p-0.75 rounded-2xl w-full mx-auto">
          <Link
            to="/"
            className="p-2 rounded-2xl bg-slate-900 flex items-center gap-1.5 justify-center text-center text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
            Back to account
          </Link>
        </div>

        <div className=" flex flex-col gap-0.75 bg-(--lifted) p-0.75 rounded-2xl w-full mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900">
            <p className="text-2xl font-extrabold">
              Change your profile picture!
            </p>
            <p className="text-sm text-slate-300 mt-1">
              Choose a file and press continue.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!file) {
              setGeneralError("Choose an image!");
              return;
            }

            changePassword.mutate();
          }}
          className="flex flex-col gap-0.75 bg-(--lifted) p-0.75 rounded-2xl w-full mx-auto"
        >
          {generalError && (
            <button
              onClick={() => setGeneralError(null)}
              type="button"
              className="p-2 rounded-2xl bg-slate-900"
            >
              <span className="text-center w-full text-red-600 text-sm">
                {generalError}{" "}
                <span className="text-slate-300">(click to dismiss)</span>
              </span>
            </button>
          )}

          <input
            className="px-4 py-4 rounded-2xl bg-slate-900 w-full"
            placeholder="choose profile picture"
            type="file"
            accept="image/*"
            onChange={(e) => {
              console.log(e.target.files);
              setFile(e.target.files?.[0] ?? undefined);
            }}
            required
          />

          <button
            type="submit"
            disabled={changePassword.isPending}
            className="flex h-13.75 px-4 rounded-2xl bg-slate-900 items-center justify-between"
          >
            Continue <ArrowRight className="w-6 h-6" strokeWidth={1} />
          </button>
        </form>
      </div>
    </div>
  );
};
