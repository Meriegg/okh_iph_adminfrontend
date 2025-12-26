import { countries, getCountryData, type TCountryCode } from "countries-list";
import languages from "language-list";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { TMatch, TUser, TUserLink } from "@/types";
import { SearchSelect } from "../ui/search-select";
import { isTimestampToday } from "@/utils/is-timestamp-today";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

export type UserLinkSubmitData = {
  name: string;
  link: string;
  type: "embed" | "popup" | "normal";
  country: string;
  language: string;
  adsNumber: number;
  matchId: string | null;
};

interface Props {
  dbMatches: TMatch[];
  userLinks: TUserLink[];
  currUser: TUser;
  onSubmit: (data: UserLinkSubmitData) => void;
  submitUI: (submit: () => void) => React.ReactNode;
  defaultValues?: Partial<
    TUserLink & {
      excludeSubmittedMatches?: boolean;
      sport?: string;
    }
  >;
}

export const StreamerLinkForm = ({
  dbMatches,
  userLinks,
  currUser,
  submitUI,
  defaultValues,
  onSubmit,
}: Props) => {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [link, setLink] = useState(defaultValues?.link ?? "");
  const [type, setType] = useState<"embed" | "popup" | "normal">(
    defaultValues?.type ?? "normal"
  );
  const [country, setCountry] = useState(
    defaultValues?.country ?? "United States"
  );
  const [language, setLanguage] = useState(defaultValues?.language ?? "en");
  const [adsNumber, setAdsNumber] = useState(defaultValues?.adsNumber ?? 1);
  const [matchId, setMatchId] = useState<string | null>(
    defaultValues?.match_id ?? null
  );

  const [sport, setSport] = useState<string>(defaultValues?.sport ?? "");

  const [excludeSubmittedMatches, setExcludeSubmittedMatches] = useState(
    typeof defaultValues?.excludeSubmittedMatches !== "boolean"
      ? true
      : defaultValues.excludeSubmittedMatches
  );

  return (
    <>
      <div className="p-0.75 flex flex-col gap-1 bg-(--lifted) rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="">
            <p className="text-xs pl-2 py-1 text-slate-300">Sport</p>

            <Select value={sport} onValueChange={(val) => setSport(val)}>
              <SelectTrigger className="border-none py-3! h-11! bg-slate-900! rounded-2xl! w-full">
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(dbMatches.map((match) => match.sport))).map(
                  (sport, idx) => (
                    <SelectItem value={sport} key={idx}>
                      {sport}
                    </SelectItem>
                  )
                )}
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
                dbMatches
                  ?.filter((match) => match.sport === sport)
                  ?.filter((match) =>
                    excludeSubmittedMatches
                      ? userLinks.findIndex(
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
                        <span className="font-medium flex items-center gap-1 text-xs text-slate-300">
                          {!!match?.league_image && (
                            <img
                              className="size-4 rounded-full"
                              src={
                                match.league_image.startsWith("https://")
                                  ? match.league_image
                                  : `http://localhost:4000/images/${match.league_image}`
                              }
                            />
                          )}{" "}
                          {match.league}
                        </span>
                        <span className="font-semibold flex items-center justify-between">
                          <span className="flex items-center w-full gap-1">
                            {!!match?.team1_image && (
                              <img
                                className="size-4 rounded-full"
                                src={
                                  match.team1_image.startsWith("https://")
                                    ? match.team1_image
                                    : `http://localhost:4000/images/${match.team1_image}`
                                }
                              />
                            )}{" "}
                            {match.team1}{" "}
                          </span>

                          {match.team2 ? (
                            <span className="flex items-center w-full justify-end text-right gap-1">
                              {match.team2}
                              {!!match?.team2_image && (
                                <img
                                  className="size-4 rounded-full"
                                  src={
                                    match.team2_image.startsWith("https://")
                                      ? match.team2_image
                                      : `http://localhost:4000/images/${match.team2_image}`
                                  }
                                />
                              )}{" "}
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
            <p className="text-xs pl-2 py-1 text-slate-300">Channel Name</p>

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

            {/* <Select value={country} onValueChange={(val) => setCountry(val)}>
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
            </Select> */}
            <SearchSelect
              className="w-full"
              value={country ?? ""}
              onValueChange={(val) => setCountry(val)}
              placeholder="Select a country"
              items={Object.keys(countries).map((countryCode) => {
                const country = getCountryData(
                  countryCode as TCountryCode
                ).name;

                return {
                  value: country,
                  text: country,
                };
              })}
            />
          </div>

          <div className="w-full">
            <p className="text-xs pl-2 py-1 text-slate-300">Language</p>

            {/* <Select value={language} onValueChange={(val) => setLanguage(val)}>
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
            </Select> */}

            <SearchSelect
              className="w-full"
              value={language ?? ""}
              onValueChange={(val) => setLanguage(val)}
              placeholder="Select a language"
              items={languages()
                .getLanguageCodes()
                .map((langCode: string) => ({
                  value: langCode,
                  text: languages().getLanguageName(langCode),
                }))}
            />
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
                {!!currUser.permission_linkSubmission && (
                  <SelectItem value="normal">Normal link</SelectItem>
                )}
                {!!currUser.permission_popupSubmission && (
                  <SelectItem value="popup">Popup link</SelectItem>
                )}
                {!!currUser.permission_embedSubmission && (
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

      {submitUI(() => {
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
          return;
        }

        onSubmit({
          name,
          link,
          type,
          country,
          language,
          adsNumber,
          matchId,
        });
      })}
    </>
  );
};
