import { NextResponse } from "next/server"

import connectToDatabase from "@/lib/mongodb"
import SongRequestModel from "@/lib/models/song-request"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await params
    const updatedSong = await SongRequestModel.findByIdAndUpdate(
      id,
      { played: true },
      { returnDocument: "after" }
    )

    if (!updatedSong) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    return NextResponse.json({ song: updatedSong })
  } catch (error) {
    console.error("Failed to mark song as played", error)
    return NextResponse.json(
      { error: "Failed to mark song as played" },
      { status: 500 }
    )
  }
}
