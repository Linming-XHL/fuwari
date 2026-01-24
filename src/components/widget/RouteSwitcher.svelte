<script lang="ts">
// 线路列表
const routes = [
  { name: "Edgeone", url: "https://lmxhl.top" },
  { name: "家里云-江西移动", url: "https://beta.lmxhl.top" },
  { name: "内测站点", url: "http://127.0.0.1:4321" }
];

// 线路状态类型
type RouteStatus = {
  delay: number | null; // 延迟时间（毫秒），null表示检测中或无法连接
  status: 'checking' | 'connected' | 'failed'; // 状态
};

// 线路状态
let routeStatuses: Record<string, RouteStatus> = {};
// 检测中标记，避免重复检测
let checking: Set<string> = new Set();

// 初始化线路状态
routes.forEach(route => {
  routeStatuses[route.url] = {
    delay: null,
    status: 'checking'
  };
});

// 获取状态文本
function getStatusText(status: RouteStatus) {
  if (status.status === 'checking') {
    return '检测中...';
  } else if (status.status === 'failed') {
    return '无法连接';
  } else if (status.delay === null) {
    return '未知状态';
  } else {
    return `${status.delay}ms`;
  }
}

// 检测线路延迟
function checkRouteDelay(url: string) {
  // 避免重复检测
  if (checking.has(url)) {
    return;
  }
  
  checking.add(url);
  
  // 更新状态为检测中
  routeStatuses = {
    ...routeStatuses,
    [url]: {
      delay: null,
      status: 'checking'
    }
  };
  
  const startTime = performance.now();
  
  // 构建favicon URL
  const urlObj = new URL(url);
  const faviconUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
  
  // 发送GET请求检测延迟（使用favicon更轻量）
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    // 超时后更新状态为无法连接
    routeStatuses = {
      ...routeStatuses,
      [url]: {
        delay: null,
        status: 'failed'
      }
    };
    checking.delete(url);
  }, 5000);
  
  fetch(faviconUrl, {
    method: 'GET',
    mode: 'no-cors',
    signal: controller.signal
  })
    .then(() => {
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const delay = Math.round(endTime - startTime);
      
      // 更新状态为已连接
      routeStatuses = {
        ...routeStatuses,
        [url]: {
          delay,
          status: 'connected'
        }
      };
    })
    .catch(() => {
      clearTimeout(timeoutId);
      // 更新状态为无法连接
      routeStatuses = {
        ...routeStatuses,
        [url]: {
          delay: null,
          status: 'failed'
        }
      };
    })
    .finally(() => {
      checking.delete(url);
    });
}

// 切换线路
function switchRoute(url: string) {
  // 跳转到新线路
  window.location.href = url;
}

// 初始化时检测所有线路延迟
function init() {
  // 串行检测，避免并发请求过多
  routes.forEach((route, index) => {
    setTimeout(() => {
      checkRouteDelay(route.url);
    }, index * 1000);
  });
}

// 手动刷新检测
function refreshCheck() {
  // 串行检测，避免并发请求过多
  routes.forEach((route, index) => {
    setTimeout(() => {
      checkRouteDelay(route.url);
    }, index * 1000);
  });
}

// 初始化
init();
</script>

<div class="onload-animation" style="animation-delay: 250ms">
  <div class="flex flex-row gap-2 mb-3 items-center justify-between">
    <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
        before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
        before:absolute before:-left-3 before:top-[0.33rem]"
    >
      线路切换
      <button aria-label="刷新检测" class="btn-regular w-7 h-7 rounded-md active:scale-90 will-change-transform" on:click={refreshCheck}>
        <div class="text-[var(--btn-content)]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </button>
    </div>
  </div>
  
  <div class="bg-[var(--card-bg)] rounded-xl p-4 transition">
    <ul class="space-y-2">
      {#each routes as route}
        <li>
          <button 
            class="w-full flex items-center justify-between p-2 rounded-md hover:bg-[var(--btn-regular-bg)] transition active:scale-95"
            on:click={() => switchRoute(route.url)}
          >
            <span class="text-sm text-neutral-900 dark:text-neutral-100">{route.name}</span>
            <div class="flex items-center gap-2">
              <span 
                class="flex items-center gap-1"
                title={getStatusText(routeStatuses[route.url])}
              >
                <!-- 使用CSS类，避免Tailwind处理背景图片时的无限递归错误 -->
                {#if routeStatuses[route.url].status === 'checking'}
                  <div class="status-icon status-checking"></div>
                {:else if routeStatuses[route.url].status === 'failed'}
                  <div class="status-icon status-failed"></div>
                {:else if routeStatuses[route.url].delay !== null}
                  {#if routeStatuses[route.url].delay < 100}
                    <div class="status-icon status-excellent"></div>
                  {:else if routeStatuses[route.url].delay < 300}
                    <div class="status-icon status-good"></div>
                  {:else if routeStatuses[route.url].delay < 500}
                    <div class="status-icon status-fair"></div>
                  {:else if routeStatuses[route.url].delay < 1000}
                    <div class="status-icon status-poor"></div>
                  {:else}
                    <div class="status-icon status-bad"></div>
                  {/if}
                {:else}
                  <div class="status-icon status-failed"></div>
                {/if}
              </span>
            </div>
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style lang="stylus">
  button {
    cursor: pointer;
  }
  
  /* 状态图标样式 */
  .status-icon {
    width: 16px;
    height: 16px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
  
  /* 具体状态图标 */
  .status-checking {
    background-image: url('/images/network-status/network-status-checking.gif');
  }
  
  .status-failed {
    background-image: url('/images/network-status/network-status-failed.gif');
  }
  
  .status-excellent {
    background-image: url('/images/network-status/network-status-excellent.gif');
  }
  
  .status-good {
    background-image: url('/images/network-status/network-status-good.gif');
  }
  
  .status-fair {
    background-image: url('/images/network-status/network-status-fair.gif');
  }
  
  .status-poor {
    background-image: url('/images/network-status/network-status-poor.gif');
  }
  
  .status-bad {
    background-image: url('/images/network-status/network-status-bad.gif');
  }
</style>