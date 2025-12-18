import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";
import type { TUser } from "../types";
import { Link } from "react-router";

export const Page_Account = () => {
  const user = useQuery<TUser>({
    queryKey: ["user.me"],
    queryFn: async () => {
      return await api.get("/user/me").then((res) => res.data.user);
    },
    retry: false,
  });

  if (user.isLoading) {
    return <div className="w-full h-full"></div>;
  }

  if (!user?.data?.id && !user.isLoading) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="max-w-112.5 flex flex-col gap-2 mx-auto">
        <div className=" flex flex-col gap-0.75 bg-(--lifted) p-0.75 rounded-2xl w-full mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900">
            <p className="text-2xl font-extrabold">
              Hello, {user.data?.username}
            </p>
            <p className="text-sm text-slate-300 mt-1">
              joined on{" "}
              {new Date(user.data?.created_at || "").toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-0.75 bg-(--lifted) p-0.75 rounded-2xl w-full mx-auto">
          <p className="text-sm text-slate-300 px-2 pt-1">uid</p>
          <input
            className="px-4 h-13.75 rounded-2xl bg-slate-900 w-full opacity-80"
            placeholder="username"
            readOnly
            value={user.data?.id}
          />

          <p className="text-sm text-slate-300 px-2 pt-1">username</p>
          <input
            className="px-4 h-13.75 rounded-2xl bg-slate-900 w-full opacity-80"
            placeholder="username"
            readOnly
            value={user.data?.username}
          />

          <p className="text-sm text-slate-300 px-2 pt-1">email</p>
          <input
            className="px-4 h-13.75 rounded-2xl bg-slate-900 w-full opacity-80"
            placeholder="email"
            type="email"
            readOnly
            value={user.data?.email}
          />
        </div>

        <div className="flex items-center gap-0.75 bg-(--lifted) p-0.75 rounded-2xl w-full mx-auto">
          <Link
            to="/change-password"
            className="p-2 rounded-2xl bg-slate-900 text-center text-sm hover:underline w-full"
          >
            Change password
          </Link>
          <Link
            to="/change-pfp"
            className="p-2 rounded-2xl bg-slate-900 text-center text-sm hover:underline w-full"
          >
            Change profile picture
          </Link>
        </div>
      </div>
    </div>
  );
};
