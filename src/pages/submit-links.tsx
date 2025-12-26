import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countries, getCountryData, type TCountryCode } from "countries-list";
import { api } from "@/lib/axios";
import type { TMatch, TUser, TUserLink } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import languages from "language-list";
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
import { Checkbox } from "@/components/ui/checkbox";
import { capitalizeFirstLetter } from "@/utils/capitalize-first-letter";
import { isTimestampToday } from "@/utils/is-timestamp-today";

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

  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState<"embed" | "popup" | "normal">("normal");
  const [country, setCountry] = useState("United States");
  const [language, setLanguage] = useState("en");
  const [adsNumber, setAdsNumber] = useState(1);
  const [matchId, setMatchId] = useState<string | null>(null);

  const [sport, setSport] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);
  const [isFormopen, setIsFormOpen] = useState(false);

  const addLink = useMutation({
    mutationFn: async ({ inpMatchId }: { inpMatchId: string }) => {
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
      setName("");
      setLink("");
      setType("normal");
      setCountry("United States");
      setLanguage("en");
      setAdsNumber(1);
      setMatchId(null);
    },
  });

  const editLink = useMutation({
    mutationFn: async ({
      id,
      inpMatchId,
    }: {
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
      setName("");
      setLink("");
      setType("normal");
      setCountry("United States");
      setLanguage("en");
      setAdsNumber(1);
      setMatchId(null);
      setEditId(null);
      setExcludeSubmittedMatches(true);
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

  const [excludeSubmittedMatches, setExcludeSubmittedMatches] = useState(true);

  const currLinks = userLinks.data?.links
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
      if (typeQuery && typeQuery !== "-all-") return link.type === typeQuery;

      return true;
    });

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
          <div className="w-full max-w-[800px] rounded-2xl flex flex-col gap-6 border bg-slate-900 p-6">
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

            <div className="p-0.75 flex flex-col gap-1 bg-(--lifted) rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="">
                  <p className="text-xs pl-2 py-1 text-slate-300">Sport</p>

                  <Select value={sport} onValueChange={(val) => setSport(val)}>
                    <SelectTrigger className="border-none py-3! h-11! bg-slate-900! rounded-2xl! w-full">
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        new Set(dbMatches.data?.map((match) => match.sport))
                      ).map((sport, idx) => (
                        <SelectItem value={sport} key={idx}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full">
                  <p className="text-xs pl-2 py-1 text-slate-300">Match</p>

                  <SearchSelect
                    className="w-full"
                    value={matchId ?? ""}
                    onValueChange={(val) => setMatchId(val)}
                    placeholder="Select a match"
                    items={
                      dbMatches.data
                        ?.filter((match) => match.sport === sport)
                        ?.filter((match) =>
                          excludeSubmittedMatches
                            ? userLinks.data?.links?.findIndex(
                                (link) => link.match_id === match.id
                              ) === -1
                            : true
                        )
                        ?.sort((a, b) => a.timestamp - b.timestamp)
                        ?.map((match) => ({
                          text: `${match.league}: ${match.team1} ${
                            match.team2 ? `vs ${match.team2}` : ""
                          } @ ${
                            isTimestampToday(match.timestamp)
                              ? "Today"
                              : new Intl.DateTimeFormat("ro-RO", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                }).format(new Date(match.timestamp))
                          }`,
                          ui: (
                            <span className="flex flex-col gap-1">
                              <span className="font-medium text-xs text-slate-300">
                                {match.league}
                              </span>
                              <span className="font-semibold">
                                {match.team1}{" "}
                                {match.team2 ? (
                                  <span>
                                    <span className="text-xs text-slate-300 font-normal">
                                      vs
                                    </span>{" "}
                                    {match.team2}
                                  </span>
                                ) : (
                                  ""
                                )}
                              </span>
                              <hr className="border-dashed" />
                              <span className="text-xs font-bold">
                                {isTimestampToday(match.timestamp)
                                  ? "Today"
                                  : new Intl.DateTimeFormat("ro-RO", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "2-digit",
                                    }).format(new Date(match.timestamp))}
                              </span>
                            </span>
                          ),
                          value: match.id,
                          groupName: match.league,
                        })) ?? []
                    }
                  />
                </div>
              </div>

              <div className="w-full flex items-center gap-0.5 px-2 py-2 bg-slate-900 rounded-2xl">
                <Checkbox
                  checked={excludeSubmittedMatches}
                  onCheckedChange={(val) => setExcludeSubmittedMatches(!!val)}
                />

                <p className="text-xs pl-2 py-1 text-slate-300">
                  Exclude submitted matches
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-full">
                  <p className="text-xs pl-2 py-1 text-slate-300">
                    Channel Name
                  </p>

                  <input
                    className="px-4 py-3 rounded-2xl bg-slate-900 w-full text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="eg. SkySportsArena"
                  />
                </div>

                <div className="w-full">
                  <p className="text-xs pl-2 py-1 text-slate-300">Link</p>

                  <input
                    className="px-4 py-3 rounded-2xl bg-slate-900 w-full text-sm"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="eg. https://example.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-full">
                  <p className="text-xs pl-2 py-1 text-slate-300">Country</p>

                  <Select
                    value={country}
                    onValueChange={(val) => setCountry(val)}
                  >
                    <SelectTrigger className="border-none py-3! h-11! bg-slate-900! rounded-2xl! w-full">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(countries).map((countryCode) => {
                        const country = getCountryData(
                          countryCode as TCountryCode
                        ).name;
                        return (
                          <SelectItem value={country} key={country}>
                            {country}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full">
                  <p className="text-xs pl-2 py-1 text-slate-300">Language</p>

                  <Select
                    value={language}
                    onValueChange={(val) => setLanguage(val)}
                  >
                    <SelectTrigger className="border-none py-3! h-11! bg-slate-900! rounded-2xl! w-full">
                      <SelectValue placeholder="Select a language" />
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
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-full">
                  <p className="text-xs pl-2 py-1 text-slate-300">Type</p>

                  <Select
                    value={type}
                    onValueChange={(val) => {
                      setType(val as "embed" | "popup" | "normal");
                    }}
                  >
                    <SelectTrigger className="border-none py-3! h-11! bg-slate-900! rounded-2xl! w-full">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>

                <div className="w-full">
                  <p className="text-xs pl-2 py-1 text-slate-300">No. of ads</p>

                  <input
                    className="px-4 py-3 rounded-2xl bg-slate-900 w-full text-sm"
                    value={adsNumber}
                    onChange={(e) => setAdsNumber(e.target.valueAsNumber)}
                    type="number"
                    placeholder="2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  if (editId) {
                    setName("");
                    setLink("");
                    setType("normal");
                    setCountry("United States");
                    setLanguage("en");
                    setAdsNumber(1);
                    setEditId(null);
                    setMatchId(null);
                    setSport("");
                    setExcludeSubmittedMatches(true);
                  }
                }}
                className="rounded-full! bg-(--lifted) flex items-center gap-1.5 px-4 py-2.5 text-sm"
              >
                <XIcon className="w-4 h-4" /> Cancel
              </button>

              <button
                className="rounded-full! bg-(--lifted) flex items-center gap-1.5 px-4 py-2.5 border text-sm"
                onClick={(e) => {
                  if (
                    !name ||
                    !link ||
                    !country ||
                    !language ||
                    !type ||
                    !matchId ||
                    typeof adsNumber !== "number"
                  ) {
                    toast.error("Complete all required fields!");
                    e.preventDefault();
                    return;
                  }

                  if (!editId) {
                    addLink.mutate({
                      inpMatchId: matchId,
                    });
                  } else {
                    editLink.mutate({
                      id: editId,
                      inpMatchId: matchId,
                    });
                  }
                }}
                disabled={
                  addLink.isPending ||
                  !name ||
                  !link ||
                  !country ||
                  !language ||
                  !type ||
                  !matchId ||
                  typeof adsNumber !== "number"
                }
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
                          setName(link.name);
                          setLink(link.link);
                          setLanguage(link.language);
                          setCountry(link.country);
                          setType(link.type);
                          setAdsNumber(link.adsNumber ?? 1);
                          setSport(dbMatch?.sport ?? "");
                          setMatchId(link.match_id);
                          setExcludeSubmittedMatches(false);
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
