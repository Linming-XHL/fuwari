<script lang="ts">
import Icon from "@iconify/svelte";
import { linesConfig, type Line } from "../config/lines";

let isOpen = $state(false);
let latencies = $state<Record<string, { status: string; ms: number | null; timestamp: number }>>({});
let isChecking = $state(false);
const CACHE_DURATION = 30000;

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    excellent: "/network-status/network-status-excellent.gif",
    good: "/network-status/network-status-good.gif",
    fair: "/network-status/network-status-fair.gif",
    poor: "/network-status/network-status-poor.gif",
    bad: "/network-status/network-status-bad.gif",
    failed: "/network-status/network-status-failed.gif",
    checking: "/network-status/network-status-checking.gif",
  };
  return icons[status] || icons.checking;
}

function getLatencyStatus(ms: number | null): string {
  if (ms === null) return "failed";
  if (ms < 50) return "excellent";
  if (ms < 150) return "good";
  if (ms < 280) return "fair";
  if (ms < 390) return "poor";
  return "bad";
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

async function checkLatency(line: Line): Promise<{ status: string; ms: number | null }> {
  const startTime = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(`${line.url}/favicon.ico`, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-cache",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const ms = Math.round(endTime - startTime);
    return { status: getLatencyStatus(ms), ms };
  } catch {
    return { status: "failed", ms: null };
  }
}

async function checkAllLatencies() {
  isChecking = true;

  const cachedLatencies: Record<string, { status: string; ms: number | null; timestamp: number }> = {};
  const needCheck: Line[] = [];

  for (const line of linesConfig.lines) {
    const cached = latencies[line.url];
    if (cached && isCacheValid(cached.timestamp)) {
      cachedLatencies[line.url] = cached;
    } else {
      cachedLatencies[line.url] = { status: "checking", ms: null, timestamp: 0 };
      needCheck.push(line);
    }
  }

  latencies = cachedLatencies;

  if (needCheck.length === 0) {
    isChecking = false;
    return;
  }

  const results = await Promise.all(
    needCheck.map(async (line) => {
      const result = await checkLatency(line);
      return { url: line.url, result };
    })
  );

  const finalLatencies = { ...latencies };
  for (const { url, result } of results) {
    finalLatencies[url] = { ...result, timestamp: Date.now() };
  }
  latencies = finalLatencies;
  isChecking = false;
}

function switchLine(line: Line) {
  const currentPath = window.location.pathname;
  const newUrl = `${line.url}${currentPath}`;

  if (window.swup) {
    window.swup.navigate(newUrl);
  } else {
    window.location.href = newUrl;
  }
}

function showPanel() {
  isOpen = true;
  checkAllLatencies();
}

function hidePanel() {
  isOpen = false;
}

function togglePanel() {
  if (isOpen) {
    hidePanel();
  } else {
    showPanel();
  }
}
</script>

<div class="relative z-50" role="menu" tabindex="-1" onmouseleave={hidePanel}>
  <button aria-label="Line Switch" role="menuitem"
          class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
          onclick={togglePanel} onmouseenter={showPanel}>
    <Icon icon="material-symbols:swap-horiz-rounded" class="text-[1.25rem]"></Icon>
  </button>

  {#if isOpen}
    <div id="line-switch-panel" class="absolute transition top-11 -right-2 pt-5">
      <div class="card-base float-panel p-3 min-w-[280px] max-w-[320px]">
        <div class="flex items-center justify-between mb-3">
          <span class="font-bold text-sm">线路选择</span>
          <button class="flex items-center gap-1 text-xs btn-plain scale-animation rounded px-2 py-1 active:scale-95"
                  onclick={(e) => { e.stopPropagation(); checkAllLatencies(); }}
                  disabled={isChecking}>
            <Icon icon="material-symbols:refresh-rounded" class={isChecking ? "text-[0.875rem] text-animate" : "text-[0.875rem]"}></Icon>
            重试
          </button>
        </div>

        <div class="space-y-1">
          {#each linesConfig.lines as line (line.url)}
            {@const latency = latencies[line.url]}
            <button class="w-full flex items-center justify-between p-2 rounded-lg transition hover:bg-[var(--btn-plain-bg-hover)] active:scale-[0.98]"
                    onclick={() => switchLine(line)}>
              <div class="flex flex-col items-start gap-1 flex-1 min-w-0">
                <div class="flex items-center gap-2 w-full">
                  <span class="font-medium text-sm truncate">{line.name}</span>
                </div>
                {#if line.features && line.features.length > 0}
                  <div class="flex items-center gap-1">
                    {#each line.features as feature (feature.name)}
                      <span class="text-[0.625rem] px-1.5 py-0.5 rounded bg-[var(--primary)] text-white font-medium">
                        {feature.name}
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>

              <div class="flex items-center gap-2 ml-2 shrink-0">
                {#if latency}
                  <div class="relative group cursor-help" title={`${latency.ms !== null ? latency.ms + 'ms' : '超时'}`}>
                    <img src={getStatusIcon(latency.status)} alt={latency.status} class="w-6 h-4 object-contain">
                  </div>
                {:else}
                  <div class="w-6 h-4"></div>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  :global(.text-animate) {
    animation: spin 1s linear infinite;
  }
</style>
