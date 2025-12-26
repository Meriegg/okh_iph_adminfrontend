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
import type { TMatch } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  EditIcon,
  GrabIcon,
  MenuIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { Link } from "react-router";
import { getMatchStatus } from "@/utils/get-match-status";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { UpdateRelativeTime } from "@/components/update-relative-time";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TimePicker } from "@/components/ui/timer-picker";

export const Page_ManageSchedule = () => {
  const dbMatches = useQuery<TMatch[]>({
    queryFn: async () => {
      return await api
        .get<{ matches: TMatch[] }>("/manage-schedule/get-schedule")
        .then((res) => res.data.matches);
    },
    queryKey: ["mangeSchedule.matches"],
  });

  const [sportQuery, setSportQuery] = useState("");
  const [leagueQuery, setLeagueQuery] = useState("");
  const [team1Query, setTeam1Query] = useState("");
  const [team2Query, setTeam2Query] = useState("");
  const [dateQuery, setDateQuery] = useState<string | null>(null);

  const matches = useMemo(() => {
    return (dbMatches.data ?? [])
      .filter((match) => {
        if (!leagueQuery || leagueQuery === "all_leagues") return true;
        return match.league === leagueQuery.split("::").at(0);
      })
      .filter((match) => {
        return match.team1?.toLowerCase().includes(team1Query.toLowerCase());
      })
      .filter((match) => {
        return match.team2?.toLowerCase().includes(team2Query.toLowerCase());
      })
      .filter((match) => {
        if (!sportQuery?.trim()) return true;

        return match.sport === sportQuery;
      })
      .filter((match) => {
        if (!dateQuery) return true;

        return (
          new Date(match.timestamp).toISOString().split("T")[0] === dateQuery
        );
      });
  }, [
    dbMatches.data,
    leagueQuery,
    team1Query,
    team2Query,
    sportQuery,
    dateQuery,
  ]);

  const leaguesByCountry = useMemo(() => {
    const leaguesByCountry: Record<string, string[]> = {};

    for (const match of (dbMatches.data ?? []).sort((a, b) =>
      a.league_country.localeCompare(b.league_country)
    )) {
      const existingArr = leaguesByCountry[match.league_country] ?? [];
      if (existingArr.includes(match.league)) continue;
      existingArr.push(match.league);
      leaguesByCountry[match.league_country] = existingArr;
    }

    return leaguesByCountry;
  }, [dbMatches.data]);

  const deleteMatch = useMutation({
    mutationFn: async (data: { id: string }) => {
      return await api.post("/manage-schedule/delete-match", {
        id: data.id,
      });
    },
    onSuccess: () => {
      toast.success("Match deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["mangeSchedule.matches"] });
    },
  });

  const deleteMatches = useMutation({
    mutationFn: async () => {
      return await api.post("/manage-schedule/delete-matches", {
        ids: matches.map((m) => m.id),
      });
    },
    onSuccess: () => {
      toast.success("Matches deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["mangeSchedule.matches"] });
    },
  });

  const [sport, setSport] = useState<string>("");

  const [league, setLeague] = useState<string>("");
  const [leagueCountry, setLeagueCountry] = useState<string | null>(null);
  const [leagueImage, setLeagueImage] = useState<File | null>(null);

  const [team1, setTeam1] = useState<string>("");
  const [team1Image, setTeam1Image] = useState<File | null>(null);

  const [team2, setTeam2] = useState<string>("");
  const [team2Image, setTeam2Image] = useState<File | null>(null);

  const [venue, setVenue] = useState<string>("");

  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [localTimezoneOffset, setLocalTimezoneOffset] = useState<number>(
    new Date().getTimezoneOffset()
  );
  const [externalId, setExternalId] = useState<string>("");
  const [duration, setDuration] = useState<number>();

  const [matchEditId, setMatchEditId] = useState<string | null>(null);

  const addMatch = useMutation({
    mutationFn: async () => {
      const formData = new FormData();

      if (
        !league ||
        !leagueCountry ||
        !sport ||
        !team1 ||
        !date ||
        !time ||
        localTimezoneOffset === undefined ||
        !leagueImage ||
        !team1Image ||
        !duration
      ) {
        toast.error("Complete all required fields!");
        return;
      }

      formData.append("league", league);
      formData.append("league_country", leagueCountry);
      formData.append("league_image", leagueImage);
      formData.append("sport", sport);
      formData.append("team1", team1);
      formData.append("team1_image", team1Image);
      formData.append("team2", team2);
      formData.append("team2_image", team2Image as File);
      formData.append("venue", venue);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("localTimezoneOffset", String(localTimezoneOffset));
      formData.append("external_id", externalId);
      formData.append("duration", String(duration));

      return await api.post("/manage-schedule/create-match", formData);
    },
    onSuccess: () => {
      toast.success("Match added successfully.");
      queryClient.invalidateQueries({
        queryKey: ["mangeSchedule.matches"],
      });
      setLeague("");
      setLeagueCountry("");
      setSport("");
      setTeam1("");
      setTeam1Image(null);
      setTeam2("");
      setTeam2Image(null);
      setVenue("");
      setDate("");
      setTime("");
      setLocalTimezoneOffset(new Date().getTimezoneOffset());
      setExternalId("");
      setDuration(undefined);
    },
  });

  const editMatch = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const formData = new FormData();

      if (
        !league ||
        !leagueCountry ||
        !sport ||
        !team1 ||
        !date ||
        !time ||
        localTimezoneOffset === undefined ||
        !duration
      ) {
        toast.error("Complete all required fields.!");
        return;
      }

      formData.append("league", league);
      formData.append("league_country", leagueCountry);
      formData.append("league_image", leagueImage as File);
      formData.append("sport", sport);
      formData.append("team1", team1);
      formData.append("team1_image", team1Image as File);
      formData.append("team2", team2);
      formData.append("team2_image", team2Image as File);
      formData.append("venue", venue);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("localTimezoneOffset", String(localTimezoneOffset));
      formData.append("external_id", externalId);
      formData.append("duration", String(duration));
      formData.append("id", id);

      return await api.post("/manage-schedule/edit-match", formData);
    },
    onSuccess: () => {
      toast.success("Match edited successfully..");
      queryClient.invalidateQueries({
        queryKey: ["mangeSchedule.matches"],
      });
      setLeague("");
      setLeagueCountry("");
      setSport("");
      setTeam1("");
      setTeam1Image(null);
      setTeam2("");
      setTeam2Image(null);
      setVenue("");
      setDate("");
      setTime("");
      setLocalTimezoneOffset(new Date().getTimezoneOffset());
      setExternalId("");
      setDuration(undefined);
    },
  });

  return (
    <div className="w-full flex flex-col gap-6 h-full">
      <div className="rounded-2xl flex items-center gap-1 p-0.75 bg-(--lifted) w-full min-h-13.75">
        <div className="rounded-2xl flex items-center justify-between px-4 h-13.75 w-full bg-slate-900">
          <p className="text-2xl font-bold">
            <span className="text-sm text-slate-300 font-medium">admin /</span>{" "}
            Manage Schedule
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="rounded-2xl bg-slate-900 h-13.75 px-4 min-w-fit text-sm font-medium flex items-center gap-1.5">
              <PlusIcon className="w-4 h-4" strokeWidth={1} /> Add Match
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add a new match</AlertDialogTitle>
              <AlertDialogDescription>
                Manually add a match to the schedule.{" "}
                <span className="font-bold text-white">
                  All fields are required unless marked as optional.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-0.75 p-0.75 bg-(--lifted) rounded-2xl">
              <p className="text-xs text-slate-300 px-2 mt-1">
                Sport (required)
              </p>
              <input
                placeholder="sport"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />

              <p className="text-xs text-slate-300 px-2">
                League & country (required)
              </p>
              <div className="flex items-center gap-0.75">
                <input
                  placeholder="league"
                  value={league}
                  onChange={(e) => setLeague(e.target.value)}
                  className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
                />

                <Select
                  value={leagueCountry ?? undefined}
                  onValueChange={setLeagueCountry}
                >
                  <SelectTrigger className="h-12! rounded-2xl! w-full bg-slate-900! border-none">
                    <SelectValue placeholder="Country" />
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

              <p className="text-xs text-slate-300 px-2">
                League image (required)
              </p>
              <input
                placeholder="league image"
                type="file"
                accept="image/*"
                onChange={(e) => setLeagueImage(e.target.files?.[0] ?? null)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />

              <p className="text-xs text-slate-300 px-2">
                Team1 & image (required)
              </p>
              <div className="flex items-center gap-0.75">
                <input
                  placeholder="team1"
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
                />

                <input
                  placeholder="team1 image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTeam1Image(e.target.files?.[0] ?? null)}
                  className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
                />
              </div>

              <p className="text-xs text-slate-300 px-2">
                Team2 & image (optional)
              </p>
              <div className="flex items-center gap-0.75">
                <input
                  placeholder="team2 (optional)"
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                  className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
                />

                <input
                  placeholder="team2 image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTeam2Image(e.target.files?.[0] ?? null)}
                  className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
                />
              </div>

              <p className="text-xs text-slate-300 px-2 mt-1">
                Venue (optional)
              </p>

              <input
                placeholder="venue (optional)"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300 px-2">
                  Event date & time (required)
                </p>

                <div className="flex items-center gap-2">
                  <button
                    className={cn(
                      "text-xs hover:underline",
                      localTimezoneOffset === new Date().getTimezoneOffset()
                        ? "text-white underline"
                        : "text-slate-300"
                    )}
                    onClick={() => {
                      setLocalTimezoneOffset(new Date().getTimezoneOffset());
                    }}
                  >
                    In local timezone ({new Date().getTimezoneOffset()})
                  </button>

                  <button
                    className={cn(
                      "text-xs hover:underline",
                      localTimezoneOffset === 0
                        ? "text-white underline"
                        : "text-slate-300"
                    )}
                    onClick={() => {
                      setLocalTimezoneOffset(0);
                    }}
                  >
                    In UTC
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-0.75">
                <input
                  placeholder="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
                />

                <TimePicker val={time} onChange={(val) => setTime(val)} />
              </div>

              <p className="text-xs text-slate-300 px-2">
                Duration in minutes (required)
              </p>
              <input
                placeholder="duration in minutes"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.valueAsNumber)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />

              <p className="text-xs text-slate-300 px-2">
                External reference (optional)
              </p>
              <input
                placeholder="external id reference (optional)"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />
            </div>

            <div className="flex flex-col gap-0.75 p-0.75 -mt-3 bg-(--lifted) rounded-2xl">
              <AlertDialogAction asChild>
                <button
                  onClick={(e) => {
                    if (
                      !league ||
                      !leagueCountry ||
                      !sport ||
                      !team1 ||
                      !date ||
                      !time ||
                      localTimezoneOffset === undefined ||
                      !leagueImage ||
                      !team1Image ||
                      !duration
                    ) {
                      e.preventDefault();
                      toast.error("Complete all required fields!");
                      return;
                    }

                    addMatch.mutate();
                  }}
                  disabled={addMatch.isPending}
                  className="h-12 rounded-2xl bg-slate-900"
                >
                  Add match
                </button>
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <Link
          to="/manage-schedule/start-scraping"
          className="rounded-2xl bg-slate-900 h-13.75 px-4 min-w-fit text-sm font-medium flex items-center gap-1.5"
        >
          <GrabIcon className="w-4 h-4" strokeWidth={1} /> Start Scraping
        </Link>
      </div>

      <div className="rounded-full p-0.75 bg-(--lifted) flex items-center gap-1">
        <Select
          value={sportQuery}
          onValueChange={(val) => {
            if (val === "-all-") {
              setSportQuery("");
              return;
            }

            setSportQuery(val as "all" | "football" | "basketball" | "hockey");
          }}
        >
          <SelectTrigger className="h-10! border-none rounded-full! bg-slate-900!">
            <SelectValue placeholder="Sport filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-all-">All</SelectItem>
            {Array.from(new Set(dbMatches.data?.map((m) => m.sport))).map(
              (sport, idx) => (
                <SelectItem value={sport} key={idx}>
                  {sport}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <SearchSelect
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

        <input
          className="h-10.25 text-sm rounded-full bg-slate-900 w-full px-4 placeholder:text-slate-300 focus:outline-none"
          placeholder="Team 1"
          value={team1Query}
          onChange={(e) => {
            setTeam1Query(e.target.value);
          }}
        />

        <input
          className="h-10.25 text-sm rounded-full bg-slate-900 w-full px-4 placeholder:text-slate-300 focus:outline-none"
          placeholder="Team 2"
          value={team2Query}
          onChange={(e) => {
            setTeam2Query(e.target.value);
          }}
        />

        <input
          className="h-10.25 text-sm rounded-full bg-slate-900 w-full px-4 placeholder:text-slate-300 focus:outline-none"
          placeholder="Date"
          type="date"
          value={dateQuery ?? undefined}
          onChange={(e) => {
            setDateQuery(e.target.value);
          }}
        />

        <button
          className="h-10.25 rounded-full px-4 text-sm font-medium bg-slate-900 min-w-fit"
          onClick={() => {
            if (
              !confirm("Are you sure you want to delete all current matches?")
            )
              return;

            deleteMatches.mutate();
          }}
          disabled={deleteMatches.isPending}
        >
          Delete current matches ({matches.length})
        </button>
      </div>

      {dbMatches.isLoading && <Loader />}
      {!dbMatches.isLoading && !dbMatches.isError && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right w-[120px]">Sport</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>League</TableHead>
              <TableHead>
                Date / <br /> Time
              </TableHead>
              <TableHead className="text-center">
                Dur. <br /> min.
              </TableHead>
              <TableHead className="text-center">Ends</TableHead>
              <TableHead className="text-center">Stat.</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches
              ?.sort((a, b) => a.timestamp - b.timestamp)
              ?.map((match) => (
                <TableRow key={match.id}>
                  <TableCell
                    title={match.sport_slug}
                    className="text-right text-slate-300"
                  >
                    {match.sport}
                  </TableCell>
                  <TableCell title={match.slug} className="font-medium">
                    <span className="flex items-center gap-1">
                      {!!match?.team1_image && (
                        <img
                          src={
                            match.team1_image?.startsWith("https://")
                              ? match.team1_image
                              : `http://localhost:4000/images/${match.team1_image}`
                          }
                          className="size-4 rounded-full"
                        />
                      )}
                      {match.team1}{" "}
                      {!!match?.team2 && (
                        <>
                          <span className="text-xs mx-1 font-semibold text-slate-300">
                            vs
                          </span>{" "}
                          {match.team2}
                          {!!match?.team2_image && (
                            <img
                              src={
                                match.team2_image?.startsWith("https://")
                                  ? match.team2_image
                                  : `http://localhost:4000/images/${match.team2_image}`
                              }
                              className="size-4 rounded-full"
                            />
                          )}
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell title={match.league_slug} className="font-medium">
                    <span className="flex items-center gap-1">
                      {!!match.league_image && (
                        <img
                          src={
                            match.league_image?.startsWith("https://")
                              ? match.league_image
                              : `http://localhost:4000/images/${match.league_image}`
                          }
                          className="size-4 rounded-full"
                        />
                      )}

                      {match.league}
                    </span>
                  </TableCell>
                  <TableCell title={match.id}>
                    {new Intl.DateTimeFormat("ro-RO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    }).format(new Date(match.timestamp))}{" "}
                    <br />
                    {new Intl.DateTimeFormat("ro-RO", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hourCycle: "h23",
                    }).format(new Date(match.timestamp))}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {match.duration}
                  </TableCell>
                  <TableCell className="text-center w-30 text-slate-300">
                    <UpdateRelativeTime
                      timestamp={match.timestamp + match.duration * 1000 * 60}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center w-25 font-bold",
                      getMatchStatus(match.timestamp, match.duration) ===
                        "live" && "text-red-500",
                      getMatchStatus(match.timestamp, match.duration) ===
                        "upcoming" && "text-white",
                      getMatchStatus(match.timestamp, match.duration) ===
                        "finished" && "text-slate-300"
                    )}
                  >
                    {getMatchStatus(match.timestamp, match.duration)
                      .slice(0, 1)
                      .toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center w-full">
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
                                  "Are you sure you want to delete this match?"
                                )
                              )
                                return;

                              deleteMatch.mutate({
                                id: match.id,
                              });
                            }}
                            disabled={deleteMatch.isPending}
                            size="sm"
                            className="w-full justify-start"
                          >
                            <TrashIcon className="w-3 h-3" strokeWidth={1} />{" "}
                            Delete match
                          </Button>

                          <Button
                            onClick={() => {
                              setMatchEditId(match.id);

                              setLeague(match.league);
                              setLeagueCountry(match.league_country);
                              setSport(match.sport);
                              setTeam1(match.team1);
                              setTeam2(match.team2);
                              setVenue(match?.venue ?? "");
                              setDate(
                                new Date(match.timestamp)
                                  .toISOString()
                                  .split("T")[0]
                              );
                              // hh:mm format
                              setTime(
                                new Date(match.timestamp)
                                  .toISOString()
                                  .split("T")[1]
                                  .split(":")
                                  .slice(0, 2)
                                  .join(":")
                              );
                              setLocalTimezoneOffset(0);
                              setDuration(match.duration);
                              setExternalId(match.external_id);
                            }}
                            size="sm"
                            className="w-full justify-start"
                          >
                            <EditIcon className="w-3 h-3" strokeWidth={1} />{" "}
                            Edit match
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                  {/* <TableCell>
                <Link
                  to={`/manage-schedule/accept-match/${match.id}`}
                  className="rounded-2xl bg-slate-900 h-full px-4 min-w-fit text-sm font-medium flex items-center gap-1.5"
                >
                  Accept
                </Link>
              </TableCell> */}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog
        open={!!matchEditId}
        onOpenChange={(val) => {
          if (val === false) {
            setMatchEditId(null);
            setTimeout(() => {
              setLeague("");
              setLeagueCountry("");
              setSport("");
              setTeam1("");
              setTeam1Image(null);
              setTeam2("");
              setTeam2Image(null);
              setVenue("");
              setDate("");
              setTime("");
              setLocalTimezoneOffset(new Date().getTimezoneOffset());
              setExternalId("");
              setDuration(undefined);
            }, 500);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit match</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const eMatch = dbMatches.data?.find(
                  (m) => m.id === matchEditId
                );

                return (
                  <>
                    {eMatch?.league}: {eMatch?.team1}{" "}
                    {eMatch?.team2 ? `vs ${eMatch?.team2}` : ""} -{" "}
                    {eMatch?.sport}
                  </>
                );
              })()}
              .{" "}
              <span className="font-bold text-white">
                All fields are required unless marked as optional. All images
                are optional for edits.
              </span>
            </AlertDialogDescription>
            <AlertDialogDescription>id: {matchEditId}</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-0.75 p-0.75 bg-(--lifted) rounded-2xl">
            <p className="text-xs text-slate-300 px-2 mt-1">Sport (required)</p>
            <input
              placeholder="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
            />

            <p className="text-xs text-slate-300 px-2">
              League & country (required)
            </p>
            <div className="flex items-center gap-0.75">
              <input
                placeholder="league"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />

              <Select
                value={leagueCountry ?? undefined}
                onValueChange={setLeagueCountry}
              >
                <SelectTrigger className="h-12! rounded-2xl! w-full bg-slate-900! border-none">
                  <SelectValue placeholder="Country" />
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

            <p className="text-xs text-slate-300 px-2">
              League image (optional)
            </p>
            <input
              placeholder="league image"
              type="file"
              accept="image/*"
              onChange={(e) => setLeagueImage(e.target.files?.[0] ?? null)}
              className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
            />

            <p className="text-xs text-slate-300 px-2">
              Team1 & image (required / image optional)
            </p>
            <div className="flex items-center gap-0.75">
              <input
                placeholder="team1"
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />

              <input
                placeholder="team1 image"
                type="file"
                accept="image/*"
                onChange={(e) => setTeam1Image(e.target.files?.[0] ?? null)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />
            </div>

            <p className="text-xs text-slate-300 px-2">
              Team2 & image (optional)
            </p>
            <div className="flex items-center gap-0.75">
              <input
                placeholder="team2 (optional)"
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />

              <input
                placeholder="team2 image"
                type="file"
                accept="image/*"
                onChange={(e) => setTeam2Image(e.target.files?.[0] ?? null)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />
            </div>

            <p className="text-xs text-slate-300 px-2 mt-1">Venue (optional)</p>

            <input
              placeholder="venue (optional)"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300 px-2">
                Event date & time (required)
              </p>

              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "text-xs hover:underline",
                    localTimezoneOffset === new Date().getTimezoneOffset()
                      ? "text-white underline"
                      : "text-slate-300"
                  )}
                  onClick={() => {
                    setLocalTimezoneOffset(new Date().getTimezoneOffset());
                  }}
                >
                  In local timezone ({new Date().getTimezoneOffset()})
                </button>

                <button
                  className={cn(
                    "text-xs hover:underline",
                    localTimezoneOffset === 0
                      ? "text-white underline"
                      : "text-slate-300"
                  )}
                  onClick={() => {
                    setLocalTimezoneOffset(0);
                  }}
                >
                  In UTC
                </button>
              </div>
            </div>

            <div className="flex items-center gap-0.75">
              <input
                placeholder="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
              />

              <TimePicker val={time} onChange={(val) => setTime(val)} />
            </div>

            <p className="text-xs text-slate-300 px-2">
              Duration in minutes (required)
            </p>
            <input
              placeholder="duration in minutes"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.valueAsNumber)}
              className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
            />

            <p className="text-xs text-slate-300 px-2">
              External reference (optional)
            </p>
            <input
              placeholder="external id reference (optional)"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              className="w-full focus:outline-none ring-blue-600/20 focus:ring-2 transition-all duration-300 border-none bg-slate-900 rounded-2xl px-4 py-3"
            />
          </div>

          <div className="flex flex-col gap-0.75 p-0.75 -mt-3 bg-(--lifted) rounded-2xl">
            <AlertDialogAction asChild>
              <button
                onClick={(e) => {
                  if (
                    !league ||
                    !leagueCountry ||
                    !sport ||
                    !team1 ||
                    !date ||
                    !time ||
                    localTimezoneOffset === undefined ||
                    !duration
                  ) {
                    e.preventDefault();
                    toast.error("Complete all required fields!");
                    return;
                  }

                  editMatch.mutate({
                    id: matchEditId ?? "",
                  });
                }}
                disabled={editMatch.isPending}
                className="h-12 rounded-2xl bg-slate-900"
              >
                Edit match
              </button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      {/* <pre>{JSON.stringify(matches.data, null, 2)}</pre> */}
    </div>
  );
};
