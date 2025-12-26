/* eslint-disable react-hooks/set-state-in-effect */

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
import { api } from "@/lib/axios";
import type { TLiveTvChannel, TUser } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import languages from "language-list";
import { Fragment, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

export const Page_ManageLiveTV = () => {
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

  const userChannels = useQuery<{ channels: TLiveTvChannel[] }>({
    queryKey: ["manageLiveTv.all.user"],
    queryFn: async () => {
      return await api
        .get("/manage-livetv/get-channels")
        .then((res) => res.data);
    },
  });

  const adminChannels = useQuery<{ channels: TLiveTvChannel[] }>({
    queryKey: ["manageLiveTv.all.admin"],
    queryFn: async () => {
      return await api
        .get("/manage-livetv/admin/get-channels")
        .then((res) => res.data);
    },
  });

  const [channelName, setChannelName] = useState("");
  const [channelNameError, setChannelNameError] = useState<string | null>();

  const [language, setLanguage] = useState("");
  const [languageError, setLanguageError] = useState<string | null>();

  const [linksJson, setLinksJson] = useState<string[]>([]);
  const [linksJsonError, setLinksJsonError] = useState<string | null>();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>();

  const addChannel = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (!file) {
        setFileError("Channel image is required");
        return;
      }

      formData.append("channelName", channelName);
      formData.append("language", language);
      formData.append("linksJson", JSON.stringify(linksJson));
      formData.append("image", file);

      return await api.post("/manage-livetv/add-channel", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.user"],
      });
      toast.success("Channel added successfully.");
      setChannelName("");
      setLanguage("");
      setLinksJson([]);
      setFile(null);
    },
  });

  const deleteChannel_user = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await api.post("/manage-livetv/delete-channel", {
        id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.user"],
      });
      toast.success("Channel deleted successfully.");
    },
  });

  const deleteChannel_admin = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await api.post("/manage-livetv/admin/delete-channel", {
        id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.user"],
      });
      toast.success("Channel deleted successfully.");
    },
  });

  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editChannelOpen, setEditChannelOpen] = useState(false);
  const adminEditChannel = useMutation({
    mutationFn: async () => {
      if (!editId) return;

      const formData = new FormData();

      formData.append("channelName", channelName);
      formData.append("language", language);
      formData.append("linksJson", JSON.stringify(linksJson));
      formData.append("image", file ?? "");
      formData.append("id", editId);

      return await api.post("/manage-livetv/admin/edit-channel", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.user"],
      });
      toast.success("Channel edited successfully. [admin]");
      setChannelName("");
      setLanguage("");
      setLinksJson([]);
      setFile(null);
      setEditId(null);
    },
  });

  const editChannel = useMutation({
    mutationFn: async () => {
      if (!editId) return;

      const formData = new FormData();

      formData.append("channelName", channelName);
      formData.append("language", language);
      formData.append("linksJson", JSON.stringify(linksJson));
      formData.append("image", file ?? "");
      formData.append("id", editId);

      return await api.post("/manage-livetv/edit-channel", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["manageLiveTv.all.user"],
      });
      toast.success("Channel edited successfully.");
      setChannelName("");
      setLanguage("");
      setLinksJson([]);
      setFile(null);
      setEditId(null);
    },
  });

  const [channels, setChannels] = useState<TLiveTvChannel[]>([]);

  useEffect(() => {
    if (currUser.data?.role === "admin") {
      setChannels(adminChannels.data?.channels ?? []);
    } else {
      setChannels(userChannels.data?.channels ?? []);
    }
  }, [
    currUser.data?.role,
    userChannels.data?.channels,
    adminChannels.data?.channels,
  ]);

  if (!currUser?.data && currUser.isError) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-6 h-full">
      <div className="rounded-2xl flex items-center gap-1 p-0.75 bg-(--lifted) w-full h-13.75">
        <div className="rounded-2xl flex items-center justify-between px-4 h-full w-full bg-slate-900">
          <p className="text-2xl font-bold">
            <span className="text-sm text-slate-300 font-medium">
              {currUser.data?.role === "admin" ? "admin" : "navigation"} /{" "}
            </span>
            Manage LiveTV
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="rounded-2xl bg-slate-900 h-full px-4 min-w-fit text-sm font-medium flex items-center gap-1.5">
              <PlusIcon className="w-4 h-4" strokeWidth={1} /> Add channel
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add a LiveTV channel</AlertDialogTitle>
              <AlertDialogDescription>
                Complete all of the fields below.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-1">
              <input
                className="px-4 h-13.75 rounded-2xl bg-white/5 w-full"
                placeholder="channel name"
                onChange={(e) => {
                  setChannelName(e.target.value);
                  setChannelNameError(null);
                }}
                value={channelName}
                required
              />
              {channelNameError && (
                <p className="text-red-600 px-2 -mt-1 text-sm ">
                  {channelNameError}
                </p>
              )}

              <Select
                value={language}
                onValueChange={(val) => {
                  setLanguage(val as string);
                  setLanguageError(null);
                }}
                required
              >
                <SelectTrigger className="h-13.75! border-0 rounded-2xl bg-white/5 w-full">
                  <SelectValue placeholder="select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages()
                    .getLanguageCodes()
                    .map((langCode: string, idx: number) => (
                      <SelectItem value={langCode} key={idx}>
                        {languages().getLanguageName(langCode)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {languageError && (
                <p className="text-red-600 px-2 -mt-1 text-sm ">
                  {languageError}
                </p>
              )}

              <div className="justify-between flex mt-1 items-center">
                <p className="text-sm text-slate-300 font-medium">
                  Stream links
                </p>

                <button
                  onClick={() => {
                    setLinksJson([...linksJson, ""]);
                    setLinksJsonError(null);
                  }}
                  className="text-sm underline font-medium flex items-center gap-1.5"
                >
                  <PlusIcon className="w-4 h-4" /> Add link
                </button>
              </div>
              <hr />

              {!linksJson?.length && (
                <p className="text-sm text-center font-medium my-2">
                  No links added yet.
                </p>
              )}

              {linksJson?.map((link, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <input
                    className="px-4 h-13.75 rounded-2xl bg-white/5 w-full"
                    placeholder={`link ${idx + 1}`}
                    onChange={(e) => {
                      const links = [...linksJson];
                      links[idx] = e.target.value;
                      setLinksJson(links);
                      setLinksJsonError(null);
                    }}
                    value={link}
                    required
                  />

                  <button
                    onClick={() => {
                      const links = [...linksJson];
                      links.splice(idx, 1);
                      setLinksJson(links);
                      setLinksJsonError(null);
                    }}
                    className="min-w-13.75 min-h-13.75 flex bg-white/5 rounded-2xl items-center justify-center"
                  >
                    <TrashIcon className="w-4 h-4" strokeWidth={1} />
                  </button>
                </div>
              ))}

              {linksJsonError && (
                <p className="text-red-600 px-2 -mt-1 text-sm ">
                  {linksJsonError}
                </p>
              )}

              <hr />

              <p className="text-sm mt-1 text-slate-300 font-medium">
                Channel image (required)
              </p>
              <input
                className="px-4 py-4 rounded-2xl bg-white/5 w-full"
                type="file"
                accept="image/*"
                placeholder="channel image"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setFileError(null);
                }}
                required
              />
              {fileError && (
                <p className="text-red-600 px-2 -mt-1 text-sm ">{fileError}</p>
              )}

              <AlertDialogAction asChild>
                <Button
                  onClick={(e) => {
                    if (!channelName.trim()) {
                      setChannelNameError("Channel name is required");
                      e.preventDefault();
                      return;
                    }

                    if (!language.trim()) {
                      setLanguageError("Language is required");
                      e.preventDefault();
                      return;
                    }

                    if (
                      !linksJson.map((link) => link?.trim())?.join("").length
                    ) {
                      setLinksJsonError("At least one link is required");
                      e.preventDefault();
                      return;
                    }

                    if (!file) {
                      setFileError("Channel image is required");
                      e.preventDefault();
                      return;
                    }

                    addChannel.mutate();
                  }}
                  disabled={addChannel.isPending}
                  className="w-full mt-4"
                >
                  Continue
                </Button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {(channels ?? [])?.map((channel) => (
          <Fragment key={channel.id}>
            <AlertDialog
              open={editChannelOpen}
              onOpenChange={(val) => {
                setEditChannelOpen(false);
                if (val === false) {
                  setTimeout(() => {
                    setChannelName("");
                    setLanguage("");
                    setLinksJson([]);
                    setFile(null);
                    setEditId(null);
                  }, 500);
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit channel</AlertDialogTitle>
                  <AlertDialogDescription>
                    Complete all of the fields below.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex flex-col gap-1">
                  <input
                    className="px-4 h-13.75 rounded-2xl bg-white/5 w-full"
                    placeholder="channel name"
                    onChange={(e) => {
                      setChannelName(e.target.value);
                      setChannelNameError(null);
                    }}
                    value={channelName}
                    required
                  />
                  {channelNameError && (
                    <p className="text-red-600 px-2 -mt-1 text-sm ">
                      {channelNameError}
                    </p>
                  )}

                  <Select
                    value={language}
                    onValueChange={(val) => {
                      setLanguage(val as string);
                      setLanguageError(null);
                    }}
                    required
                  >
                    <SelectTrigger className="h-13.75! border-0 rounded-2xl bg-white/5 w-full">
                      <SelectValue placeholder="select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages()
                        .getLanguageCodes()
                        .map((langCode: string, idx: number) => (
                          <SelectItem value={langCode} key={idx}>
                            {languages().getLanguageName(langCode)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {languageError && (
                    <p className="text-red-600 px-2 -mt-1 text-sm ">
                      {languageError}
                    </p>
                  )}

                  <div className="justify-between flex mt-1 items-center">
                    <p className="text-sm text-slate-300 font-medium">
                      Stream links
                    </p>

                    <button
                      onClick={() => {
                        setLinksJson([...linksJson, ""]);
                        setLinksJsonError(null);
                      }}
                      className="text-sm underline font-medium flex items-center gap-1.5"
                    >
                      <PlusIcon className="w-4 h-4" /> Add link
                    </button>
                  </div>
                  <hr />

                  {!linksJson?.length && (
                    <p className="text-sm text-center font-medium my-2">
                      No links added yet.
                    </p>
                  )}

                  {linksJson?.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        className="px-4 h-13.75 rounded-2xl bg-white/5 w-full"
                        placeholder={`link ${idx + 1}`}
                        onChange={(e) => {
                          const links = [...linksJson];
                          links[idx] = e.target.value;
                          setLinksJson(links);
                          setLinksJsonError(null);
                        }}
                        value={link}
                        required
                      />

                      <button
                        onClick={() => {
                          const links = [...linksJson];
                          links.splice(idx, 1);
                          setLinksJson(links);
                          setLinksJsonError(null);
                        }}
                        className="min-w-13.75 min-h-13.75 flex bg-white/5 rounded-2xl items-center justify-center"
                      >
                        <TrashIcon className="w-4 h-4" strokeWidth={1} />
                      </button>
                    </div>
                  ))}

                  {linksJsonError && (
                    <p className="text-red-600 px-2 -mt-1 text-sm ">
                      {linksJsonError}
                    </p>
                  )}

                  <hr />

                  <p className="text-sm mt-1 text-slate-300 font-medium">
                    Channel image (optional)
                  </p>
                  <input
                    className="px-4 py-4 rounded-2xl bg-white/5 w-full"
                    type="file"
                    accept="image/*"
                    placeholder="channel image"
                    onChange={(e) => {
                      setFile(e.target.files?.[0] ?? null);
                      setFileError(null);
                    }}
                    required
                  />
                  {fileError && (
                    <p className="text-red-600 px-2 -mt-1 text-sm ">
                      {fileError}
                    </p>
                  )}

                  <AlertDialogAction asChild>
                    <Button
                      onClick={(e) => {
                        if (!channelName.trim()) {
                          setChannelNameError("Channel name is required");
                          e.preventDefault();
                          return;
                        }

                        if (!language.trim()) {
                          setLanguageError("Language is required");
                          e.preventDefault();
                          return;
                        }

                        if (
                          !linksJson.map((link) => link?.trim())?.join("")
                            .length
                        ) {
                          setLinksJsonError("At least one link is required");
                          e.preventDefault();
                          return;
                        }

                        if (currUser.data?.id !== editUserId) {
                          console.log("admin");
                          adminEditChannel.mutate();
                        } else {
                          console.log("user");
                          editChannel.mutate();
                        }
                      }}
                      disabled={
                        editChannel.isPending || adminEditChannel.isPending
                      }
                      className="w-full mt-4"
                    >
                      Continue
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <div className="w-full p-0.75 flex flex-col gap-1 h-fit rounded-2xl bg-(--lifted)">
              {currUser.data?.role === "admin" && (
                <p className="font-medium w-full px-4 h-13 text-sm flex items-center gap-2 justify-start bg-slate-900 rounded-2xl">
                  <span className="text-xs -mb-0.5 text-slate-300">user</span>
                  {
                    manageUsersAll.data?.find(
                      (user) => user.id === channel.user_id
                    )?.username
                  }{" "}
                  {channel.user_id === currUser.data?.id ? "(you)" : ""}
                </p>
              )}

              <div className="flex items-center gap-1">
                <div className="min-w-13 min-h-13 rounded-2xl px-1 bg-slate-900 flex items-center justify-center">
                  <img
                    className="w-full h-auto"
                    src={`http://localhost:4000/images/${channel.channel_image}`}
                  />
                </div>

                <p className="font-medium w-full px-4 h-13 flex items-center justify-start bg-slate-900 rounded-2xl">
                  {channel.channel_name}
                </p>

                <button
                  onClick={() => {
                    setEditChannelOpen(true);
                    setChannelName(channel.channel_name);
                    setLanguage(channel.language);
                    setLinksJson(JSON.parse(channel.links_json));
                    setFile(null);
                    setEditId(channel.id);
                    setEditUserId(channel.user_id);
                  }}
                  className="min-h-13 min-w-13 rounded-2xl flex items-center justify-center bg-slate-900"
                >
                  <EditIcon className="w-4 h-4" strokeWidth={1} />
                </button>

                <button
                  onClick={() => {
                    if (
                      !confirm(
                        `Are you sure you want to delete this channel? [${channel.channel_name}]`
                      )
                    )
                      return;

                    if (currUser.data?.role === "admin") {
                      deleteChannel_admin.mutate({
                        id: channel.id,
                      });
                    } else {
                      deleteChannel_user.mutate({
                        id: channel.id,
                      });
                    }
                  }}
                  className="min-h-13 min-w-13 rounded-2xl flex items-center justify-center bg-slate-900"
                >
                  <TrashIcon className="w-4 h-4" strokeWidth={1} />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <p className="font-medium w-full px-4 h-13 text-sm flex items-start flex-col justify-center bg-slate-900 rounded-2xl">
                  <span className="text-xs -mb-0.5 text-slate-300">
                    language
                  </span>
                  {channel.language}
                </p>

                <p className="font-medium w-full px-4 h-13 text-sm flex items-start flex-col justify-center bg-slate-900 rounded-2xl">
                  <span className="text-xs -mb-0.5 text-slate-300">links</span>
                  {JSON.parse(channel.links_json)?.length}
                </p>
              </div>

              {JSON.parse(channel.links_json).map(
                (link: string, idx: number) => (
                  <p
                    key={idx}
                    className="font-medium w-full px-4 h-13 text-sm flex items-center gap-2 justify-start bg-slate-900 rounded-2xl"
                  >
                    <span className="text-xs -mb-0.5 text-slate-300">
                      #{idx + 1}
                    </span>
                    {link}
                  </p>
                )
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
