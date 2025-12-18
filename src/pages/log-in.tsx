import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/axios";
import type { AxiosError } from "axios";
import { queryClient } from "../lib/query-client";

export const Page_LogIn = () => {
  const navigate = useNavigate();

  const [generalError, setGeneralError] = useState<string | null>();
  const [emailError, setEmailError] = useState<string | null>();
  const [passwordError, setPasswordError] = useState<string | null>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const logIn = useMutation({
    mutationFn: async () => {
      return await api.post("/auth/log-in", {
        email,
        password,
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
          if (formError.field === "email") {
            setEmailError(formError.message);
          }
          if (formError.field === "password") {
            setPasswordError(formError.message);
          }
        }
        return;
      }

      setGeneralError(
        error?.response?.data?.message ||
          "Unable to log in, please try again later."
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
          <div className="p-4 rounded-2xl bg-slate-900">
            <p className="text-2xl font-extrabold">Log into your account!</p>
            <p className="text-sm text-slate-300 mt-1">
              Continue by logging into your existing streamer account.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!email.trim()) {
              setEmailError("Email is required");
              return;
            }

            if (!password.trim()) {
              setPasswordError("Password is required");
              return;
            }

            logIn.mutate();
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
            placeholder="your email"
            type="email"
            onChange={(e) => {
              setEmailError(null);
              setEmail(e.target.value);
            }}
            value={email}
            required
          />
          {emailError && (
            <p className="text-red-600 px-2 -mt-1 text-sm ">{emailError}</p>
          )}

          <input
            className="px-4 h-13.75 rounded-2xl bg-slate-900 w-full"
            placeholder="your password"
            type="password"
            onChange={(e) => {
              setPasswordError(null);
              setPassword(e.target.value);
            }}
            value={password}
            required
          />
          {passwordError && (
            <p className="text-red-600 px-2 -mt-1 text-sm ">{passwordError}</p>
          )}

          <button
            type="submit"
            disabled={logIn.isPending}
            className="flex h-13.75 px-4 rounded-2xl bg-slate-900 items-center justify-between"
          >
            Continue <ArrowRight className="w-6 h-6" strokeWidth={1} />
          </button>
        </form>

        <div className=" flex flex-col gap-0.75 bg-(--lifted) p-0.75 rounded-2xl w-full mx-auto">
          <Link
            to="/auth/sign-up"
            className="p-2 rounded-2xl bg-slate-900 text-center text-sm hover:underline"
          >
            No account? Sign up here!
          </Link>
        </div>
      </div>
    </div>
  );
};
