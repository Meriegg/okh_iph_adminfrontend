import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/axios";
import type { AxiosError } from "axios";
import { queryClient } from "../lib/query-client";

export const Page_ChangePassword = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [generalError, setGeneralError] = useState<string | null>();
  const [oldPasswordError, setOldPasswordError] = useState<string | null>();
  const [newPasswordError, setNewPasswordError] = useState<string | null>();
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState<
    string | null
  >();

  const changePassword = useMutation({
    mutationFn: async () => {
      return await api.post("/user/change-password", {
        oldPassword,
        newPassword,
        confirmNewPassword,
      });
    },
    onError: (
      error: AxiosError<{
        message: string;
        formErrors?: { field: string; message: string }[];
      }>
    ) => {
      if (error?.response?.data?.formErrors?.length) {
        for (const formError of error.response.data.formErrors) {
          if (formError.field === "oldPassword") {
            setOldPasswordError(formError.message);
          }
          if (formError.field === "newPassword") {
            setNewPasswordError(formError.message);
          }
        }
        return;
      }

      setGeneralError(
        error?.response?.data?.message ||
          "Unable to change password, please try again later."
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
            <p className="text-2xl font-extrabold">Change your password!</p>
            <p className="text-sm text-slate-300 mt-1">
              Complete all 3 fields and press continue.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!oldPassword.trim()) {
              setOldPasswordError("Old password is required.");
              return;
            }

            if (!newPassword.trim()) {
              setNewPasswordError("New password is required.");
              return;
            }

            if (newPassword !== confirmNewPassword) {
              setNewPasswordError("Passwords must match.");
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
            className="px-4 h-13.75 rounded-2xl bg-slate-900 w-full"
            placeholder="old password"
            type="password"
            onChange={(e) => {
              setOldPasswordError(null);
              setOldPassword(e.target.value);
            }}
            value={oldPassword}
            required
          />
          {oldPasswordError && (
            <p className="text-red-600 px-2 -mt-1 text-sm ">
              {oldPasswordError}
            </p>
          )}

          <input
            className="px-4 h-13.75 rounded-2xl bg-slate-900 w-full"
            placeholder="new password"
            type="password"
            onChange={(e) => {
              setNewPasswordError(null);
              setNewPassword(e.target.value);
            }}
            value={newPassword}
            required
          />
          {newPasswordError && (
            <p className="text-red-600 px-2 -mt-1 text-sm ">
              {newPasswordError}
            </p>
          )}

          <input
            className="px-4 h-13.75 rounded-2xl bg-slate-900 w-full"
            placeholder="confirm new password"
            type="password"
            onChange={(e) => {
              setConfirmNewPasswordError(null);
              setConfirmNewPassword(e.target.value);
            }}
            value={confirmNewPassword}
            required
          />
          {confirmNewPasswordError && (
            <p className="text-red-600 px-2 -mt-1 text-sm ">
              {confirmNewPasswordError}
            </p>
          )}

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
