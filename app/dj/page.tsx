"use client"

import { useEffect, useState } from "react"
import { ListMusic, Lock, LockKeyhole, RefreshCw, SendHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Song {
  _id: string
  songRequest: string
  requestedBy?: string
  dedicatedTo?: string
  username?: string
  played: boolean
  createdAt: string
  updatedAt: string
}

function timeAgo(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return "just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

const DJ_PIN = process.env.NEXT_PUBLIC_DJ_PIN || "0000"

function SongCard({
  song,
  playingIds,
  onMarkPlayed,
}: {
  song: Song
  playingIds: Set<string>
  onMarkPlayed: (id: string) => void
}) {
  return (
    <div
      className={`rounded-md bg-violet-400/5 p-5 shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.2)] backdrop-blur transition-all ${
        song.played ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p
            className={`text-sm font-medium ${
              song.played ? "line-through" : ""
            }`}
          >
            {song.songRequest}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {song.requestedBy ? (
              <span>Requested by {song.requestedBy}</span>
            ) : null}
            {song.dedicatedTo ? (
              <span className="italic">Dedicated to {song.dedicatedTo}</span>
            ) : null}
            <span className="text-[0.65rem]">{timeAgo(song.createdAt)}</span>
          </div>
        </div>

        <Button
          variant={song.played ? "ghost" : "default"}
          size="sm"
          onClick={() => onMarkPlayed(song._id)}
          disabled={song.played || playingIds.has(song._id)}
          className={`shrink-0 ${
            song.played
              ? "text-muted-foreground"
              : "bg-violet-600 text-white"
          }`}
        >
          {song.played
            ? "Played ✓"
            : playingIds.has(song._id)
              ? "Marking…"
              : "Mark played"}
        </Button>
      </div>
    </div>
  )
}

export default function DjPage() {
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState("")
  const [pinError, setPinError] = useState("")
  const [songs, setSongs] = useState<Song[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [playingIds, setPlayingIds] = useState<Set<string>>(new Set())

  const loading = isAuthenticated ? !dataLoaded : false

  const unplayedSongs = [...songs]
    .filter((s) => !s.played)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const playedSongs = [...songs]
    .filter((s) => s.played)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  function fetchSongs() {
    setDataLoaded(false)
    setError(null)

    fetch("/api/songs")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch requests")
        return res.json()
      })
      .then((data) => setSongs(data.songs ?? []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to fetch requests")
      )
      .finally(() => setDataLoaded(true))
  }

  useEffect(() => {
    const authed = sessionStorage.getItem("dj_auth") === "true"
    setIsAuthenticated(authed)
    setMounted(true)

    if (authed) {
      fetchSongs()
    }
  }, [])

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (pin === DJ_PIN) {
      setIsAuthenticated(true)
      setPinError("")
      sessionStorage.setItem("dj_auth", "true")
      fetchSongs()
    } else {
      setPinError("Incorrect PIN")
    }
  }

  function handleLock() {
    setIsAuthenticated(false)
    sessionStorage.removeItem("dj_auth")
    setSongs([])
    setDataLoaded(false)
    setError(null)
    setPin("")
  }

  function markAsPlayed(id: string) {
    setPlayingIds((prev) => new Set(prev).add(id))

    fetch(`/api/songs/${id}`, { method: "PATCH" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to mark as played")
        return res.json()
      })
      .then((data) =>
        setSongs((prev) =>
          prev.map((s) =>
            s._id === id
              ? { ...s, played: true, updatedAt: data.song.updatedAt }
              : s
          )
        )
      )
      .catch(() => setError("Failed to mark song as played"))
      .finally(() =>
        setPlayingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      )
  }

  if (!mounted) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <form
          onSubmit={handleUnlock}
          className="w-full max-w-sm rounded-md bg-violet-400/5 p-8 shadow-[0_20px_80px_-20px_hsl(var(--primary)/0.3)] backdrop-blur"
        >
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-violet-600/10">
              <LockKeyhole className="size-6 text-violet-400" />
            </div>
            <h1 className="text-lg font-medium">DJ Access</h1>
            <p className="text-xs text-muted-foreground">
              Enter the PIN to manage the queue.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setPinError("")
              }}
              placeholder="PIN"
              autoFocus
              className="w-full rounded-xl border border-input bg-background/70 px-4 py-3 text-center text-sm tracking-[0.3em] shadow-sm transition outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
            />

            {pinError ? (
              <p className="text-center text-xs text-destructive">{pinError}</p>
            ) : null}

            <Button
              type="submit"
              className="w-full bg-violet-600 text-white"
              disabled={!pin.trim()}
            >
              <Lock className="size-4" />
              Unlock
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-violet-600/10">
              <ListMusic className="size-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-medium">Song Queue</h1>
              <p className="text-xs text-muted-foreground">
                {songs.length} total request{songs.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLock}
              className="text-xs"
            >
              <LockKeyhole className="size-3.5" />
              Lock
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSongs}
              disabled={loading}
              className="text-xs"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-md bg-violet-400/5 p-5"
              >
                <div className="mb-2 h-4 w-3/4 rounded bg-violet-400/10" />
                <div className="h-3 w-1/2 rounded bg-violet-400/10" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchSongs}>
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-violet-400/10">
              <SendHorizontal className="size-7 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium">No requests yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Share the page so people can start submitting songs.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {unplayedSongs.length > 0 ? (
              <section>
                <h2 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Upcoming — {unplayedSongs.length}
                </h2>
                <div className="space-y-3">
                  {unplayedSongs.map((song) => <SongCard key={song._id} song={song} playingIds={playingIds} onMarkPlayed={markAsPlayed} />)}
                </div>
              </section>
            ) : null}

            {playedSongs.length > 0 ? (
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/30" />
                  <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Played — {playedSongs.length}
                  </h2>
                  <div className="h-px flex-1 bg-border/30" />
                </div>
                <div className="space-y-3">
                  {playedSongs.map((song) => <SongCard key={song._id} song={song} playingIds={playingIds} onMarkPlayed={markAsPlayed} />)}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
