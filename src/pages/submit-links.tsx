import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/axios";
import type { TMatch, TUser, TUserLink } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { EditIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchSelect } from "@/components/ui/search-select";
import { PriorityGroups } from "@/constants";
import { capitalizeFirstLetter } from "@/utils/capitalize-first-letter";
import {
  StreamerLinkForm,
  type UserLinkSubmitData,
} from "@/components/forms/streamer-link-form";

export const Page_SubmitLinks = () => {
  const currUser = useQuery<TUser>({
    queryKey: ["user.me"],
    queryFn: async () => {
      return await api.get("/user/me").then((res) => res.data.user);
    },
    retry: false,
  });

  const adminNotice = useQuery<string>({
    queryKey: ["adminNotice"],
    queryFn: async () => {
      return await api.get("/admin-notice").then((res) => res.data?.notice);
    },
  });

  const dbMatches = useQuery<TMatch[]>({
    queryFn: async () => {
      return await api
        .get<{ matches: TMatch[] }>("/submit-links/available-matches")
        .then((res) => res.data.matches);
    },
    queryKey: ["submitLinks.matches"],
  });

  const userLinks = useQuery<{ links: TUserLink[] }>({
    queryKey: ["userLinks.user"],
    queryFn: async () => {
      return await api
        .get<{ links: TUserLink[] }>("/submit-links/get-user-links")
        .then((res) => res.data);
    },
  });

  const [sportQuery, setSportQuery] = useState("");
  const [leagueQuery, setLeagueQuery] = useState("");
  const [matchIdQuery, setMatchIdQuery] = useState("");
  const [linkQuery, setLinkQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");

  const submittedMatchIDs = useMemo(() => {
    return Array.from(
      new Set(userLinks.data?.links?.map((link) => link.match_id) ?? [])
    );
  }, [userLinks.data?.links]);

  const matches = useMemo(() => {
    return (dbMatches.data ?? []).filter((match) =>
      submittedMatchIDs.includes(match.id)
    );
  }, [dbMatches.data, submittedMatchIDs]);

  const sports = useMemo(() => {
    return Array.from(new Set(matches.map((match) => match.sport) ?? []));
  }, [matches]);

  const leaguesByCountry = useMemo(() => {
    const leaguesByCountry: Record<string, string[]> = {};

    for (const match of (matches ?? []).sort((a, b) =>
      a.league_country.localeCompare(b.league_country)
    )) {
      const existingArr = leaguesByCountry[match.league_country] ?? [];
      if (existingArr.includes(match.league)) continue;
      existingArr.push(match.league);
      leaguesByCountry[match.league_country] = existingArr;
    }

    return leaguesByCountry;
  }, [matches]);

  const [editId, setEditId] = useState<string | null>(null);
  const [isFormopen, setIsFormOpen] = useState(false);

  const addLink = useMutation({
    mutationFn: async ({
      inpMatchId,
      name,
      link,
      type,
      country,
      language,
      adsNumber,
    }: UserLinkSubmitData & { inpMatchId: string }) => {
      return await api.post("/submit-links/submit-link", {
        name,
        link,
        type,
        country,
        language,
        adsNumber,
        matchId: inpMatchId,
      });
    },
    onSuccess: () => {
      toast.success("Link added successfully.");
      setIsFormOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["submitLinks.matches"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userLinks.user"],
      });
    },
  });

  const editLink = useMutation({
    mutationFn: async ({
      id,
      inpMatchId,
      name,
      link,
      type,
      country,
      language,
      adsNumber,
    }: UserLinkSubmitData & {
      id: string;
      inpMatchId: string;
    }) => {
      return await api.post("/submit-links/update-link", {
        name,
        link,
        type,
        country,
        language,
        adsNumber,
        matchId: inpMatchId,
        id,
      });
    },
    onSuccess: () => {
      setIsFormOpen(false);
      toast.success("Link updated successfully.");
      queryClient.invalidateQueries({
        queryKey: ["submitLinks.matches"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userLinks.user"],
      });
      setEditId(null);
      // setExcludeSubmittedMatches(true);
    },
  });

  const deleteLink = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await api.post("/submit-links/delete-link", {
        id,
      });
    },
    onSuccess: () => {
      toast.success("Link deleted successfully.");
      queryClient.invalidateQueries({
        queryKey: ["submitLinks.matches"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userLinks.user"],
      });
    },
  });

  const deleteLinks = useMutation({
    mutationFn: async ({ ids }: { ids: string[] }) => {
      return await api.post("/submit-links/delete-links", {
        ids,
      });
    },
    onSuccess: () => {
      toast.success("Links deleted successfully.");
      queryClient.invalidateQueries({
        queryKey: ["submitLinks.matches"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userLinks.user"],
      });
    },
  });

  const currLinks = useMemo(
    () =>
      userLinks.data?.links
        ?.filter((link) => {
          const dbMatch = dbMatches.data?.find((m) => m.id === link.match_id);

          return !!dbMatch;
        })
        ?.filter((link) => {
          const dbMatch = dbMatches.data?.find((m) => m.id === link.match_id);

          if (sportQuery) return dbMatch?.sport === sportQuery;

          return true;
        })
        ?.filter((link) => {
          const dbMatch = dbMatches.data?.find((m) => m.id === link.match_id);

          if (leagueQuery && leagueQuery !== "all_leagues")
            return dbMatch?.league === leagueQuery.split("::").at(0);

          return true;
        })
        ?.filter((link) => {
          if (matchIdQuery) return link.match_id === matchIdQuery;

          return true;
        })
        ?.filter((link) => {
          if (linkQuery) return link.link.includes(linkQuery);

          return true;
        })
        ?.filter((link) => {
          if (typeQuery && typeQuery !== "-all-")
            return link.type === typeQuery;

          return true;
        }),
    [
      userLinks.data?.links,
      dbMatches.data,
      sportQuery,
      leagueQuery,
      matchIdQuery,
      linkQuery,
      typeQuery,
    ]
  );

  return (
    <div className="w-full flex flex-col gap-6 h-full">
      <div className="rounded-2xl flex items-center gap-1 p-0.75 bg-(--lifted) w-full min-h-13.75">
        <div className="rounded-2xl flex items-center justify-between px-4 h-13.75 w-full bg-slate-900">
          <p className="text-2xl font-bold">
            <span className="text-sm text-slate-300 font-medium">
              navigation /
            </span>{" "}
            Submit Links
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="rounded-2xl bg-slate-900 h-13.75 px-4 min-w-fit text-sm font-medium flex items-center gap-1.5"
        >
          <PlusIcon className="w-4 h-4" strokeWidth={1} /> Add link
        </button>
      </div>

      {isFormopen && (
        <div className="fixed z-50 top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center">
          <div className="w-full max-w-200 rounded-2xl flex flex-col gap-6 border bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-semibold">Submit Stream</p>
                <p className="text-sm text-slate-300">
                  Complete all fields below to continue
                </p>
              </div>

              <div className="flex items-center">
                <p className="text-xs text-slate-300 px-4 py-2 rounded-l-xl bg-(--lifted)">
                  Submit as
                </p>
                <p className="text-xs px-4 py-2 rounded-r-xl bg-(--lifted) border-l">
                  {currUser.data?.username}
                </p>
              </div>
            </div>

            <StreamerLinkForm
              dbMatches={dbMatches.data ?? []}
              userLinks={userLinks.data?.links ?? []}
              currUser={currUser.data!}
              defaultValues={
                !editId
                  ? undefined
                  : {
                      ...userLinks.data?.links?.find((l) => l.id === editId),
                      excludeSubmittedMatches: false,
                      sport: dbMatches.data?.find(
                        (m) =>
                          m.id ===
                          userLinks.data?.links?.find((l) => l.id === editId)
                            ?.match_id
                      )?.sport,
                    }
              }
              onSubmit={(data) => {
                if (!editId) {
                  addLink.mutate({
                    inpMatchId: data.matchId!,
                    ...data,
                  });
                } else {
                  editLink.mutate({
                    id: editId,
                    inpMatchId: data.matchId!,
                    ...data,
                  });
                }
              }}
              submitUI={(submit) => (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditId(null);
                      if (editId) {
                        // setExcludeSubmittedMatches(true);
                      }
                    }}
                    className="rounded-full! bg-(--lifted) flex items-center gap-1.5 px-4 py-2.5 text-sm"
                  >
                    <XIcon className="w-4 h-4" /> Cancel
                  </button>

                  <button
                    onClick={() => submit()}
                    className="rounded-full! bg-(--lifted) flex items-center gap-1.5 px-4 py-2.5 border text-sm"
                  >
                    {editId ? (
                      <>
                        <EditIcon className="w-4 h-4" /> Edit
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" /> Continue
                      </>
                    )}
                  </button>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {!!adminNotice.data && (
        <p className="w-full text-sm bg-yellow-600 text-black border-[1px] border-yellow-900 px-4 py-3 rounded-2xl -my-2">
          {adminNotice.data}
        </p>
      )}

      <div className="rounded-full p-0.75 bg-(--lifted) flex items-center gap-1">
        <Select
          value={sportQuery}
          onValueChange={(val) => {
            if (val === "-all-") {
              setSportQuery("");
              return;
            }

            setSportQuery(val);
          }}
        >
          <SelectTrigger className="h-10.25! border-none rounded-full! bg-slate-900!">
            <SelectValue placeholder="Sport filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-all-">All</SelectItem>
            {sports.map((sport, idx) => (
              <SelectItem value={sport} key={idx}>
                {sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={typeQuery}
          onValueChange={(val) => {
            setTypeQuery(val as "embed" | "popup" | "normal");
          }}
        >
          <SelectTrigger className="border-none py-3! h-10.25! bg-slate-900! rounded-2xl!">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-all-">All types</SelectItem>
            {!!currUser.data?.permission_linkSubmission && (
              <SelectItem value="normal">Normal link</SelectItem>
            )}
            {!!currUser.data?.permission_popupSubmission && (
              <SelectItem value="popup">Popup link</SelectItem>
            )}
            {!!currUser.data?.permission_embedSubmission && (
              <SelectItem value="embed">Embed source</SelectItem>
            )}
          </SelectContent>
        </Select>

        <SearchSelect
          className="h-10.25!"
          value={leagueQuery}
          placeholder="Filter by league"
          onValueChange={(val, groupName) => {
            const filterLeague =
              !!groupName && groupName !== "[DEFAULT]"
                ? `${val}::${groupName}`
                : val;

            setLeagueQuery(filterLeague);
          }}
          items={[
            { value: "all_leagues", text: "All leagues" },
            ...Object.keys(leaguesByCountry)
              .map((country) =>
                leaguesByCountry[country].map((league) => ({
                  value: league,
                  text: league,
                  groupName: country,
                }))
              )
              .flat(2)
              .sort((a, b) => {
                if (
                  PriorityGroups.includes(a.groupName.toLowerCase()) &&
                  PriorityGroups.includes(b.groupName.toLowerCase())
                ) {
                  return (
                    PriorityGroups.indexOf(a.groupName.toLowerCase()) -
                    PriorityGroups.indexOf(b.groupName.toLowerCase())
                  );
                }

                if (PriorityGroups.includes(a.groupName.toLowerCase())) {
                  return -1;
                }

                if (PriorityGroups.includes(b.groupName.toLowerCase())) {
                  return 1;
                }

                return a.text.localeCompare(b.text);
              }),
          ]}
        />

        <SearchSelect
          value={matchIdQuery ?? ""}
          className="h-10.25!"
          onValueChange={(val) => {
            console.log(val);
            if (val === "-all-") {
              setMatchIdQuery("");
              return;
            }

            setMatchIdQuery(val);
          }}
          placeholder="Select a match"
          items={[
            {
              value: "-all-",
              text: "-All matches-",
            },
            ...(matches?.map((match) => ({
              text: `${match.league}: ${match.team1} ${
                match.team2 ? `vs ${match.team2}` : ""
              }`,
              value: match.id,
              groupName: match.league,
            })) ?? []),
          ]}
        />

        <input
          className="h-10.25 text-sm rounded-full bg-slate-900 w-full px-4 placeholder:text-slate-300 focus:outline-none"
          placeholder="Link query"
          value={linkQuery}
          onChange={(e) => {
            setLinkQuery(e.target.value);
          }}
        />

        <button
          className="h-10.25 rounded-full px-4 text-sm font-medium bg-slate-900 min-w-fit"
          onClick={() => {
            if (
              !confirm(
                "Are you really sure you want to delete all current links?"
              )
            )
              return;

            deleteLinks.mutate({
              ids: currLinks?.map((l) => l.id) ?? [],
            });
          }}
          disabled={deleteLinks.isPending}
        >
          Delete current streams ({currLinks?.length ?? 0})
        </button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sport</TableHead>
            <TableHead>Match</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Language</TableHead>
            <TableHead className="text-center">Ads</TableHead>
            <TableHead className="text-right">Created at</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currLinks
            ?.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .map((link) => {
              const dbMatch = dbMatches.data?.find(
                (m) => m.id === link.match_id
              );

              return (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">
                    {dbMatch?.sport}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span className="font-bold flex items-center gap-1">
                        {!!dbMatch?.league_image && (
                          <img
                            src={dbMatch?.league_image}
                            className="w-4 h-4 rounded-full"
                            alt=""
                          />
                        )}
                        {dbMatch?.league}
                      </span>{" "}
                      <span className="font-normal flex items-center gap-1">
                        {!!dbMatch?.team1_image && (
                          <img
                            src={dbMatch?.team1_image}
                            className="w-4 h-4 rounded-full"
                            alt=""
                          />
                        )}
                        {dbMatch?.team1}
                      </span>{" "}
                      <span className="text-slate-300 font-bold">vs</span>
                      {dbMatch?.team2 ? (
                        <>
                          <span className="font-normal flex items-center gap-1">
                            {dbMatch?.team2}
                            {!!dbMatch?.team2_image && (
                              <img
                                src={dbMatch?.team2_image}
                                className="w-4 h-4 rounded-full"
                                alt=""
                              />
                            )}
                          </span>{" "}
                        </>
                      ) : (
                        ""
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {capitalizeFirstLetter(link.type)}
                  </TableCell>
                  <TableCell>{link.name}</TableCell>
                  <TableCell>
                    <input value={link.link} readOnly className="w-37.5" />
                  </TableCell>
                  <TableCell>{link.country}</TableCell>
                  <TableCell className="font-medium">
                    {link.language.toUpperCase()}
                  </TableCell>

                  <TableCell className="font-medium text-center">
                    {link.adsNumber}
                  </TableCell>

                  <TableCell className="font-medium text-right">
                    {new Intl.DateTimeFormat(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      hourCycle: "h23",
                      day: "2-digit",
                      month: "2-digit",
                    }).format(new Date(link.created_at))}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end items-center gap-1">
                      <button
                        onClick={() => {
                          if (!confirm("Delete this link?")) return;

                          deleteLink.mutate({
                            id: link.id,
                          });
                        }}
                        disabled={deleteLink.isPending}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs bg-white/10"
                      >
                        <TrashIcon className="w-4 h-4" strokeWidth={1} /> Delete
                      </button>

                      <button
                        onClick={() => {
                          setIsFormOpen(true);
                          setEditId(link.id);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs bg-white/10"
                      >
                        <EditIcon className="w-4 h-4" strokeWidth={1} />
                        Edit
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>

      {/* <pre>{JSON.stringify(matches.data, null, 2)}</pre> */}
    </div>
  );
};
