"use client"

import { useEffect, useState } from "react"
import { Heart, Music4, SendHorizontal, Share2 } from "lucide-react"
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
    <div className="flex min-h-svh flex-col px-4 pt-6 pb-1 sm:px-6 lg:px-8">
      <h1 className="my-3 w-max self-center rounded-full bg-amber-500 px-2 text-center">
        Cultural day song requests
      </h1>
      <div className="mx-auto flex h-max max-w-5xl flex-col justify-between">
        <main className="flex flex-1 flex-col justify-center">
          <div className="rounded-md bg-violet-400/5 p-6 shadow-[0_20px_80px_-20px_hsl(var(--primary)/0.3)] backdrop-blur sm:p-8 lg:p-10">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1 space-y-2">
                <span className="text-sm font-medium">
                  I would like to listen to:
                </span>
                <textarea
                  value={songRequest}
                  onChange={(event) => {
                    setSongRequest(event.target.value)
                    if (submitted) {
                      setSubmitted(false)
                    }
                  }}
                  rows={4}
                  placeholder="Song title, artist, or even better, a youtube link."
                  className="min-h-32 w-full rounded-lg border bg-background/70 px-4 py-3 text-sm shadow-sm transition outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
                  required
                />
              </label>

              <div className="dedicate flex w-full items-center justify-center text-amber-400 underline">
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    setDedicate(!dedicate)
                  }}
                  className="text-amber-500x bg-transparent"
                >
                  Dedicate?
                </Button>
              </div>

              {dedicate && (
                <div className="my-5 flex flex-col gap-4">
                  <div className="lower-sect text-xs text-violet-400 italic">
                    Optional
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Requested by:</span>
                    <input
                      value={requestedBy}
                      onChange={(event) => setRequestedBy(event.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-input bg-background/70 px-4 py-3 text-sm shadow-sm transition outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Dedicated to:</span>
                    <input
                      value={dedicatedTo}
                      onChange={(event) => setDedicatedTo(event.target.value)}
                      placeholder="A friend, event, or moment"
                      className="w-full rounded-xl border border-input bg-background/70 px-4 py-3 text-sm shadow-sm transition outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
                    />
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Requests are queued for the next available set.
                </p>
                <Button
                  type="submit"
                  className="bg-violet-600 text-white sm:self-end"
                  disabled={isSubmitting}
                >
                  <SendHorizontal className="size-4" />
                  {isSubmitting ? "Submitting..." : "Submit request"}
                </Button>
              </div>
            </form>

            {submitted ? (
              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-foreground">
                Your request has been added to the queue.
              </div>
            ) : null}

            {submitError ? (
              <div className="mt-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {submitError}
              </div>
            ) : null}
          </div>
        </main>
      </div>
      <div className="mt-auto flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShareOpen(true)}
          className="border border-violet-300! text-violet-400"
        >
          <Share2 className="size-4 text-amber-400" />
          Share this page
        </Button>
      </div>
      <div className="me mt-3 flex items-center justify-end gap-1 text-right font-serif text-xs font-light">
        made with <Heart className="fill-red-600 stroke-0" size={20} /> by
        Davis😁
      </div>

      {shareOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-background/50 backdrop-blur-sm"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full rounded-t-[2rem] border border-border/70 bg-card p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Share this page</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-[1.5rem] border border-border/70 bg-background/70 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col items-center gap-3 rounded-[1.25rem] border border-border/70 bg-violet-400 p-4 shadow-sm">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR code for this page"
                    className="h-48 w-48"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                    Generating QR code…
                  </div>
                )}
              </div>

              <div className="w-full space-y-3 sm:max-w-sm">
                <div className="rounded-2xl border border-border/70 bg-card/80 p-3">
                  <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                    Link
                  </p>
                  <p className="mt-2 text-sm break-all text-foreground">
                    {shareUrl || "Loading link…"}
                  </p>
                </div>
                <Button onClick={copyLink} className="w-full bg-violet-400">
                  {copyState === "copied" ? "Copied" : "Copy link"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
