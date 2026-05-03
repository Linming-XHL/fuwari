<script lang="ts">
import { onMount, tick } from "svelte";
import type { Song } from "../../config/music";
import { musicPlayerConfig } from "../../config/music";

const { enabled, songs } = musicPlayerConfig;

let isExpanded = $state(false);
let isPlaying = $state(false);
let isLooping = $state(false);
let isMuted = $state(false);
let currentTime = $state(0);
let duration = $state(0);
let volume = $state(0.7);
let currentSongIndex = $state(0);
let isLoading = $state(false);
let hasError = $state(false);
let isChangingSong = $state(false);
let forcePlayAfterLoad = $state(false);

let currentSong = $derived(songs[currentSongIndex]);

let audio: HTMLAudioElement;

const STORAGE_PREFIX = "music_";

function loadValue(name: string): string | null {
	if (typeof localStorage === "undefined") return null;
	return localStorage.getItem(STORAGE_PREFIX + name);
}

function saveValue(name: string, value: string) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(STORAGE_PREFIX + name, value);
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function togglePlay() {
	if (audio && !isLoading && !isChangingSong) {
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play().catch(() => {});
		}
	}
}

function toggleLoop() {
	isLooping = !isLooping;
	if (audio) {
		audio.loop = isLooping;
	}
	saveValue("isLooping", isLooping.toString());
}

function toggleMute() {
	isMuted = !isMuted;
	if (audio) {
		audio.muted = isMuted;
	}
	saveValue("isMuted", isMuted.toString());
}

function changeSong(index: number) {
	if (index === currentSongIndex && !isLoading) return;

	isChangingSong = true;
	forcePlayAfterLoad = isPlaying;
	currentSongIndex = index;
	currentTime = 0;
	hasError = false;
	isLoading = true;

	if (audio) {
		audio.pause();
		audio.currentTime = 0;
		audio.load();
	}

	saveValue("currentSong", index.toString());
	saveValue("playTime", "0");
}

function prevSong() {
	const newIndex = currentSongIndex - 1;
	changeSong(newIndex < 0 ? songs.length - 1 : newIndex);
}

function nextSong() {
	const newIndex = currentSongIndex + 1;
	changeSong(newIndex >= songs.length ? 0 : newIndex);
}

let lastSavedTime = 0;

function handleTimeUpdate() {
	if (audio) {
		currentTime = audio.currentTime;
		if (isPlaying && currentTime - lastSavedTime > 5) {
			lastSavedTime = currentTime;
			saveValue("playTime", currentTime.toString());
		}
	}
}

function handleLoadedMetadata() {
	if (audio) {
		duration = audio.duration;
		isLoading = false;
		hasError = false;

		if (currentTime > 0) {
			audio.currentTime = currentTime;
		}

		if (forcePlayAfterLoad) {
			forcePlayAfterLoad = false;
			audio
				.play()
				.then(() => {
					isPlaying = true;
				})
				.catch(() => {
					isPlaying = false;
				});
		}

		queueMicrotask(() => {
			isChangingSong = false;
		});
	}
}

function handleWaiting() {
	isLoading = true;
}

function handleCanPlay() {
	isLoading = false;
	if (audio && Number.isNaN(duration)) {
		duration = audio.duration;
	}
}

function handleError() {
	if (!isChangingSong) {
		isLoading = false;
		hasError = true;
		isPlaying = false;
	}
}

function handleEnded() {
	if (!isLooping) {
		nextSong();
	}
}

function handlePlay() {
	isPlaying = true;
	saveValue("isPlaying", "true");
}

function handlePause() {
	isPlaying = false;
	saveValue("isPlaying", "false");
}

function seek(e: Event) {
	const target = e.target as HTMLInputElement;
	if (audio) {
		audio.currentTime = Number.parseFloat(target.value);
		currentTime = audio.currentTime;
	}
}

function setVolume(e: Event) {
	const target = e.target as HTMLInputElement;
	volume = Number.parseFloat(target.value);
	if (audio) {
		audio.volume = volume;
	}
	if (volume > 0 && isMuted) {
		isMuted = false;
		if (audio) audio.muted = false;
	}
	saveValue("volume", volume.toString());
	saveValue("isMuted", isMuted.toString());
}

function retry() {
	if (audio) {
		hasError = false;
		isLoading = true;
		audio.load();
	}
}

onMount(() => {
	tick().then(() => {
		if (audio) {
			const savedSongIndex = loadValue("currentSong");
			const savedVolume = loadValue("volume");
			const savedLoopState = loadValue("isLooping");
			const savedMuteState = loadValue("isMuted");
			const savedPlayTime = loadValue("playTime");

			if (savedSongIndex !== null) {
				currentSongIndex = Number.parseInt(savedSongIndex, 10);
			}

			if (savedVolume !== null) {
				volume = Number.parseFloat(savedVolume);
				audio.volume = volume;
			}

			if (savedLoopState !== null) {
				isLooping = savedLoopState === "true";
				audio.loop = isLooping;
			}

			if (savedMuteState !== null) {
				isMuted = savedMuteState === "true";
				audio.muted = isMuted;
			}

			currentTime = savedPlayTime ? Number.parseFloat(savedPlayTime) : 0;
			isPlaying = false;

			audio.load();
		}
	});
});
</script>

