/* eslint-disable no-extra-boolean-cast */
import { Loader } from "@/components/loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/axios";
import { queryClient } from "@/lib/query-client";
import type { TUser } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowDownUpIcon,
  AxeIcon,
  CheckCircle2Icon,
  LockIcon,
  MenuIcon,
  TagIcon,
  TrashIcon,
  TvIcon,
  UserIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Page_ManageUsers = () => {
  const currUser = useQuery<TUser>({
    queryKey: ["user.me"],
    queryFn: async () => {
      return await api.get("/user/me").then((res) => res.data.user);
    },
    retry: false,
  });

  const manageUsersAll = useQuery<TUser[]>({
    queryKey: ["manageUsers.all"],
    queryFn: async () => {
      return await api
        .get("/manage-users/get-users")
        .then((res) => res.data.users);
    },
  });

  const [currRole, setCurrRole] = useState<"user" | "moderator" | "admin">(
    "user"
  );
  const changeUserRole = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/set-role", {
        userId: data.userId,
        role: currRole,
      });
    },
    onSuccess: () => {
      setCurrRole("user");
      toast.success("Role changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const [currLabel, setCurrLabel] = useState<
    "silver" | "gold" | "diamond" | "-no_label-"
  >("-no_label-");
  const changeUserLabel = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/set-label", {
        userId: data.userId,
        label: currLabel,
      });
    },
    onSuccess: () => {
      toast.success("Label changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const [currLinkOrder, setCurrLinkOrder] = useState<number>();
  const changeLinkOrder = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/set-link-order", {
        userId: data.userId,
        order: currLinkOrder,
      });
    },
    onSuccess: () => {
      toast.success("Link order changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const [currEmbedOrder, setCurrEmbedOrder] = useState<number>();
  const changeEmbedOrder = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/set-embed-order", {
        userId: data.userId,
        order: currEmbedOrder,
      });
    },
    onSuccess: () => {
      toast.success("Embed order changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/delete-user", {
        userId: data.userId,
      });
    },
    onSuccess: () => {
      toast.success("User deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const toggleUserVerification = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/toggle-verified", {
        userId: data.userId,
      });
    },
    onSuccess: () => {
      toast.success("Verification status changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const togglePostPermission = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/toggle-post-permission", {
        userId: data.userId,
      });
    },
    onSuccess: () => {
      toast.success("Post permission changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const toggleEmbedPermission = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/toggle-embed-submission", {
        userId: data.userId,
      });
    },
    onSuccess: () => {
      toast.success("Embed permission changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const togglePopupPermission = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/toggle-popup-submission", {
        userId: data.userId,
      });
    },
    onSuccess: () => {
      toast.success("Popup permission changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const toggleBanned = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/toggle-banned", {
        userId: data.userId,
      });
    },
    onSuccess: () => {
      toast.success("Ban status changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const toggleLiveTV = useMutation({
    mutationFn: async (data: { userId: string }) => {
      return await api.post("/manage-users/toggle-livetv-submission", {
        userId: data.userId,
      });
    },
    onSuccess: () => {
      toast.success("LiveTV permission changed successfully.");
      queryClient.invalidateQueries({ queryKey: ["manageUsers.all"] });
    },
  });

  const [searchBy, setSearchBy] = useState<"username" | "email" | "uid">(
    "username"
  );
  const [query, setQuery] = useState("");

  const currUsers = useMemo(() => {
    return (manageUsersAll.data ?? []).filter((user) => {
      switch (searchBy) {
        case "username":
          return user.username.toLowerCase().includes(query.toLowerCase());
        case "email":
          return user.email.toLowerCase().includes(query.toLowerCase());
        case "uid":
          return user.id.toLowerCase().includes(query.toLowerCase());
        default:
          return true;
      }
    });
  }, [manageUsersAll.data, searchBy, query]);

  if (!currUser?.data && currUser.isError) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <div className="rounded-2xl p-0.75 bg-(--lifted) w-full h-13.75">
        <div className="rounded-2xl flex items-center justify-between px-4 h-full w-full bg-slate-900">
          <p className="text-2xl font-bold">
            <span className="text-sm text-slate-300 font-medium">
              {currUser.data?.role === "moderator" ? "moderation" : "admin"} /{" "}
            </span>
            Manage users
          </p>
        </div>
      </div>

      <div className="p-0.75 flex items-center gap-1 w-full rounded-full bg-(--lifted)">
        <Select
          value={searchBy}
          onValueChange={(val) =>
            setSearchBy(val as "username" | "email" | "uid")
          }
        >
          <SelectTrigger className="h-10! border-none bg-slate-900!">
            <SelectValue placeholder="Search by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="username">By Username</SelectItem>
            <SelectItem value="email">By Email</SelectItem>
            <SelectItem value="uid">By UID</SelectItem>
          </SelectContent>
        </Select>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="h-10 w-full bg-slate-900 rounded-2xl px-4"
        />
      </div>

      {manageUsersAll.isLoading && <Loader />}
      {!manageUsersAll.isLoading && !!manageUsersAll.data?.length && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Banned</TableHead>
              <TableHead>
                Post <br /> Allowed
              </TableHead>
              <TableHead>
                Embed / Popup <br /> Allowed
              </TableHead>

              <TableHead>LiveTV</TableHead>

              <TableHead className="text-right">
                Link / Embed <br /> Orders
              </TableHead>

              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <input readOnly value={user.id} className="max-w-25 w-full" />
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user?.label ?? "-No-"}</TableCell>
                <TableCell>{!!user.verified ? "Yes" : "No"}</TableCell>
                <TableCell>{!!user.banned ? "Yes" : "No"}</TableCell>
                <TableCell>
                  {!!user.permission_linkSubmission ? "Yes" : "No"}
                </TableCell>
                <TableCell>
                  {!!user.permission_embedSubmission ? "Yes" : "No"}{" "}
                  <span className="text-slate-500">/</span>{" "}
                  {!!user.permission_popupSubmission ? "Yes" : "No"}
                </TableCell>

                <TableCell>
                  {!!user.permission_liveTvSubmission ? "Yes" : "No"}{" "}
                </TableCell>

                <TableCell className="text-right">
                  {user.linkOrder ?? "N/A"}{" "}
                  <span className="text-slate-500">/</span>{" "}
                  {user.embedOrder ?? "N/A"}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end w-full">
                    {user.id !== currUser.data?.id && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="size-7.5 rounded-lg bg-white/10 flex items-center justify-center">
                            <MenuIcon className="w-4 h-4" strokeWidth={1} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-1.5 flex flex-col gap-0.5 max-w-75">
                          <p className="text-xs p-1 text-slate-300 font-medium">
                            Actions
                          </p>

                          <Button
                            onClick={() => {
                              if (
                                !confirm(
                                  !!!user.permission_embedSubmission
                                    ? "Are you sure you want to BAN the user?"
                                    : "Are you sure you want to UNBAN the user?"
                                )
                              )
                                return;

                              toggleBanned.mutate({
                                userId: user.id,
                              });
                            }}
                            size="sm"
                            className="w-full justify-start"
                          >
                            <AxeIcon className="w-3 h-3" strokeWidth={1} />{" "}
                            {!!!user.banned ? "BAN" : "UNBAN"}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                className="w-full justify-start"
                              >
                                <TagIcon className="w-3 h-3" strokeWidth={1} />{" "}
                                Set label
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Change label for user
                                  {user.username} / {user.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <p className="text-sm -mb-3">Label:</p>
                              <Select
                                value={currLabel}
                                onValueChange={(val) =>
                                  setCurrLabel(
                                    val as
                                      | "diamond"
                                      | "gold"
                                      | "silver"
                                      | "-no_label-"
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="select a label" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="diamond">
                                    Diamond
                                  </SelectItem>
                                  <SelectItem value="gold">Gold</SelectItem>
                                  <SelectItem value="silver">Silver</SelectItem>
                                  <SelectItem value="-no_label-">
                                    No label
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              <AlertDialogAction asChild>
                                <Button
                                  disabled={changeUserLabel.isPending}
                                  onClick={() => {
                                    changeUserLabel.mutate({
                                      userId: user.id,
                                    });
                                  }}
                                >
                                  Yes, change label
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                className="w-full justify-start"
                              >
                                <ArrowDownUpIcon
                                  className="w-3 h-3"
                                  strokeWidth={1}
                                />{" "}
                                Set link order
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Set link order for user
                                  {user.username} / {user.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <p className="text-sm -mb-3">Order:</p>
                              <input
                                className="px-4 h-13.75 rounded-2xl bg-white/5 w-full"
                                placeholder="order"
                                type="number"
                                onChange={(e) =>
                                  setCurrLinkOrder(e.target.valueAsNumber)
                                }
                                value={currLinkOrder}
                                required
                              />

                              <AlertDialogAction asChild>
                                <Button
                                  disabled={changeLinkOrder.isPending}
                                  onClick={() => {
                                    changeLinkOrder.mutate({
                                      userId: user.id,
                                    });
                                  }}
                                >
                                  Yes, change order
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                className="w-full justify-start"
                              >
                                <ArrowDownUpIcon
                                  className="w-3 h-3"
                                  strokeWidth={1}
                                />{" "}
                                Set embed order
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Set embed order for user
                                  {user.username} / {user.email}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <p className="text-sm -mb-3">Order:</p>
                              <input
                                className="px-4 h-13.75 rounded-2xl bg-white/5 w-full"
                                placeholder="order"
                                type="number"
                                onChange={(e) =>
                                  setCurrEmbedOrder(e.target.valueAsNumber)
                                }
                                value={currEmbedOrder}
                                required
                              />

                              <AlertDialogAction asChild>
                                <Button
                                  disabled={changeEmbedOrder.isPending}
                                  onClick={() => {
                                    changeEmbedOrder.mutate({
                                      userId: user.id,
                                    });
                                  }}
                                >
                                  Yes, change order
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogContent>
                          </AlertDialog>

                          {currUser.data?.role === "admin" && (
                            <>
                              <Button
                                onClick={() => {
                                  if (
                                    !confirm(
                                      !!!user.verified
                                        ? "Are you sure you want to set the user as verified?"
                                        : "Are you sure you want to set the user as unverified?"
                                    )
                                  )
                                    return;

                                  toggleUserVerification.mutate({
                                    userId: user.id,
                                  });
                                }}
                                size="sm"
                                className="w-full justify-start"
                              >
                                <CheckCircle2Icon
                                  className="w-3 h-3"
                                  strokeWidth={1}
                                />{" "}
                                {!!!user.verified
                                  ? "Set as verified"
                                  : "Set as unverified"}
                              </Button>

                              <Button
                                onClick={() => {
                                  if (
                                    !confirm(
                                      !!!user.permission_liveTvSubmission
                                        ? "Are you sure you want to allow the user to post live tv?"
                                        : "Are you sure you want to disallow the user to post live tv?"
                                    )
                                  )
                                    return;

                                  toggleLiveTV.mutate({
                                    userId: user.id,
                                  });
                                }}
                                size="sm"
                                className="w-full justify-start"
                              >
                                <TvIcon className="w-3 h-3" strokeWidth={1} />{" "}
                                {!!!user.permission_liveTvSubmission
                                  ? "Allow LiveTV"
                                  : "Disallow LiveTV"}
                              </Button>

                              <Button
                                onClick={() => {
                                  if (
                                    !confirm(
                                      !!!user.permission_linkSubmission
                                        ? "Are you sure you want to allow the user to post links?"
                                        : "Are you sure you want to disallow the user to post links?"
                                    )
                                  )
                                    return;

                                  togglePostPermission.mutate({
                                    userId: user.id,
                                  });
                                }}
                                size="sm"
                                className="w-full justify-start"
                              >
                                <LockIcon className="w-3 h-3" strokeWidth={1} />{" "}
                                {!!!user.permission_linkSubmission
                                  ? "Allow link submission"
                                  : "Disallow link submission"}
                              </Button>

                              {!!user?.permission_linkSubmission && (
                                <>
                                  <Button
                                    onClick={() => {
                                      if (
                                        !confirm(
                                          !!!user.permission_embedSubmission
                                            ? "Are you sure you want to allow the user to post embeds?"
                                            : "Are you sure you want to disallow the user to post embeds?"
                                        )
                                      )
                                        return;

                                      toggleEmbedPermission.mutate({
                                        userId: user.id,
                                      });
                                    }}
                                    size="sm"
                                    className="w-full justify-start"
                                  >
                                    <LockIcon
                                      className="w-3 h-3"
                                      strokeWidth={1}
                                    />{" "}
                                    {!!!user.permission_embedSubmission
                                      ? "Allow embeds"
                                      : "Disallow embeds"}
                                  </Button>

                                  <Button
                                    onClick={() => {
                                      if (
                                        !confirm(
                                          !!!user.permission_popupSubmission
                                            ? "Are you sure you want to allow the user to post popups?"
                                            : "Are you sure you want to disallow the user to post popups?"
                                        )
                                      )
                                        return;

                                      togglePopupPermission.mutate({
                                        userId: user.id,
                                      });
                                    }}
                                    size="sm"
                                    className="w-full justify-start"
                                  >
                                    <LockIcon
                                      className="w-3 h-3"
                                      strokeWidth={1}
                                    />{" "}
                                    {!!!user.permission_popupSubmission
                                      ? "Allow popups"
                                      : "Disallow popups"}
                                  </Button>
                                </>
                              )}

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="w-full justify-start"
                                  >
                                    <UserIcon
                                      className="w-3 h-3"
                                      strokeWidth={1}
                                    />{" "}
                                    Set role
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Change role for user
                                      {user.username} / {user.email}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <p className="text-sm -mb-3">Role:</p>
                                  <Select
                                    value={currRole}
                                    onValueChange={(val) =>
                                      setCurrRole(
                                        val as "user" | "moderator" | "admin"
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">User</SelectItem>
                                      <SelectItem value="moderator">
                                        Moderator
                                      </SelectItem>
                                      <SelectItem value="admin">
                                        Admin
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <AlertDialogAction asChild>
                                    <Button
                                      disabled={changeUserRole.isPending}
                                      onClick={() => {
                                        changeUserRole.mutate({
                                          userId: user.id,
                                        });
                                      }}
                                    >
                                      Yes, change role
                                    </Button>
                                  </AlertDialogAction>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="w-full justify-start"
                                  >
                                    <TrashIcon
                                      className="w-3 h-3"
                                      strokeWidth={1}
                                    />{" "}
                                    Delete user
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Continue?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete user{" "}
                                      {user.username} / {user.email}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogAction asChild>
                                    <Button
                                      disabled={deleteUser.isPending}
                                      onClick={() => {
                                        deleteUser.mutate({
                                          userId: user.id,
                                        });
                                      }}
                                    >
                                      Yes, delete user
                                    </Button>
                                  </AlertDialogAction>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
