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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/axios";
import { queryClient } from "@/lib/query-client";
import type { TUser, TWebsiteConfig } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Page_ManageWebsite = () => {
  const currUser = useQuery<TUser>({
    queryKey: ["user.me"],
    queryFn: async () => {
      return await api.get("/user/me").then((res) => res.data.user);
    },
    retry: false,
  });

  const websiteConfig = useQuery<TWebsiteConfig>({
    queryKey: ["websiteConfig"],
    queryFn: async () => {
      return await api
        .get("/manage-website/get-config")
        .then((res) => res.data);
    },
  });

  const [currSizedCode, setCurrSizedCode] = useState("");
  const [currWidth, setCurrWidth] = useState(0);
  const [currHeight, setCurrHeight] = useState(0);
  const setSizedAd = useMutation({
    mutationFn: async (data: { adField: string }) => {
      return await api.post("/manage-website/set-sized-ad", {
        adField: data.adField,
        code: currSizedCode,
        width: currWidth,
        height: currHeight,
      });
    },
    onSuccess: () => {
      toast.success("Sized ad set successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setCurrSizedCode("");
      setCurrHeight(0);
      setCurrWidth(0);
    },
  });

  const removeSizedAd = useMutation({
    mutationFn: async (data: { adField: string }) => {
      return await api.post("/manage-website/remove-sized-ad", {
        adField: data.adField,
      });
    },
    onSuccess: () => {
      toast.success("Sized ad removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
    },
  });

  const [currFooterScriptCode, setCurrFooterScriptCode] = useState("");
  const addFooterScript = useMutation({
    mutationFn: async () => {
      return await api.post("/manage-website/add-footer-script", {
        code: currFooterScriptCode,
      });
    },
    onSuccess: () => {
      toast.success("Footer script added successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setCurrFooterScriptCode("");
    },
  });

  const removeFooterScript = useMutation({
    mutationFn: async (data: { idx: number }) => {
      return await api.post("/manage-website/remove-footer-script", {
        idx: data.idx,
      });
    },
    onSuccess: () => {
      toast.success("Footer script removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
    },
  });

  const [currLTVScriptCode, setCurrLTVScriptCode] = useState("");
  const addLTVScript = useMutation({
    mutationFn: async () => {
      return await api.post("/manage-website/add-ltv-script", {
        code: currLTVScriptCode,
      });
    },
    onSuccess: () => {
      toast.success("LiveTV script added successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setCurrFooterScriptCode("");
    },
  });

  const removeLTVScript = useMutation({
    mutationFn: async (data: { idx: number }) => {
      return await api.post("/manage-website/remove-ltv-script", {
        idx: data.idx,
      });
    },
    onSuccess: () => {
      toast.success("LiveTV script removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
    },
  });

  const [currAffiliateLink, setCurrAffiliateLink] = useState("");
  const setAffiliateLink = useMutation({
    mutationFn: async () => {
      return await api.post("/manage-website/set-player-affiliate", {
        link: currAffiliateLink,
      });
    },
    onSuccess: () => {
      toast.success("Affiliate link set successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setCurrAffiliateLink("");
    },
  });

  const [currAdminNotice, setCurrAdminNotice] = useState("");
  const setAdminNotice = useMutation({
    mutationFn: async () => {
      return await api.post("/manage-website/set-admin-notice", {
        notice: currAdminNotice,
      });
    },
    onSuccess: () => {
      toast.success("Admin notice set successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setCurrAdminNotice("");
    },
  });

  const [flName, setFlName] = useState("");
  const [flHref, setFlHref] = useState("");
  const [flDomains, setFlDomains] = useState("");
  const addFooterLink = useMutation({
    mutationFn: async () => {
      return await api.post("/manage-website/add-footer-link", {
        name: flName,
        href: flHref,
        applicableDomains: flDomains,
      });
    },
    onSuccess: () => {
      toast.success("Footer link added successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setFlName("");
      setFlHref("");
      setFlDomains("");
    },
  });

  const [editFlOpen, setEditFlOpen] = useState(false);
  const editFooterLink = useMutation({
    mutationFn: async ({ idx }: { idx: number }) => {
      return await api.post("/manage-website/edit-footer-link", {
        name: flName,
        href: flHref,
        applicableDomains: flDomains,
        idx,
      });
    },
    onSuccess: () => {
      toast.success("Footer link edited successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setFlName("");
      setFlHref("");
      setFlDomains("");
    },
  });

  const removeFooterLink = useMutation({
    mutationFn: async (data: { idx: number }) => {
      return await api.post("/manage-website/remove-footer-link", {
        idx: data.idx,
      });
    },
    onSuccess: () => {
      toast.success("Footer link removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
    },
  });

  const [domainSite, setDomainSite] = useState("");
  const [domainName, setDomainName] = useState("");
  const [domainSpecificSport, setDomainSpecificSport] = useState("");
  const [prevDomain, setPrevDomain] = useState("");
  const setDomain = useMutation({
    mutationFn: async () => {
      return await api.post("/manage-website/set-site-domain", {
        domain: domainName,
        name: domainSite,
        specificSport: domainSpecificSport,
        prevDomain,
      });
    },
    onSuccess: () => {
      toast.success("Domain config set successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setDomainSite("");
      setDomainName("");
      setDomainSpecificSport("");
    },
  });

  const removeDomain = useMutation({
    mutationFn: async ({ domain }: { domain: string }) => {
      return await api.post("/manage-website/remove-site-domain", {
        domain,
      });
    },
    onSuccess: () => {
      toast.success("Domain config removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setDomainSite("");
      setDomainName("");
      setDomainSpecificSport("");
    },
  });

  const [editDomainConfigOpen, setEditDomainConfigOpen] = useState(false);

  const [hcCode, setHcCode] = useState("");
  const [hcDomains, setHcDomains] = useState("");
  const addHeadContent = useMutation({
    mutationFn: async () => {
      return await api.post("/manage-website/add-head-content", {
        code: hcCode,
        domains: hcDomains,
      });
    },
    onSuccess: () => {
      toast.success("Head content added successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
    },
  });

  const [editHcOpen, setEditHcOpen] = useState(false);
  const editHeadContent = useMutation({
    mutationFn: async ({ idx }: { idx: number }) => {
      return await api.post("/manage-website/edit-head-content", {
        code: hcCode,
        domains: hcDomains,
        idx,
      });
    },
    onSuccess: () => {
      toast.success("Head content edited successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setHcCode("");
      setHcDomains("");
    },
  });

  const deleteHeadContent = useMutation({
    mutationFn: async ({ idx }: { idx: number }) => {
      return await api.post("/manage-website/delete-head-content", {
        idx,
      });
    },
    onSuccess: () => {
      toast.success("Head content deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setHcCode("");
      setHcDomains("");
    },
  });

  const [bcCode, setBcCode] = useState("");
  const [bcDomains, setBcDomains] = useState("");
  const addBodyContent = useMutation({
    mutationFn: async () => {
      return await api.post("/manage-website/add-body-content", {
        code: bcCode,
        domains: bcDomains,
      });
    },
    onSuccess: () => {
      toast.success("Body content added successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setBcCode("");
      setBcDomains("");
    },
  });

  const [editBcOpen, setEditBcOpen] = useState(false);
  const editBodyContent = useMutation({
    mutationFn: async ({ idx }: { idx: number }) => {
      return await api.post("/manage-website/edit-body-content", {
        code: bcCode,
        domains: bcDomains,
        idx,
      });
    },
    onSuccess: () => {
      toast.success("Body content edited successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
      setBcCode("");
      setBcDomains("");
    },
  });

  const deleteBodyContent = useMutation({
    mutationFn: async ({ idx }: { idx: number }) => {
      return await api.post("/manage-website/delete-body-content", {
        idx,
      });
    },
    onSuccess: () => {
      toast.success("Body content deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["websiteConfig"] });
    },
  });

  if (!currUser?.data && currUser.isError) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <div className="rounded-2xl p-0.75 bg-(--lifted) w-full min-h-13.75">
        <div className="rounded-2xl flex items-center justify-between px-4 h-13.75 w-full bg-slate-900">
          <p className="text-2xl font-bold">
            <span className="text-sm text-slate-300 font-medium">admin / </span>
            Manage website
          </p>
        </div>
      </div>

      {websiteConfig.isLoading ? (
        <Loader />
      ) : (
        <div className="flex items-start gap-4">
          <div className="flex w-full flex-col gap-4">
            <div className="rounded-2xl flex flex-col gap-1 h-fit p-0.75 bg-(--lifted) w-full">
              <div className="flex items-center h-13.75 gap-1">
                <div className="rounded-2xl flex items-center justify-between p-4 h-full w-full bg-slate-900">
                  <p className="text-base font-semibold">Sized scripts</p>
                </div>
              </div>

              {Object.keys(websiteConfig.data?.sizedAds ?? {}).map((ad) => (
                <div className="flex items-start gap-2">
                  <div className="rounded-2xl flex flex-col gap-1 p-4 w-full bg-slate-900">
                    <div>
                      <p className="text-xs text-slate-300">Name</p>
                      <p className="text-sm font-medium">{ad}</p>
                    </div>

                    {websiteConfig?.data?.sizedAds?.[ad] ? (
                      <>
                        <div>
                          <p className="text-xs text-slate-300">Code</p>
                          <pre>{websiteConfig.data?.sizedAds[ad].code}</pre>
                        </div>

                        <div>
                          <p className="text-xs text-slate-300">
                            Width x Height
                          </p>
                          <p className="text-sm font-medium">
                            {websiteConfig.data?.sizedAds[ad]?.width} x{" "}
                            {websiteConfig.data?.sizedAds[ad]?.height}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-300">Status</p>
                        <p className="text-sm font-medium">-Script not set-</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 min-w-fit">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 py-3 px-4">
                          <EditIcon className="w-4 h-4" strokeWidth={1} /> Set
                          script
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Set sized ad</AlertDialogTitle>
                          <AlertDialogDescription>
                            For {ad}
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="w-full flex flex-col gap-1">
                          <p className="text-sm text-slate-300 ">Code</p>
                          <textarea
                            placeholder="code"
                            className="p-4 rounded-2xl w-full bg-white/5 font-mono! text-sm"
                            value={currSizedCode}
                            onChange={(e) => setCurrSizedCode(e.target.value)}
                          />
                        </div>

                        <div className="flex items-center max-w-full gap-2">
                          <div className="w-full flex flex-col gap-1">
                            <p className="text-sm text-slate-300">Width</p>
                            <input
                              type="number"
                              placeholder="width"
                              className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                              value={currWidth}
                              onChange={(e) =>
                                setCurrWidth(e.target.valueAsNumber)
                              }
                            />
                          </div>

                          <p className="text-sm text-slate-300 mt-4">x</p>

                          <div className="w-full flex flex-col gap-1">
                            <p className="text-sm text-slate-300">Height</p>
                            <input
                              type="number"
                              placeholder="width"
                              className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                              value={currHeight}
                              onChange={(e) =>
                                setCurrHeight(e.target.valueAsNumber)
                              }
                            />
                          </div>
                        </div>

                        <AlertDialogAction asChild>
                          <Button
                            disabled={setSizedAd.isPending}
                            onClick={() => {
                              setSizedAd.mutate({
                                adField: ad,
                              });
                            }}
                          >
                            Yes, set ad
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogContent>
                    </AlertDialog>

                    <button
                      onClick={() => {
                        if (
                          !confirm("Are you sure you want to remove this ad?")
                        )
                          return;

                        removeSizedAd.mutate({
                          adField: ad,
                        });
                      }}
                      disabled={removeSizedAd.isPending}
                      className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 py-3 px-4"
                    >
                      <TrashIcon className="w-4 h-4" strokeWidth={1} /> Remove
                      script
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl flex flex-col gap-1 h-fit p-0.75 bg-(--lifted) w-full">
              <div className="flex items-center h-13.75 gap-1">
                <div className="rounded-2xl flex items-center justify-between p-4 h-full w-full bg-slate-900">
                  <p className="text-base font-semibold">Footer scripts</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 h-full px-4">
                      <PlusIcon className="w-4 h-4" strokeWidth={1} /> Add
                      script
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Add a footer script</AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Code</p>
                      <textarea
                        placeholder="code"
                        className="p-4 rounded-2xl w-full bg-white/5 font-mono! text-sm"
                        value={currFooterScriptCode}
                        onChange={(e) =>
                          setCurrFooterScriptCode(e.target.value)
                        }
                      />
                    </div>

                    <AlertDialogAction asChild>
                      <Button
                        disabled={addFooterScript.isPending}
                        onClick={() => {
                          addFooterScript.mutate();
                        }}
                      >
                        Continue
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {websiteConfig.data?.footerScripts.map((footerScript, idx) => (
                <div className="flex items-start gap-2">
                  <div className="rounded-2xl flex flex-col gap-1 p-4 w-full bg-slate-900">
                    <div>
                      <p className="text-xs text-slate-300">Code</p>
                      <pre>{footerScript}</pre>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 min-w-fit">
                    <button
                      onClick={() => {
                        if (
                          !confirm(
                            "Are you sure you want to remove this script?"
                          )
                        )
                          return;

                        removeFooterScript.mutate({
                          idx,
                        });
                      }}
                      disabled={removeFooterScript.isPending}
                      className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 py-3 px-4"
                    >
                      <TrashIcon className="w-4 h-4" strokeWidth={1} /> Remove
                      script
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl flex flex-col gap-1 h-fit p-0.75 bg-(--lifted) w-full">
              <div className="flex items-center h-13.75 gap-1">
                <div className="rounded-2xl flex items-center justify-between p-4 h-full w-full bg-slate-900">
                  <p className="text-base font-semibold">LiveTV scripts</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 h-full px-4">
                      <PlusIcon className="w-4 h-4" strokeWidth={1} /> Add
                      script
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Add a LiveTV script</AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Code</p>
                      <textarea
                        placeholder="code"
                        className="p-4 rounded-2xl w-full bg-white/5 font-mono! text-sm"
                        value={currLTVScriptCode}
                        onChange={(e) => setCurrLTVScriptCode(e.target.value)}
                      />
                    </div>

                    <AlertDialogAction asChild>
                      <Button
                        disabled={addLTVScript.isPending}
                        onClick={() => {
                          addLTVScript.mutate();
                        }}
                      >
                        Continue
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {websiteConfig.data?.liveTvScripts.map((ltvScript, idx) => (
                <div className="flex items-start gap-2">
                  <div className="rounded-2xl flex flex-col gap-1 p-4 w-full bg-slate-900">
                    <div>
                      <p className="text-xs text-slate-300">Code</p>
                      <pre>{ltvScript}</pre>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 min-w-fit">
                    <button
                      onClick={() => {
                        if (
                          !confirm(
                            "Are you sure you want to remove this script?"
                          )
                        )
                          return;

                        removeLTVScript.mutate({
                          idx,
                        });
                      }}
                      disabled={removeLTVScript.isPending}
                      className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 py-3 px-4"
                    >
                      <TrashIcon className="w-4 h-4" strokeWidth={1} /> Remove
                      script
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl flex flex-col gap-1 h-fit p-0.75 bg-(--lifted) w-full">
              <div className="flex items-center h-13.75 gap-1">
                <div className="rounded-2xl flex items-center justify-between p-4 h-full w-full bg-slate-900">
                  <p className="text-base font-semibold">
                    Pre-start player affiliate link
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 h-full px-4">
                      <EditIcon className="w-4 h-4" strokeWidth={1} /> Set link
                    </button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Set affiliate link</AlertDialogTitle>
                      <AlertDialogDescription>
                        For no link, leave empty.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Link</p>
                      <input
                        placeholder="link"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={currAffiliateLink}
                        onChange={(e) => setCurrAffiliateLink(e.target.value)}
                      />
                    </div>

                    <AlertDialogAction asChild>
                      <Button
                        disabled={setAffiliateLink.isPending}
                        onClick={() => {
                          setAffiliateLink.mutate();
                        }}
                      >
                        Continue
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900">
                <p className="text-xs text-slate-300">Link</p>
                <pre>
                  {websiteConfig.data?.playerPreStartAffiliateLink
                    ? websiteConfig.data?.playerPreStartAffiliateLink
                    : "-No link-"}
                </pre>
              </div>
            </div>

            <div className="rounded-2xl flex flex-col gap-1 h-fit p-0.75 bg-(--lifted) w-full">
              <div className="flex items-center h-13.75 gap-1">
                <div className="rounded-2xl flex items-center justify-between p-4 h-full w-full bg-slate-900">
                  <p className="text-base font-semibold">Admin notice</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 h-full px-4">
                      <EditIcon className="w-4 h-4" strokeWidth={1} /> Set
                      notice
                    </button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Set admin notice</AlertDialogTitle>
                      <AlertDialogDescription>
                        For no notice, leave empty.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Notice</p>
                      <input
                        placeholder="notice"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={currAdminNotice}
                        onChange={(e) => setCurrAdminNotice(e.target.value)}
                      />
                    </div>

                    <AlertDialogAction asChild>
                      <Button
                        disabled={setAdminNotice.isPending}
                        onClick={() => {
                          setAdminNotice.mutate();
                        }}
                      >
                        Continue
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900">
                <p className="text-xs text-slate-300">Notice</p>
                <pre>
                  {websiteConfig.data?.adminNotice
                    ? websiteConfig.data?.adminNotice
                    : "-No notice-"}
                </pre>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <div className="rounded-2xl flex flex-col gap-1 h-fit p-0.75 bg-(--lifted) w-full">
              <div className="flex items-center h-13.75 gap-1">
                <div className="rounded-2xl flex items-center justify-between p-4 h-full w-full bg-slate-900">
                  <p className="text-base font-semibold">Footer links</p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 h-full px-4">
                      <PlusIcon className="w-4 h-4" strokeWidth={1} /> Add link
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Add a footer link</AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Name</p>
                      <input
                        placeholder="name"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={flName}
                        onChange={(e) => setFlName(e.target.value)}
                      />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Link</p>
                      <input
                        placeholder="href"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={flHref}
                        onChange={(e) => setFlHref(e.target.value)}
                      />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">
                        Domains (optional)
                      </p>
                      <input
                        placeholder="domains"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={flDomains}
                        onChange={(e) => setFlDomains(e.target.value)}
                      />

                      <p className="text-xs text-slate-300">
                        domains separated by "," - leave empty for link to
                        display on all domains.
                      </p>
                    </div>

                    <AlertDialogAction asChild>
                      <Button
                        disabled={addFooterLink.isPending}
                        onClick={() => {
                          addFooterLink.mutate();
                        }}
                      >
                        Add
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="w-full -mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Href</TableHead>
                    <TableHead>Domains (separated by ",")</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {websiteConfig.data?.footerLinks?.map((link, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{link.name}</TableCell>
                      <TableCell>{link.href}</TableCell>
                      <TableCell>{link.applicableDomains}</TableCell>

                      <TableCell>
                        <div className="w-full flex justify-end gap-1 items-center">
                          <button
                            onClick={() => {
                              setEditFlOpen(true);
                              setFlDomains(link?.applicableDomains ?? "");
                              setFlName(link.name);
                              setFlHref(link.href);
                            }}
                            disabled={removeFooterLink.isPending}
                            className="size-7.5 rounded-lg bg-white/10 flex items-center justify-center"
                          >
                            <EditIcon className="w-4 h-4" strokeWidth={1} />
                          </button>

                          <AlertDialog
                            open={editFlOpen}
                            onOpenChange={(val) => {
                              setEditFlOpen(val);
                              if (val === false) {
                                setTimeout(() => {
                                  setFlName("");
                                  setFlHref("");
                                  setFlDomains("");
                                }, 500);
                              }
                            }}
                          >
                            <AlertDialogContent className="">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Edit a footer link
                                </AlertDialogTitle>
                              </AlertDialogHeader>

                              <div className="w-full flex flex-col gap-1">
                                <p className="text-sm text-slate-300 ">Name</p>
                                <input
                                  placeholder="name"
                                  className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                                  value={flName}
                                  onChange={(e) => setFlName(e.target.value)}
                                />
                              </div>

                              <div className="w-full flex flex-col gap-1">
                                <p className="text-sm text-slate-300 ">Link</p>
                                <input
                                  placeholder="href"
                                  className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                                  value={flHref}
                                  onChange={(e) => setFlHref(e.target.value)}
                                />
                              </div>

                              <div className="w-full flex flex-col gap-1">
                                <p className="text-sm text-slate-300 ">
                                  Domains (optional)
                                </p>
                                <input
                                  placeholder="domains"
                                  className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                                  value={flDomains}
                                  onChange={(e) => setFlDomains(e.target.value)}
                                />

                                <p className="text-xs text-slate-300">
                                  domains separated by "," - leave empty for
                                  link to display on all domains.
                                </p>
                              </div>

                              <AlertDialogAction asChild>
                                <Button
                                  disabled={editFooterLink.isPending}
                                  onClick={() => {
                                    editFooterLink.mutate({
                                      idx,
                                    });
                                  }}
                                >
                                  Edit
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogContent>
                          </AlertDialog>

                          <button
                            onClick={() => {
                              if (
                                !confirm(
                                  "Are you sure you want to delete this footer link?"
                                )
                              )
                                return;

                              removeFooterLink.mutate({
                                idx,
                              });
                            }}
                            disabled={removeFooterLink.isPending}
                            className="size-7.5 rounded-lg bg-white/10 flex items-center justify-center"
                          >
                            <TrashIcon className="w-4 h-4" strokeWidth={1} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="rounded-2xl flex flex-col gap-1 h-fit p-0.75 bg-(--lifted) w-full">
              <div className="flex items-center h-13.75 gap-1">
                <div className="rounded-2xl flex items-center justify-between p-4 h-full w-full bg-slate-900">
                  <p className="text-base font-semibold">
                    Domain configuration
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 h-full px-4">
                      <PlusIcon className="w-4 h-4" strokeWidth={1} /> Add
                      domain
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Add a domain configuration
                      </AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Domain</p>
                      <input
                        placeholder="domain"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                      />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Site name</p>
                      <input
                        placeholder="site name"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={domainSite}
                        onChange={(e) => setDomainSite(e.target.value)}
                      />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">
                        Specific sport (optional)
                      </p>
                      <input
                        placeholder="specific sport"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={domainSpecificSport}
                        onChange={(e) => setDomainSpecificSport(e.target.value)}
                      />
                    </div>

                    <AlertDialogAction asChild>
                      <Button
                        disabled={setDomain.isPending}
                        onClick={() => {
                          setDomain.mutate();
                        }}
                      >
                        Set
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="w-full -mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Site name</TableHead>
                    <TableHead>Specific sport</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(websiteConfig.data?.domainConfig ?? [])?.map(
                    (domain, idx) => {
                      const domainData =
                        websiteConfig.data?.domainConfig[domain];

                      return (
                        <TableRow key={idx}>
                          <TableCell>{domain}</TableCell>
                          <TableCell>{domainData?.name ?? "-"}</TableCell>
                          <TableCell>
                            {domainData?.specificSport ?? "-"}
                          </TableCell>

                          <TableCell>
                            <div className="w-full flex justify-end gap-1 items-center">
                              <button
                                onClick={() => {
                                  setEditDomainConfigOpen(true);
                                  setDomainName(domain);
                                  setDomainSite(domainData?.name ?? "");
                                  setDomainSpecificSport(
                                    domainData?.specificSport ?? ""
                                  );
                                  setPrevDomain(domain);
                                }}
                                disabled={removeFooterLink.isPending}
                                className="size-7.5 rounded-lg bg-white/10 flex items-center justify-center"
                              >
                                <EditIcon className="w-4 h-4" strokeWidth={1} />
                              </button>

                              <AlertDialog
                                open={editDomainConfigOpen}
                                onOpenChange={(val) => {
                                  setEditDomainConfigOpen(val);
                                  if (val === false) {
                                    setTimeout(() => {
                                      setDomainName("");
                                      setDomainSite("");
                                      setPrevDomain("");
                                      setDomainSpecificSport("");
                                    }, 500);
                                  }
                                }}
                              >
                                <AlertDialogContent className="">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Add a domain configuration
                                    </AlertDialogTitle>
                                  </AlertDialogHeader>

                                  <div className="w-full flex flex-col gap-1">
                                    <p className="text-sm text-slate-300 ">
                                      Domain
                                    </p>
                                    <input
                                      placeholder="domain"
                                      className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                                      value={domainName}
                                      onChange={(e) =>
                                        setDomainName(e.target.value)
                                      }
                                    />
                                  </div>

                                  <div className="w-full flex flex-col gap-1">
                                    <p className="text-sm text-slate-300 ">
                                      Site name
                                    </p>
                                    <input
                                      placeholder="site name"
                                      className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                                      value={domainSite}
                                      onChange={(e) =>
                                        setDomainSite(e.target.value)
                                      }
                                    />
                                  </div>

                                  <div className="w-full flex flex-col gap-1">
                                    <p className="text-sm text-slate-300 ">
                                      Specific sport (optional)
                                    </p>
                                    <input
                                      placeholder="specific sport"
                                      className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                                      value={domainSpecificSport}
                                      onChange={(e) =>
                                        setDomainSpecificSport(e.target.value)
                                      }
                                    />
                                  </div>

                                  <AlertDialogAction asChild>
                                    <Button
                                      disabled={setDomain.isPending}
                                      onClick={() => {
                                        setDomain.mutate();
                                      }}
                                    >
                                      Set
                                    </Button>
                                  </AlertDialogAction>
                                </AlertDialogContent>
                              </AlertDialog>

                              <button
                                onClick={() => {
                                  if (
                                    !confirm(
                                      "Are you sure you want to delete this domain config?"
                                    )
                                  )
                                    return;

                                  removeDomain.mutate({
                                    domain,
                                  });
                                }}
                                disabled={removeDomain.isPending}
                                className="size-7.5 rounded-lg bg-white/10 flex items-center justify-center"
                              >
                                <TrashIcon
                                  className="w-4 h-4"
                                  strokeWidth={1}
                                />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="rounded-2xl flex flex-col gap-1 h-fit p-0.75 bg-(--lifted) w-full">
              <div className="flex items-center h-13.75 gap-1">
                <div className="rounded-2xl flex items-center justify-between p-4 h-full w-full bg-slate-900">
                  <p className="text-base font-semibold">Head content</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 h-full px-4">
                      <PlusIcon className="w-4 h-4" strokeWidth={1} /> Add
                      content
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Add head content script
                      </AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Code</p>
                      <textarea
                        placeholder="code"
                        className="p-4 rounded-2xl w-full bg-white/5 font-mono! text-sm"
                        value={hcCode}
                        onChange={(e) => setHcCode(e.target.value)}
                      />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">
                        Domains (optional)
                      </p>
                      <input
                        placeholder="domains"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={hcDomains}
                        onChange={(e) => setHcDomains(e.target.value)}
                      />

                      <p className="text-xs text-slate-300">
                        domains separated by "," - leave empty for link to
                        display on all domains.
                      </p>
                    </div>

                    <AlertDialogAction asChild>
                      <Button
                        disabled={addHeadContent.isPending}
                        onClick={() => {
                          addHeadContent.mutate();
                        }}
                      >
                        Continue
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {websiteConfig.data?.headContent?.map((hc, idx) => (
                <div className="flex items-start gap-2">
                  <div className="rounded-2xl flex flex-col gap-1 p-4 w-full bg-slate-900">
                    <div>
                      <p className="text-xs text-slate-300">Code</p>
                      <pre>{hc.code}</pre>
                    </div>

                    <div>
                      <p className="text-xs text-slate-300">
                        Applicable domains
                      </p>
                      <pre>
                        {hc?.applicableDomains
                          ? hc.applicableDomains
                          : "-All domains-"}
                      </pre>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 min-w-fit">
                    <button
                      onClick={() => {
                        setEditHcOpen(true);
                        setHcCode(hc.code);
                        setHcDomains(hc.applicableDomains ?? "");
                      }}
                      className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 py-3 px-4"
                    >
                      <EditIcon className="w-4 h-4" strokeWidth={1} /> Edit
                      content
                    </button>

                    <AlertDialog
                      open={editHcOpen}
                      onOpenChange={(val) => {
                        setEditHcOpen(val);
                        if (val === false) {
                          setTimeout(() => {
                            setHcCode("");
                            setHcDomains("");
                          }, 500);
                        }
                      }}
                    >
                      <AlertDialogContent className="">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Edit head content script
                          </AlertDialogTitle>
                        </AlertDialogHeader>

                        <div className="w-full flex flex-col gap-1">
                          <p className="text-sm text-slate-300 ">Code</p>
                          <textarea
                            placeholder="code"
                            className="p-4 rounded-2xl w-full bg-white/5 font-mono! text-sm"
                            value={hcCode}
                            onChange={(e) => setHcCode(e.target.value)}
                          />
                        </div>

                        <div className="w-full flex flex-col gap-1">
                          <p className="text-sm text-slate-300 ">
                            Domains (optional)
                          </p>
                          <input
                            placeholder="domains"
                            className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                            value={hcDomains}
                            onChange={(e) => setHcDomains(e.target.value)}
                          />

                          <p className="text-xs text-slate-300">
                            domains separated by "," - leave empty for link to
                            display on all domains.
                          </p>
                        </div>

                        <AlertDialogAction asChild>
                          <Button
                            disabled={editHeadContent.isPending}
                            onClick={() => {
                              editHeadContent.mutate({ idx });
                            }}
                          >
                            Edit
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogContent>
                    </AlertDialog>

                    <button
                      onClick={() => {
                        if (
                          !confirm(
                            "Are you sure you want to remove this content?"
                          )
                        )
                          return;

                        deleteHeadContent.mutate({
                          idx,
                        });
                      }}
                      disabled={deleteHeadContent.isPending}
                      className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 py-3 px-4"
                    >
                      <TrashIcon className="w-4 h-4" strokeWidth={1} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl flex flex-col gap-1 h-fit p-0.75 bg-(--lifted) w-full">
              <div className="flex items-center h-13.75 gap-1">
                <div className="rounded-2xl flex items-center justify-between p-4 h-full w-full bg-slate-900">
                  <p className="text-base font-semibold">Body content</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 h-full px-4">
                      <PlusIcon className="w-4 h-4" strokeWidth={1} /> Add
                      content
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Add body content script
                      </AlertDialogTitle>
                    </AlertDialogHeader>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">Code</p>
                      <textarea
                        placeholder="code"
                        className="p-4 rounded-2xl w-full bg-white/5 font-mono! text-sm"
                        value={bcCode}
                        onChange={(e) => setBcCode(e.target.value)}
                      />
                    </div>

                    <div className="w-full flex flex-col gap-1">
                      <p className="text-sm text-slate-300 ">
                        Domains (optional)
                      </p>
                      <input
                        placeholder="domains"
                        className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                        value={bcDomains}
                        onChange={(e) => setBcDomains(e.target.value)}
                      />

                      <p className="text-xs text-slate-300">
                        domains separated by "," - leave empty for link to
                        display on all domains.
                      </p>
                    </div>

                    <AlertDialogAction asChild>
                      <Button
                        disabled={addBodyContent.isPending}
                        onClick={() => {
                          addBodyContent.mutate();
                        }}
                      >
                        Continue
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {websiteConfig.data?.bodyContent?.map((bc, idx) => (
                <div className="flex items-start gap-2">
                  <div className="rounded-2xl flex flex-col gap-1 p-4 w-full bg-slate-900">
                    <div>
                      <p className="text-xs text-slate-300">Code</p>
                      <pre>{bc.code}</pre>
                    </div>

                    <div>
                      <p className="text-xs text-slate-300">
                        Applicable domains
                      </p>
                      <pre>
                        {bc?.applicableDomains
                          ? bc.applicableDomains
                          : "-All domains-"}
                      </pre>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 min-w-fit">
                    <button
                      onClick={() => {
                        setEditBcOpen(true);
                        setBcCode(bc.code);
                        setBcDomains(bc.applicableDomains ?? "");
                      }}
                      className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 py-3 px-4"
                    >
                      <EditIcon className="w-4 h-4" strokeWidth={1} /> Edit
                      content
                    </button>

                    <AlertDialog
                      open={editBcOpen}
                      onOpenChange={(val) => {
                        setEditBcOpen(val);
                        if (val === false) {
                          setTimeout(() => {
                            setBcCode("");
                            setBcDomains("");
                          }, 500);
                        }
                      }}
                    >
                      <AlertDialogContent className="">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Edit body content script
                          </AlertDialogTitle>
                        </AlertDialogHeader>

                        <div className="w-full flex flex-col gap-1">
                          <p className="text-sm text-slate-300 ">Code</p>
                          <textarea
                            placeholder="code"
                            className="p-4 rounded-2xl w-full bg-white/5 font-mono! text-sm"
                            value={bcCode}
                            onChange={(e) => setBcCode(e.target.value)}
                          />
                        </div>

                        <div className="w-full flex flex-col gap-1">
                          <p className="text-sm text-slate-300 ">
                            Domains (optional)
                          </p>
                          <input
                            placeholder="domains"
                            className="p-4 rounded-2xl w-full bg-white/5 text-sm"
                            value={bcDomains}
                            onChange={(e) => setBcDomains(e.target.value)}
                          />

                          <p className="text-xs text-slate-300">
                            domains separated by "," - leave empty for link to
                            display on all domains.
                          </p>
                        </div>

                        <AlertDialogAction asChild>
                          <Button
                            disabled={editBodyContent.isPending}
                            onClick={() => {
                              editBodyContent.mutate({ idx });
                            }}
                          >
                            Edit
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogContent>
                    </AlertDialog>

                    <button
                      onClick={() => {
                        if (
                          !confirm(
                            "Are you sure you want to remove this content?"
                          )
                        )
                          return;

                        deleteBodyContent.mutate({
                          idx,
                        });
                      }}
                      disabled={deleteBodyContent.isPending}
                      className="bg-slate-900 rounded-2xl min-w-fit text-sm font-medium flex items-center gap-1.5 py-3 px-4"
                    >
                      <TrashIcon className="w-4 h-4" strokeWidth={1} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