{#if enabled}
  <div class="card-base p-3">
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-lg text-black dark:text-white">Music Player</h3>
        <button
          onclick={() => (isExpanded = !isExpanded)}
          class="btn-plain p-1 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-transform duration-300"
            style="transform: {isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <img
          src={currentSong.cover}
          alt={currentSong.title}
          class="w-16 h-16 rounded-lg object-cover"
        />
        <div class="flex-1 min-w-0 flex items-center gap-2">
          <div class="flex-1 min-w-0">
            <div class="font-bold truncate text-black dark:text-white">{currentSong.title}</div>
            <div class="text-sm text-neutral-600 dark:text-neutral-400 truncate">{currentSong.artist}</div>
          </div>
          <div class="flex-shrink-0 w-4 h-4">
            {#if isLoading && !hasError}
              <svg
                class="animate-spin text-neutral-400"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
              </svg>
            {/if}
            {#if hasError}
              <button
                onclick={retry}
                class="btn-plain p-0.5 rounded text-red-500 hover:text-red-700"
                title="点击重试"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-xs w-10 text-right text-black dark:text-white">{formatTime(currentTime)}</span>
          <div class="relative flex-1 h-1.5 rounded-full overflow-hidden">
            <div class="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div
              class="absolute left-0 top-0 h-full bg-[var(--primary)] rounded-full transition-[width] duration-150"
              style="width: {duration ? (currentTime / duration) * 100 : 0}%"
            ></div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              oninput={seek}
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span class="text-xs w-10 text-black dark:text-white">{formatTime(duration)}</span>
        </div>

        <div class="flex items-center justify-between">
          <button
            onclick={toggleLoop}
            class="btn-plain p-1 rounded"
            title="单曲循环"
            style="color: {isLooping ? 'var(--primary)' : ''}"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>

          <button onclick={prevSong} class="btn-plain p-1 rounded" title="上一首">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="19 17 19 7 5 17 19 17" />
            </svg>
          </button>

          <button
            onclick={togglePlay}
            class="btn-plain w-12 h-12 rounded-full flex items-center justify-center"
            title={isPlaying ? '暂停' : '播放'}
            disabled={isLoading || hasError}
          >
            {#if isPlaying}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            {/if}
          </button>

          <button onclick={nextSong} class="btn-plain p-1 rounded" title="下一首">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="5 6 5 18 18 6 5 6" />
            </svg>
          </button>

          <div class="flex items-center gap-1">
            <button onclick={toggleMute} class="btn-plain p-1 rounded" title={isMuted ? '取消静音' : '静音'}>
              {#if isMuted}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="15.54" y1="8.46" x2="19.07" y2="11.99" />
                  <line x1="19.07" y1="8.46" x2="15.54" y2="11.99" />
                </svg>
              {:else}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              {/if}
            </button>
            <div class="relative w-16 h-1.5 rounded-full overflow-hidden">
              <div class="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div
                class="absolute left-0 top-0 h-full bg-[var(--primary)] rounded-full"
                style="width: {volume * 100}%"
              ></div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                oninput={setVolume}
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {#if isExpanded}
        <div class="mt-2 border-t pt-3">
          <div class="song-list-scroll space-y-2 max-h-[208px] overflow-y-auto">
            {#each songs as song, index}
              <div
                class="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onclick={() => changeSong(index)}
              >
                <img
                  src={song.cover}
                  alt={song.title}
                  class="w-12 h-12 rounded-lg object-cover"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate text-black dark:text-white">{song.title}</div>
                  <div class="text-xs text-neutral-600 dark:text-neutral-400 truncate">{song.artist}</div>
                </div>
                {#if index === currentSongIndex}
                  {#if isLoading && !hasError}
                    <svg
                      class="animate-spin text-neutral-400"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="12" y1="2" x2="12" y2="6" />
                      <line x1="12" y1="18" x2="12" y2="22" />
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                      <line x1="2" y1="12" x2="6" y2="12" />
                      <line x1="18" y1="12" x2="22" y2="12" />
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                    </svg>
                  {:else if hasError}
                    <button
                      onclick={(e) => {
                        e.stopPropagation();
                        retry();
                      }}
                      class="btn-plain p-0.5 rounded text-red-500 hover:text-red-700"
                      title="点击重试"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </button>
                  {:else if isPlaying}
                    <div class="flex gap-0.5 items-end h-4">
                      <div class="w-1 h-2 bg-[var(--primary)] animate-pulse" />
                      <div class="w-1 h-3 bg-[var(--primary)] animate-pulse" style="animation-delay: 75ms" />
                      <div class="w-1 h-4 bg-[var(--primary)] animate-pulse" style="animation-delay: 150ms" />
                    </div>
                  {/if}
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <audio
    bind:this={audio}
    src={currentSong.url}
    loop={isLooping}
    ontimeupdate={handleTimeUpdate}
    onloadedmetadata={handleLoadedMetadata}
    onended={handleEnded}
    onwaiting={handleWaiting}
    oncanplay={handleCanPlay}
    onerror={handleError}
    onplay={handlePlay}
    onpause={handlePause}
  />
{/if}

<style>
  .song-list-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--primary) transparent;
  }

  .song-list-scroll::-webkit-scrollbar {
    width: 5px;
  }

  .song-list-scroll::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }

  .song-list-scroll::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 10px;
    opacity: 0.4;
    transition: opacity 0.2s, width 0.2s;
  }

  .song-list-scroll:hover::-webkit-scrollbar-thumb {
    opacity: 0.7;
  }

  .song-list-scroll::-webkit-scrollbar-thumb:hover {
    opacity: 1;
    width: 7px;
  }
</style>
