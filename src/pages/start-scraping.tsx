/* eslint-disable react-hooks/set-state-in-effect */
import { Loader } from "@/components/loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/axios";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import type { TMatch } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  PlayIcon,
  SkipBack,
  TrashIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Page_StartScraping = () => {
  const navigate = useNavigate();

  const allSports = useQuery<{ strSport: string; idSport: string }[]>({
    queryFn: async () => {
      return await api.get("/scraping/sports").then((res) => res.data?.sports);
    },
    queryKey: ["scraping.allSports"],
  });

  const prevConfig = useQuery<{
    config: {
      sports: string[];
      dates: string[];
    };
  }>({
    queryFn: async () => {
      return await api.get("/scraping/get-prev-config").then((res) => res.data);
    },
    queryKey: ["scraping.prevConfig"],
  });

  const scrapedMatches = useQuery<{
    matches: TMatch[];
  }>({
    queryFn: async () => {
      return await api
        .get("/scraping/get-scraped-matches")
        .then((res) => res.data);
    },
    queryKey: ["scraping.scrapedMatches"],
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [checkedSportIDs, setCheckedSportIDs] = useState<string[]>([]);
  const [dates, setDates] = useState<
    {
      type: "interval" | "single";
      date?: string | null;
      start?: string | null;
      end?: string | null;
    }[]
  >([]);

  const datesValid = useMemo(() => {
    if (!dates?.length) return false;

    return dates.every((date) => {
      if (date.type === "interval") {
        return !!date.start && !!date.end;
      } else {
        return !!date.date;
      }
    });
  }, [dates]);

  const [interval, setIntervalId] = useState<number | null>(null);
  const [matches, setMatches] = useState<TMatch[]>([]);

  const [selectedLeagueIDs, setSelectedLeagueIDs] = useState<string[]>([]);
  const [selectedMatchIDs, setSelectedMatchIDs] = useState<string[]>([]);
  const [selectedMatchStampTypes, setSelectedMatchStampTypes] = useState<
    Record<string, "lt" | "st">
  >({});

  const [unprocessedMatchesOpen, setUnprocessedMatchesOpen] = useState(false);
  useEffect(() => {
    if (!matches?.length && !!scrapedMatches.data?.matches?.length) {
      setUnprocessedMatchesOpen(true);
    }
  }, [scrapedMatches.data?.matches, matches?.length]);

  const poolScraper = useMutation({
    mutationFn: async () => {
      return await api.post("/scraping/pool").then((res) => res.data);
    },
    onSuccess: (data) => {
      if (interval && data?.statusData?.status === "finished") {
        if (!data?.matches?.length) {
          setErrorMessage("No matches found.");
        }

        clearInterval(interval);
        setIntervalId(null);

        const dataMatches: TMatch[] = data?.matches ?? [];

        setMatches(dataMatches ?? []);

        setSelectedLeagueIDs(
          Array.from(new Set(dataMatches?.map((m) => m?.league_id ?? "") ?? []))
        );
        setSelectedMatchIDs(
          Array.from(new Set(dataMatches?.map((m) => m.id) ?? []))
        );
        const prev = { ...selectedMatchStampTypes };
        for (const match of dataMatches) {
          if (!!match?.ltTimestamp && !!match?.stTimestamp) {
            prev[match.id] = "st";
          }

          if (!!match?.ltTimestamp && !match?.stTimestamp) {
            prev[match.id] = "lt";
          }
          if (!!match?.stTimestamp && !match?.ltTimestamp) {
            prev[match.id] = "st";
          }
        }
        setSelectedMatchStampTypes(prev);
      }

      if (interval && data?.statusData?.status === "idle") {
        clearInterval(interval);
        setIntervalId(null);
        setErrorMessage(
          "Scraper process was killed, please try scraping again."
        );
      }

      if (interval && data?.statusData?.status === "errored") {
        clearInterval(interval);
        setIntervalId(null);
        setErrorMessage(
          `Scraper errored out, last error message is: ${
            data?.statusData?.lastErrorMessage ?? "Unknown error"
          }`
        );
      }
    },
  });

  const startScraping = useMutation({
    mutationFn: async () => {
      return await api
        .post("/scraping/scrape", {
          dates,
          sports: allSports.data
            ?.filter((s) => checkedSportIDs.includes(s.idSport))
            ?.map((s) => s.strSport),
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      setIntervalId(
        setInterval(() => {
          poolScraper.mutate();
        }, 5000)
      );
    },
  });

  const acceptMatches = useMutation({
    mutationFn: async () => {
      return await api
        .post("/scraping/accept-matches", {
          selectedLeagueIDs,
          selectedMatchIDs,
          selectedMatchStampTypes,
          selectedMatchCountries,
        })
        .then((res) => res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mangeSchedule.matches"] });
      toast.success("Matches accepted successfully.");
      navigate("/manage-schedule");
    },
  });

  const [leagueQuery, setLeagueQuery] = useState("");

  const matchesByLeague = useMemo(() => {
    const matchRecord: Record<string, TMatch[]> = {};

    matches.forEach((match) => {
      if (!matchRecord[match.league]) {
        matchRecord[match.league] = [];
      }

      matchRecord[match.league].push(match);
    });

    return Object.keys(matchRecord)
      .filter((league) =>
        league.toLowerCase().includes(leagueQuery.toLowerCase())
      )
      .reduce((acc, curr) => {
        acc[curr] = matchRecord[curr];
        return acc;
      }, {} as Record<string, TMatch[]>);
  }, [matches, leagueQuery]);

  const [selectedMatchCountries, setSelectedMatchCountries] = useState<
    Record<string, boolean>
  >({});

  const acceptedMatches = useMemo(() => {
    return matches
      .filter((match) =>
        selectedMatchCountries?.[match.league_country] === false ? false : true
      )
      .filter(
        (match) =>
          selectedLeagueIDs.includes(match?.league_id ?? "") &&
          selectedMatchIDs.includes(match.id)
      );
  }, [matches, selectedLeagueIDs, selectedMatchIDs, selectedMatchCountries]);

  return (
    <div className="w-full flex flex-col gap-6 h-full">
      <div className="rounded-2xl flex items-center gap-1 p-0.75 bg-(--lifted) w-full min-h-13.75">
        <div className="rounded-2xl flex items-center justify-between px-4 h-13.75 w-full bg-slate-900">
          <p className="text-2xl font-bold">
            <span className="text-sm text-slate-300 font-medium">
              admin / Manage Schedule /{" "}
            </span>{" "}
            Start Scraping
          </p>
        </div>

        <Link
          to="/manage-schedule"
          className="rounded-2xl bg-slate-900 h-13.75 px-4 min-w-fit text-sm font-medium flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1} /> Back to schedule
        </Link>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-fit">
          <p className="text-sm text-slate-300 font-semibold">Step 1</p>
          <p className="text-base font-semibold">
            Select sports & dates to scrape
          </p>
        </div>
        <hr className="border-dashed border-white/10 w-full" />
        {!!prevConfig?.data?.config && (
          <button
            onClick={() => {
              if (!confirm("Use previous config?")) return;

              setCheckedSportIDs(
                allSports.data
                  ?.filter((aps) =>
                    prevConfig.data.config?.sports.includes(aps.strSport)
                  )
                  ?.map((aps) => aps.idSport) ?? []
              );
              setDates(
                prevConfig.data?.config?.dates.map((date) => ({
                  type: "single",
                  date,
                })) ?? []
              );
            }}
            className="rounded-2xl bg-(--lifted) h-10 px-4 min-w-fit text-sm font-medium flex items-center gap-1.5"
          >
            <SkipBack className="w-4 h-4" strokeWidth={1} /> Use previous config
          </button>
        )}
        <button
          disabled={!checkedSportIDs?.length || !datesValid}
          onClick={() => {
            if (!confirm("Start scraping?")) return;

            startScraping.mutate();
          }}
          className="rounded-2xl bg-(--lifted) h-10 px-4 min-w-fit text-sm font-medium flex items-center gap-1.5"
        >
          <PlayIcon className="w-4 h-4" strokeWidth={1} /> Start Scraper{" "}
          <span className="text-xs text-slate-300">
            {checkedSportIDs.length} sports
          </span>
        </button>
      </div>

      <div className="flex -my-3 items-center gap-2">
        <button
          onClick={() => {
            setCheckedSportIDs(allSports.data?.map((s) => s.idSport) ?? []);
          }}
          className="rounded-2xl bg-(--lifted) h-8 px-4 w-fit text-xs font-medium flex items-center gap-1.5"
        >
          Select all
        </button>

        <button
          onClick={() => [setCheckedSportIDs([])]}
          className="rounded-2xl bg-(--lifted) h-8 px-4 w-fit text-xs font-medium flex items-center gap-1.5"
        >
          Deselect all
        </button>
      </div>

      <div className="p-0.75 rounded-2xl flex items-center gap-2 bg-(--lifted) flex-wrap">
        {allSports.isError && (
          <p className="text-sm font-medium text-center w-full py-2">
            Error: {allSports.error.message}
          </p>
        )}
        {allSports.isLoading && <Loader />}
        {allSports.data?.map((sport) => (
          <div
            key={sport.idSport}
            className={cn(
              "flex items-center h-11 transition-all duration-300 gap-2.5 border border-slate-900 px-3 rounded-2xl ",
              checkedSportIDs.includes(sport.idSport)
                ? "bg-slate-900"
                : "bg-transparent"
            )}
          >
            <Checkbox
              checked={checkedSportIDs.includes(sport.idSport)}
              onCheckedChange={(val) => {
                if (val) {
                  setCheckedSportIDs([...checkedSportIDs, sport.idSport]);
                } else {
                  setCheckedSportIDs(
                    checkedSportIDs.filter((id) => id !== sport.idSport)
                  );
                }
              }}
            />

            <p className="text-sm font-semibold">{sport.strSport}</p>
          </div>
        ))}
      </div>

      <div className="flex -my-3 items-center gap-2">
        <button
          onClick={() => {
            setDates([...dates, { type: "interval" }]);
          }}
          className="rounded-2xl bg-(--lifted) h-8 px-4 w-fit text-xs font-medium flex items-center gap-1.5"
        >
          Add date
        </button>

        <button
          onClick={() => {
            if (!confirm("Are you sure you want to delete all dates?")) return;

            setDates([]);
          }}
          className="rounded-2xl bg-(--lifted) h-8 px-4 w-fit text-xs font-medium flex items-center gap-1.5"
        >
          Delete all dates
        </button>
      </div>

      <div className="p-0.75 rounded-2xl flex items-center gap-2 bg-(--lifted) flex-wrap">
        {dates.map((date, idx) => (
          <div
            key={idx}
            className="flex rounded-2xl bg-slate-900 px-3 pr-1 py-0.5 items-center gap-1"
          >
            <p className="text-xs font-medium">type</p>
            <Select
              value={date.type}
              onValueChange={(val) => {
                const temp = [...dates];
                temp[idx].type = val as "interval" | "single";
                if (val === "interval") {
                  temp[idx].date = null;
                  delete temp[idx].date;
                } else {
                  temp[idx].start = null;
                  delete temp[idx].start;
                  temp[idx].end = null;
                  delete temp[idx].end;
                }
                setDates(temp);
              }}
            >
              <SelectTrigger className="bg-(--lifted)! border-none">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interval">Interval</SelectItem>
                <SelectItem value="single">Single</SelectItem>
              </SelectContent>
            </Select>

            {date.type === "interval" ? (
              <div className="flex items-center gap-1">
                <p className="text-xs ml-1 font-medium">start</p>
                <input
                  type="date"
                  value={date?.start ?? undefined}
                  onChange={(e) => {
                    if (!e?.target?.valueAsDate) return;

                    const temp = [...dates];
                    temp[idx].start = e.target.valueAsDate
                      ?.toISOString()
                      .split("T")[0];
                    setDates(temp);
                  }}
                  className="h-9 bg-(--lifted) rounded-2xl text-sm px-4 font-medium text-white"
                />

                <p className="text-xs ml-1 font-medium">end</p>
                <input
                  type="date"
                  value={date?.end ?? undefined}
                  onChange={(e) => {
                    if (!e?.target?.valueAsDate) return;

                    const temp = [...dates];
                    temp[idx].end = e.target.valueAsDate
                      ?.toISOString()
                      .split("T")[0];
                    setDates(temp);
                  }}
                  className="h-9 bg-(--lifted) rounded-2xl text-sm px-4 font-medium text-white"
                />
              </div>
            ) : (
              <>
                <p className="text-xs ml-1 font-medium">date</p>
                <input
                  type="date"
                  value={date?.date ?? undefined}
                  onChange={(e) => {
                    if (!e?.target?.valueAsDate) return;

                    const temp = [...dates];
                    temp[idx].date = e.target.valueAsDate
                      ?.toISOString()
                      .split("T")[0];
                    setDates(temp);
                  }}
                  className="h-9 bg-(--lifted) rounded-2xl text-sm px-4 font-medium text-white"
                />
              </>
            )}

            <button
              onClick={() => {
                const temp = [...dates];
                temp.splice(idx, 1);
                setDates(temp);
              }}
              className="size-9 rounded-2xl bg-(--lifted) flex items-center justify-center"
            >
              <TrashIcon className="w-4 h-4" strokeWidth={1} />
            </button>
          </div>
        ))}
        {!dates?.length && (
          <p className="text-sm text-center w-full font-medium py-2">
            No dates. (At least 1 is required)
          </p>
        )}
      </div>

      <AlertDialog open={!!interval}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scraping...</AlertDialogTitle>
            <AlertDialogDescription>
              The scraper is currently running. <br /> <br />
              <span className="text-white font-bold">
                Please wait for the scraper to finish and do not reload the page
                or exit the browser.
              </span>
            </AlertDialogDescription>

            <Loader />
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!errorMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>An error occurred.</AlertDialogTitle>
            <AlertDialogDescription>
              The scraper encountered an error. Please try again.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="w-full flex flex-col gap-0.75 p-0.75 rounded-2xl bg-(--lifted)">
            <div className="flex items-center justify-between w-full">
              <p className="p-2 text-sm font-medium">Error message</p>

              <button
                onClick={() => {
                  setErrorMessage(null);
                }}
                className="rounded-2xl bg-slate-900 flex items-center gap-1.5 px-4 h-9 text-xs"
              >
                <XIcon className="w-4 h-4" strokeWidth={1} /> Close error
              </button>
            </div>
            <pre className="p-2 rounded-2xl bg-slate-900">
              {JSON.stringify(errorMessage, null, 2)}
            </pre>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={unprocessedMatchesOpen}
        onOpenChange={(val) => {
          setUnprocessedMatchesOpen(val);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unprocessed matches found</AlertDialogTitle>
            <AlertDialogDescription className="text-white! p-3! rounded-2xl bg-(--lifted)">
              There are unprocessed scraped matches saved. Do you want to use
              them right now instead of scraping? <br />
              <br />
              This can happen if you have reloaded the page when the scraper was
              still running.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center gap-2 w-full">
            <div className="w-full">
              <AlertDialogAction
                asChild
                className="justify-between px-4! w-full"
              >
                <button
                  onClick={() => {
                    const dataMatches: TMatch[] =
                      scrapedMatches.data?.matches ?? [];
                    setMatches(dataMatches ?? []);
                    setSelectedLeagueIDs(
                      Array.from(
                        new Set(
                          dataMatches?.map((m) => m?.league_id ?? "") ?? []
                        )
                      )
                    );
                    setSelectedMatchIDs(
                      Array.from(new Set(dataMatches?.map((m) => m.id) ?? []))
                    );
                    const prev = { ...selectedMatchStampTypes };
                    for (const match of dataMatches) {
                      if (!!match?.ltTimestamp && !!match?.stTimestamp) {
                        prev[match.id] = "st";
                      }

                      if (!!match?.ltTimestamp && !match?.stTimestamp) {
                        prev[match.id] = "lt";
                      }
                      if (!!match?.stTimestamp && !match?.ltTimestamp) {
                        prev[match.id] = "st";
                      }
                    }
                    setSelectedMatchStampTypes(prev);
                  }}
                >
                  Yes <ArrowRight className="size-4" strokeWidth={1} />
                </button>
              </AlertDialogAction>
            </div>
            <div className="w-full">
              <AlertDialogCancel
                asChild
                className="border-none justify-between px-4! w-full rounded-full"
              >
                <button>
                  No <XIcon className="w-4 h-4" strokeWidth={1} />
                </button>
              </AlertDialogCancel>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {!!matches?.length && (
        <>
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-fit">
              <p className="text-sm text-slate-300 font-semibold">Step 2</p>
              <p className="text-base font-semibold">Select Matches</p>
            </div>
            <hr className="border-dashed border-white/10 w-full" />

            <button
              disabled={!acceptedMatches.length || acceptMatches.isPending}
              onClick={() => {
                if (
                  !confirm(
                    `Are you sure you want to commit ${acceptedMatches.length} matches?`
                  )
                )
                  return;

                acceptMatches.mutate();
              }}
              className="rounded-2xl bg-(--lifted) h-10 px-4 min-w-fit text-sm font-medium flex items-center gap-1.5"
            >
              <UploadIcon className="w-4 h-4" strokeWidth={1} /> Accept{" "}
              {acceptedMatches.length} matches{" "}
            </button>
          </div>

          <div className="rounded-full p-0.75 bg-(--lifted) flex items-center gap-1">
            <input
              className="h-10.25 text-sm rounded-full bg-slate-900 w-full px-4 placeholder:text-slate-300 focus:outline-none"
              placeholder="Search leagues..."
              value={leagueQuery}
              onChange={(e) => {
                setLeagueQuery(e.target.value);
              }}
            />

            <button
              className="h-10.25 rounded-full px-4 text-sm font-medium bg-slate-900 min-w-fit"
              onClick={() => {
                const dataMatches: TMatch[] =
                  scrapedMatches.data?.matches ?? [];
                setSelectedLeagueIDs(
                  Array.from(
                    new Set(dataMatches?.map((m) => m?.league_id ?? "") ?? [])
                  )
                );
              }}
            >
              Select all leagues
            </button>

            <button
              className="h-10.25 rounded-full px-4 text-sm font-medium bg-slate-900 min-w-fit"
              onClick={() => {
                setSelectedLeagueIDs([]);
              }}
            >
              Deselect all leagues
            </button>

            <button
              className="h-10.25 rounded-full px-4 text-sm font-medium bg-slate-900 min-w-fit"
              onClick={() => {
                const dataMatches: TMatch[] =
                  scrapedMatches.data?.matches ?? [];
                setSelectedMatchIDs(
                  Array.from(new Set(dataMatches?.map((m) => m.id) ?? []))
                );
              }}
            >
              Select all matches
            </button>

            <button
              className="h-10.25 rounded-full px-4 text-sm font-medium bg-slate-900 min-w-fit"
              onClick={() => {
                setSelectedMatchIDs([]);
              }}
            >
              Deselect all matches
            </button>

            <Dialog>
              <DialogTrigger asChild>
                <button className="h-10.25 rounded-full px-4 text-sm font-medium bg-slate-900 min-w-fit">
                  Select by countries
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select matches by countries</DialogTitle>
                  <DialogDescription>
                    Select the countries you want to have matches from.
                  </DialogDescription>
                </DialogHeader>

                <div className="p-0.75 bg-(--lifted) flex flex-col gap-0.75 rounded-2xl">
                  {Array.from(
                    new Set(matches.map((match) => match.league_country))
                  ).map((country, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900"
                    >
                      <Checkbox
                        checked={
                          selectedMatchCountries[country] !== undefined
                            ? selectedMatchCountries[country]
                            : true
                        }
                        onCheckedChange={(val) => {
                          if (!val) {
                            const prev = { ...selectedMatchCountries };
                            prev[country] = false;
                            setSelectedMatchCountries(prev);
                          } else {
                            const prev = { ...selectedMatchCountries };
                            prev[country] = true;
                            setSelectedMatchCountries(prev);
                          }
                        }}
                      />
                      <p className="text-sm font-medium">{country}</p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Table className="min-h-full">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Sport</TableHead>
                <TableHead className="text-right">
                  Country /<br />
                  Time & Date
                </TableHead>
                <TableHead className="text-right">Accepted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(matchesByLeague ?? {}).map((league, idx) => (
                <Fragment key={idx}>
                  <TableRow className="bg-slate-900! [&>td]:bg-slate-900!">
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-bold text-base">
                      <div className="flex items-center gap-1.5">
                        {matchesByLeague[league][0]?.league_image && (
                          <img
                            src={matchesByLeague[league][0]?.league_image}
                            className="size-6 rounded-full"
                            alt=""
                          />
                        )}
                        {league}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {matchesByLeague[league][0]?.sport}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {matchesByLeague[league][0]?.league_country}
                    </TableCell>
                    <TableCell className="">
                      <div className="flex items-center justify-end">
                        <Checkbox
                          checked={
                            selectedMatchCountries?.[
                              matchesByLeague[league][0]?.league_country
                            ] === false
                              ? false
                              : selectedLeagueIDs.includes(
                                  matchesByLeague[league][0]?.league_id ?? ""
                                )
                          }
                          disabled={
                            selectedMatchCountries?.[
                              matchesByLeague[league][0]?.league_country
                            ] === false
                          }
                          onCheckedChange={(val) => {
                            if (val) {
                              setSelectedLeagueIDs([
                                ...selectedLeagueIDs,
                                matchesByLeague[league][0]?.league_id ?? "",
                              ]);
                            } else {
                              setSelectedLeagueIDs(
                                selectedLeagueIDs.filter(
                                  (id) =>
                                    id !== matchesByLeague[league][0]?.league_id
                                )
                              );
                            }
                          }}
                        />

                        <hr className="w-[20px] border-dashed" />
                      </div>
                    </TableCell>
                  </TableRow>

                  {matchesByLeague[league].map((match, mIdx) => (
                    <TableRow
                      key={match.id}
                      className="bg-slate-900! [&>td]:bg-slate-900!"
                    >
                      <TableCell className="font-semibold">
                        {idx + 1}
                        <span className="font-normal font-bold text-slate-300">
                          .
                        </span>
                        {mIdx + 1}
                      </TableCell>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          {!!match?.team1_image && (
                            <img
                              src={match.team1_image}
                              className="size-4 rounded-full"
                            />
                          )}
                          {match.team1}{" "}
                          {match.team2 ? (
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-slate-300 font-normal">
                                vs
                              </span>{" "}
                              {match.team2}
                              {!!match?.team2_image && (
                                <img
                                  src={match.team2_image}
                                  className="size-4 rounded-full"
                                />
                              )}
                            </span>
                          ) : (
                            <></>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {match.sport}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm font-medium w-full justify-end flex items-center gap-1">
                          <p className="text-xs font-medium text-slate-300">
                            @
                          </p>

                          <p>
                            {new Intl.DateTimeFormat("ro-RO", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hourCycle: "h23",
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            }).format(
                              new Date(
                                !match?.stTimestamp && !match?.ltTimestamp
                                  ? match.timestamp
                                  : selectedMatchStampTypes[match.id] === "lt"
                                  ? match.ltTimestamp!
                                  : match.stTimestamp!
                              )
                            )}
                          </p>

                          {!!match?.stTimestamp && (
                            <button
                              className={cn(
                                "text-xs font-medium text-slate-300 hover:underline",
                                selectedMatchStampTypes[match.id] === "st" &&
                                  "text-white! underline"
                              )}
                              onClick={() => {
                                const prev = { ...selectedMatchStampTypes };
                                prev[match.id] = "st";
                                setSelectedMatchStampTypes(prev);
                              }}
                            >
                              ST
                            </button>
                          )}
                          {!!match?.ltTimestamp && (
                            <button
                              className={cn(
                                "text-xs font-medium text-slate-300 hover:underline",
                                selectedMatchStampTypes[match.id] === "lt" &&
                                  "text-white! underline"
                              )}
                              onClick={() => {
                                const prev = { ...selectedMatchStampTypes };
                                prev[match.id] = "lt";
                                setSelectedMatchStampTypes(prev);
                              }}
                            >
                              LT
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          <Checkbox
                            disabled={
                              !selectedLeagueIDs.includes(
                                matchesByLeague[league]?.[0]?.league_id ?? ""
                              ) ||
                              selectedMatchCountries?.[match.league_country] ===
                                false
                            }
                            checked={
                              !!acceptedMatches.find(
                                (aMatch) => aMatch.id === match.id
                              )
                            }
                            onCheckedChange={(val) => {
                              if (val) {
                                setSelectedMatchIDs([
                                  ...selectedMatchIDs,
                                  match.id,
                                ]);
                              } else {
                                setSelectedMatchIDs(
                                  selectedMatchIDs.filter(
                                    (id) => id !== match.id
                                  )
                                );
                              }
                            }}
                            className="mr-2"
                          />
                          <hr className="w-[35px] border-dashed" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow className="bg-(--lifted)!">
                    <TableCell className="text-center"></TableCell>
                    <TableCell className="text-center"></TableCell>
                    <TableCell className="text-center"></TableCell>
                    <TableCell className="text-center"></TableCell>
                    <TableCell className="text-center"></TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>

          {/* <div className="flex items-start justify-start gap-4"></div> */}

          {/* <pre>{JSON.stringify(matches, null, 2)}</pre> */}
        </>
      )}
      {/* <pre>{JSON.stringify(allSports.data, null, 2)}</pre> */}

      {/* {matches.map((match) => (
        <div key={match.id} className="p-0.75 rounded-2xl bg-(--lifted)"></div>
      ))} */}

      {/* <pre>{JSON.stringify(selectedLeagueIDs, null, 2)}</pre>
      <pre>{JSON.stringify(selectedMatchIDs, null, 2)}</pre> */}

      {/* <pre>{JSON.stringify(selectedMatchStampTypes, null, 2)}</pre> */}
    </div>
  );
};
