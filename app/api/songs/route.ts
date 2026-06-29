import { NextResponse } from "next/server"

import connectToDatabase from "@/lib/mongodb"
import SongRequestModel from "@/lib/models/song-request"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const onlyUnplayed = searchParams.get("played") === "false"
  const sortAsc = searchParams.get("sort") === "asc"

  try {
    await connectToDatabase()

    const query = onlyUnplayed ? { played: false } : {}
    const songs = await SongRequestModel.find(query)
      .sort({ createdAt: sortAsc ? 1 : -1 })
      .lean()

    return NextResponse.json({ songs })
  } catch (error) {
    console.error("Failed to fetch songs", error)
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { songRequest, requestedBy, dedicatedTo, username } = body ?? {}

    if (
      !songRequest ||
      typeof songRequest !== "string" ||
      !songRequest.trim()
    ) {
      return NextResponse.json(
        { error: "songRequest is required" },
        { status: 400 }
      )
    }
    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    const createdSong = await SongRequestModel.create({
      songRequest: songRequest.trim(),
      requestedBy:
        typeof requestedBy === "string" ? requestedBy.trim() : undefined,
      dedicatedTo:
        typeof dedicatedTo === "string" ? dedicatedTo.trim() : undefined,
      username: typeof username === "string" ? username.trim() : undefined,
      played: false,
    })

    return NextResponse.json({ song: createdSong }, { status: 201 })
  } catch (error) {
    console.error("Failed to create song request", error)
    return NextResponse.json(
      { error: "Failed to create song request" },
      { status: 500 }
    )
  }
}
