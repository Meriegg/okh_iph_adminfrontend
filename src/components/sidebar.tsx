import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ContactIcon,
  GlobeIcon,
  ListIcon,
  LogInIcon,
  LogOutIcon,
  SendIcon,
  TvIcon,
  UnlinkIcon,
  UserCircleIcon,
  UserPlusIcon,
} from "lucide-react";
import { api } from "../lib/axios";
import type { TUser } from "../types";
import { Link } from "react-router";
import { queryClient } from "../lib/query-client";
import { UserRoles } from "../constants";

export const Sidebar = () => {
  const user = useQuery<TUser>({
    queryKey: ["user.me"],
    queryFn: async () => {
      return await api.get("/user/me").then((res) => res.data.user);
    },
    retry: false,
  });

  const logOut = useMutation({
    mutationFn: async () => {
      return await api.post("/user/log-out");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user.me"] });
      window.location.reload();
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["user.me"] });
      window.location.reload();
    },
  });

  return (
    <div
      className="h-[calc(100vh-3rem)] max-w-75 sticky top-6 min-w-75 mx-auto bg-(--lifted) rounded-2xl flex flex-col gap-2.5 p-0.75"
      style={{
        alignSelf: "flex-start",
      }}
    >
      <div className="flex flex-col gap-0.75">
        <Link
          to="/"
          className="text-base p-2.5 bg-slate-900 rounded-t-2xl rounded-b-lg font-extrabold"
        >
          LiveSports Admin
        </Link>

        {!!user.data?.id && !user.isLoading && !user.isError && (
          <div className="flex items-center gap-0.75">
            <div className="p-2.5 w-full bg-slate-900 rounded-l-2xl rounded-tl-lg rounded-r-lg max-h-13.75">
              <div>
                <p className="text-xs text-slate-300">user</p>
                <div className="flex items-center gap-2 justify-between">
                  <p className="text-sm font-bold">{user.data?.username}</p>

                  <p className="font-mono! text-xs text-slate-300">
                    {user.data?.role}
                  </p>
                </div>
              </div>
            </div>
            <button
              disabled={logOut.isPending}
              onClick={() => {
                if (!confirm("Are you sure you want to log out?")) return;

                logOut.mutate();
              }}
              className="min-w-13.75 h-13.75 flex items-center rounded-tr-lg justify-center bg-slate-900 rounded-l-lg rounded-r-2xl"
            >
              <LogOutIcon className="w-5 h-5 text-white" strokeWidth={1} />
            </button>
          </div>
        )}

        {user.isError && !user.isLoading && (
          <div className="flex items-center gap-0.75">
            <div className="p-2.5 w-full bg-slate-900 rounded-l-2xl rounded-tl-lg rounded-r-lg max-h-13.75">
              <div>
                <p className="text-xs text-slate-300">auth status</p>
                <div className="flex items-center gap-2 justify-between">
                  <p className="text-sm font-bold">Not Logged In</p>

                  <Link
                    to="/auth/log-in"
                    className="font-mono! text-xs text-slate-300"
                  >
                    log in to continue
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {user.isLoading && (
          <div className="skeleton h-13.75 w-full rounded-b-2xl rounded-t-lg"></div>
        )}
      </div>

      {!!user.data?.id && !user.isLoading && !user.isError && (
        <>
          <div className="flex flex-col gap-0.75">
            <p className="text-xs text-slate-300 p-1.5">Navigation</p>

            {!!user.data?.permission_linkSubmission && (
              <Link
                to="/submit-links"
                className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
              >
                <SendIcon strokeWidth={1} className="w-4 h-4" /> Submit Links
              </Link>
            )}

            <Link
              to="/"
              className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
            >
              <UserCircleIcon strokeWidth={1} className="w-4 h-4" /> Account
            </Link>

            {user.data?.role !== "admin" &&
              user.data?.permission_liveTvSubmission > 0 && (
                <Link
                  to="/manage-livetv"
                  className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
                >
                  <TvIcon strokeWidth={1} className="w-4 h-4" /> LiveTV
                </Link>
              )}
          </div>

          {UserRoles.indexOf(user.data?.role) > 0 && (
            <div className="flex flex-col gap-0.75">
              <p className="text-xs text-slate-300 p-1.5">
                {user.data.role === "admin" ? "Admin" : "Moderation"}
              </p>

              <Link
                to="/manage-users"
                className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
              >
                <ContactIcon strokeWidth={1} className="w-4 h-4" /> Manage Users
              </Link>

              <Link
                to="/manage-schedule"
                className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
              >
                <ListIcon strokeWidth={1} className="w-4 h-4" /> Manage Schedule
              </Link>

              {user.data.role === "admin" && (
                <>
                  <Link
                    to="/manage-website"
                    className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
                  >
                    <GlobeIcon strokeWidth={1} className="w-4 h-4" /> Manage
                    Website
                  </Link>

                  <Link
                    to="/manage-livetv"
                    className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
                  >
                    <TvIcon strokeWidth={1} className="w-4 h-4" /> Manage LiveTV
                  </Link>
                </>
              )}

              <Link
                to="/manage-user-links"
                className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
              >
                <UnlinkIcon strokeWidth={1} className="w-4 h-4" /> Manage User
                Links
              </Link>
            </div>
          )}
        </>
      )}

      {user.isError && !user.isLoading && (
        <div className="flex flex-col  gap-2 h-full">
          <div className="flex flex-col mb-2 gap-0.75 px-0.75">
            <p className="text-2xl font-extrabold">Hello there!</p>
            <p className="text-sm text-slate-300">
              Please choose one of the following methods below to continue.
            </p>
          </div>

          <Link
            to="/auth/log-in"
            className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
          >
            <LogInIcon strokeWidth={1} className="w-4 h-4" /> Log In!
          </Link>

          <div className="flex items-center gap-2">
            <hr className="w-full border-white/5" />

            <p className="text-sm text-slate-300">or</p>

            <hr className="w-full border-white/5" />
          </div>

          <Link
            to="/auth/sign-up"
            className="p-3 hover:bg-(--lifted) rounded-2xl bg-slate-900 flex items-center justify-start gap-2 font-medium text-sm"
          >
            <UserPlusIcon strokeWidth={1} className="w-4 h-4" /> Sign Up!
          </Link>
        </div>
      )}

      <div className="h-full flex flex-col items-center justify-end gap-0.75">
        <p className="text-[10px] text-slate-300 rounded-xl text-center bg-slate-900 w-full px-0.75 py-1.5">
          &copy; 2025 LiveSports Admin. All rights reserved.
        </p>
        <div className="flex items-center justify-evenly w-full px-0.75 py-1.5 bg-slate-900 rounded-xl">
          <a className="text-[10px] underline" href="#">
            Contact
          </a>
          <a className="text-[10px] underline" href="#">
            Website
          </a>
          <a className="text-[10px] underline" href="#">
            Discord
          </a>
          <a className="text-[10px] underline" href="#">
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
};
