"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  Check,
  ChevronDown,
  Heart,
  Music,
  Music4,
  SendHorizontal,
  Share2,
} from "lucide-react"
import QRCode from "qrcode"

import { Button } from "@/components/ui/button"

export default function Page() {
  const [songRequest, setSongRequest] = useState("")
  const [requestedBy, setRequestedBy] = useState("")
  const [dedicatedTo, setDedicatedTo] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")
  const [dedicate, setDedicate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const currentUrl = window.location.href
    setShareUrl(currentUrl)

    QRCode.toDataURL(currentUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: "#ffffff",
        light: "#a684ff",
      },
    })
      .then((dataUrl) => setQrCodeUrl(dataUrl))
      .catch(() => setQrCodeUrl(""))
  }, [])

  useEffect(() => {
    if (!submitted) return
    const timer = setTimeout(() => setSubmitted(false), 5000)
    return () => clearTimeout(timer)
  }, [submitted])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!songRequest.trim()) {
      return
    }

    let username = JSON.parse(localStorage.getItem("username")!) || ""
    if (!username) {
      username =
        requestedBy || "User-" + String(Math.round(100 * Math.random()))
      localStorage.setItem("username", JSON.stringify(username))
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songRequest: songRequest.trim(),
          username: username.trim(),
          requestedBy: requestedBy.trim() || undefined,
          dedicatedTo: dedicatedTo.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Unable to save your request right now.")
      }

      setSongRequest("")
      setRequestedBy("")
      setDedicatedTo("")
      setSubmitted(true)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to save your request right now."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyLink = async () => {
    if (!shareUrl) {
      return
    }

    await navigator.clipboard.writeText(shareUrl)
    setCopyState("copied")
    window.setTimeout(() => setCopyState("idle"), 1600)
  }

  return (
    <div className="relative min-h-svh overflow-hidden px-4 pt-10 pb-6 sm:px-6 lg:px-8">
      {/* Background decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-violet-400/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 size-[400px] rounded-full bg-amber-400/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="mx-auto mb-8 max-w-2xl text-center">
        <div className="mx-auto mb-3 flex w-max items-center gap-2 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-500/20 px-4 py-1.5 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)]">
          <Music4 className="size-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            Cultural day song requests
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Drop your request for the DJ
        </p>
      </header>

      {/* Main card */}
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.04] p-6 shadow-[0_25px_80px_-25px_hsl(var(--primary)/0.2)] backdrop-blur-xl sm:p-8 lg:p-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Song request field */}
            <label className="block space-y-2">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Music className="size-4 text-violet-400" />I would like to
                listen to:
              </span>
              <textarea
                value={songRequest}
                onChange={(event) => {
                  setSongRequest(event.target.value)
                  if (submitted) {
                    setSubmitted(false)
                  }
                }}
                rows={5}
                placeholder="Song title, artist, or even better, a youtube link."
                className="min-h-36 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm shadow-sm transition-all outline-none focus:border-violet-400/50 focus:ring-3 focus:ring-violet-400/20"
                required
              />
            </label>

            {/* Dedicate toggle */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setDedicate(!dedicate)}
                className="group flex cursor-pointer items-center gap-1.5 text-sm text-amber-500 transition-colors hover:text-amber-400"
              >
                <ChevronDown
                  className={`size-4 transition-transform duration-200 ${
                    dedicate ? "rotate-180" : ""
                  }`}
                />
                Dedicate?
              </button>
            </div>

            {/* Dedicate fields */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                dedicate
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-4 pt-1">
                  <p className="text-xs text-violet-400 italic">Optional</p>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Requested by:</span>
                    <input
                      value={requestedBy}
                      onChange={(event) => setRequestedBy(event.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm shadow-sm transition-all outline-none focus:border-violet-400/50 focus:ring-3 focus:ring-violet-400/20"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Dedicated to:</span>
                    <input
                      value={dedicatedTo}
                      onChange={(event) => setDedicatedTo(event.target.value)}
                      placeholder="A friend, event, or moment"
                      className="w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm shadow-sm transition-all outline-none focus:border-violet-400/50 focus:ring-3 focus:ring-violet-400/20"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Submit section */}
            <div className="flex flex-col gap-3 border-t border-violet-400/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Requests are queued for the next available set.
              </p>
              <Button
                type="submit"
                className="bg-violet-600 text-white shadow-sm shadow-violet-600/20 transition-all hover:bg-violet-500 hover:shadow-md hover:shadow-violet-600/30 sm:self-end"
                disabled={isSubmitting}
              >
                <SendHorizontal className="size-4" />
                {isSubmitting ? "Submitting..." : "Submit request"}
              </Button>
            </div>
          </form>

          {/* Success banner */}
          {submitted ? (
            <div className="mt-5 flex animate-in items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 duration-300 fade-in slide-in-from-top-2 dark:text-emerald-400">
              <Check className="size-5 shrink-0 text-emerald-500" />
              Your request has been added to the queue.
            </div>
          ) : null}

          {/* Error banner */}
          {submitError ? (
            <div className="mt-3 flex animate-in items-center gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive duration-300 fade-in slide-in-from-top-2">
              <AlertCircle className="size-5 shrink-0" />
              {submitError}
            </div>
          ) : null}
        </div>
      </div>

      {/* Share button + Footer */}
      <div className="mx-auto mt-8 flex max-w-2xl items-end justify-between">
        <Button
          variant="outline"
          onClick={() => setShareOpen(true)}
          className="border-violet-300/50 text-violet-400 shadow-sm transition-all hover:border-violet-300 hover:shadow-md hover:shadow-violet-400/10 dark:border-violet-400/30 dark:hover:border-violet-400/50"
        >
          <Share2 className="size-4 text-amber-400" />
          Share this page
        </Button>
        <p className="flex items-center gap-1 text-right font-serif text-xs font-light text-muted-foreground">
          made with <Heart className="fill-red-500 stroke-0" size={16} /> by
          Davis😁
        </p>
      </div>

      {/* Share modal */}
      {shareOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm sm:items-center"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full animate-in rounded-t-[2rem] border border-border/70 bg-card p-6 shadow-2xl duration-300 fade-in slide-in-from-bottom-8 sm:max-w-lg sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <p className="text-sm font-medium">Share this page</p>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-5 rounded-2xl border border-border/70 bg-background/60 p-5 sm:flex-row">
              <div className="flex shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-400 to-violet-500 p-4 shadow-sm">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR code for this page"
                    className="h-44 w-44"
                  />
                ) : (
                  <div className="flex h-44 w-44 animate-pulse items-center justify-center rounded-xl bg-violet-300/30 text-sm text-white/80">
                    Generating…
                  </div>
                )}
              </div>

              <div className="w-full space-y-3">
                <div className="rounded-xl border border-border/70 bg-card/80 p-3">
                  <p className="text-[0.6rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                    Link
                  </p>
                  <p className="mt-1.5 text-sm break-all text-foreground">
                    {shareUrl || "Loading link…"}
                  </p>
                </div>
                <Button
                  onClick={copyLink}
                  className="w-full bg-violet-600 text-white transition-all hover:bg-violet-500"
                >
                  {copyState === "copied" ? "Copied ✓" : "Copy link"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
