"use client";

import { useState } from "react";

type VideoMetadata = {
  duration: number;
  width: number;
  height: number;
  fps: number;
};

type UploadResponse = {
  video_id: string;
  file_name: string;
  metadata: VideoMetadata;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please choose an MP4 file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        const message =
          typeof detail?.detail === "string"
            ? detail.detail
            : "Upload failed. Please try again.";
        throw new Error(message);
      }

      const data: UploadResponse = await response.json();
      setResult(data);
    } catch (err) {
      let message = "Something went wrong.";
      
      if (err instanceof TypeError && err.message.includes("fetch")) {
        message = "Cannot connect to server. Make sure the backend is running on http://localhost:8000";
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            CoD POV Coach
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Upload an Xbox POV MP4 gameplay clip to inspect basic video
            metadata before analysis.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg shadow-black/40">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="file"
                className="block text-sm font-medium text-zinc-200"
              >
                MP4 gameplay clip
              </label>
              <input
                id="file"
                type="file"
                accept="video/mp4"
                onChange={handleFileChange}
                className="block w-full cursor-pointer rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-500 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-400"
              />
              <p className="text-xs text-zinc-500">
                Only local MP4 files recorded from your capture card are
                supported. No YouTube or Twitch links.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {isUploading ? "Uploading..." : "Upload & Analyze"}
            </button>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </form>
        </section>

        {result && (
          <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-lg shadow-black/40">
            <h2 className="text-lg font-semibold tracking-tight">
              Video metadata
            </h2>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Video ID
                </div>
                <div className="mt-1 font-mono text-zinc-100">
                  {result.video_id}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  File name
                </div>
                <div className="mt-1 font-mono text-zinc-100">
                  {result.file_name}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Duration
                </div>
                <div className="mt-1 font-mono text-zinc-100">
                  {result.metadata.duration.toFixed(2)} s
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Resolution
                </div>
                <div className="mt-1 font-mono text-zinc-100">
                  {result.metadata.width} × {result.metadata.height}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  FPS
                </div>
                <div className="mt-1 font-mono text-zinc-100">
                  {result.metadata.fps.toFixed(2)}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
