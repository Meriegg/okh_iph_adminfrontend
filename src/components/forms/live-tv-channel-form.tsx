import type { TLiveTvChannel } from "@/types";
import type React from "react";
import languages from "language-list";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";

interface Props {
  defaultValues?: TLiveTvChannel;
  submitUI: React.ReactNode;
  onSubmit: (data: TLiveTvChannel) => void;
}

export const LiveTvChannelForm = ({
  defaultValues,
  submitUI,
  onSubmit,
}: Props) => {
  const [channelName, setChannelName] = useState(
    defaultValues?.channelName ?? ""
  );
  const [channelNameError, setChannelNameError] = useState<string | null>();

  const [language, setLanguage] = useState(defaultValues?.language ?? "");
  const [languageError, setLanguageError] = useState<string | null>();

  const [linksJson, setLinksJson] = useState(
    JSON.parse(defaultValues?.linksJson ?? "[]")
  );
  const [linksJsonError, setLinksJsonError] = useState<string | null>();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>();

  const handleSubmit = () => {
    if (!channelName.trim()) {
      setChannelNameError("Channel name is required");
      return;
    }

    if (!language.trim()) {
      setLanguageError("Language is required");
      return;
    }

    if (!linksJson.length) {
      setLinksJsonError("At least one link is required");
      return;
    }

    if (!file) {
      setFileError("Channel image is required");
      return;
    }

    onSubmit({
      channelName,
      language,
      linksJson,
      channelImage: file as unknown as string,
    } as unknown as TLiveTvChannel);
  };

  return (
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
        <p className="text-red-600 px-2 -mt-1 text-sm ">{channelNameError}</p>
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
        <p className="text-red-600 px-2 -mt-1 text-sm ">{languageError}</p>
      )}

      <div className="justify-between flex mt-1 items-center">
        <p className="text-sm text-slate-300 font-medium">Stream links</p>

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
            }}
            value={linksJson[idx]}
            required
          />

          <button
            onClick={() => {
              const links = [...linksJson];
              links.splice(idx, 1);
              setLinksJson(links);
            }}
            className="min-w-13.75 min-h-13.75 flex bg-white/5 rounded-2xl items-center justify-center"
          >
            <TrashIcon className="w-4 h-4" strokeWidth={1} />
          </button>
        </div>
      ))}

      {linksJsonError && (
        <p className="text-red-600 px-2 -mt-1 text-sm ">{linksJsonError}</p>
      )}

      <hr />

      <p className="text-sm mt-1 text-slate-300 font-medium">
        Channel image (required)
      </p>
      <input
        className="px-4 py-4 rounded-2xl bg-white/5 w-full"
        type="file"
        placeholder="channel image"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
        }}
        required
      />
      {fileError && (
        <p className="text-red-600 px-2 -mt-1 text-sm ">{fileError}</p>
      )}

      <div
        className="w-full"
        onClick={() => {
          handleSubmit();
        }}
      >
        {submitUI}
      </div>
    </div>
  );
};
