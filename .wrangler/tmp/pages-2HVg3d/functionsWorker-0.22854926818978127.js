var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// _shared/auth.js
var COOKIE_NAME = "guiamed_session";
var SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;
function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}
__name(jsonResponse, "jsonResponse");
function hasDatabase(env2) {
  return Boolean(env2?.DB);
}
__name(hasDatabase, "hasDatabase");
function isSameOrigin(request) {
  return request.headers.get("Origin") === new URL(request.url).origin;
}
__name(isSameOrigin, "isSameOrigin");
async function readJson(request) {
  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > 12e3) {
    return { error: "A solicita\xE7\xE3o excede o tamanho permitido." };
  }
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > 12e3) {
      return { error: "A solicita\xE7\xE3o excede o tamanho permitido." };
    }
    return JSON.parse(rawBody);
  } catch {
    return { error: "Corpo da requisi\xE7\xE3o inv\xE1lido." };
  }
}
__name(readJson, "readJson");
function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(bytesToHex, "bytesToHex");
function hexToBytes(hex) {
  return Uint8Array.from(hex.match(/.{2}/g), (byte) => parseInt(byte, 16));
}
__name(hexToBytes, "hexToBytes");
function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}
__name(randomHex, "randomHex");
async function hashText(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}
__name(hashText, "hashText");
async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    // Passando como objeto por segurança de compatibilidade
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt: hexToBytes(salt),
    iterations: 15e3,
    // Reduzido para caber no limite de 10-50ms do Cloudflare!
    hash: "SHA-256"
  }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}
__name(hashPassword, "hashPassword");
function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}
__name(constantTimeEqual, "constantTimeEqual");
function getSessionToken(request) {
  const cookies = request.headers.get("Cookie") || "";
  const cookie = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const token = cookie?.slice(COOKIE_NAME.length + 1) || "";
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}
__name(getSessionToken, "getSessionToken");
async function getAuthenticatedUser(request, env2) {
  const token = getSessionToken(request);
  if (!token) return null;
  const tokenHash = await hashText(token);
  const user = await env2.DB.prepare(`
    SELECT users.email, users.name
    FROM sessions
    JOIN users ON users.email = sessions.email
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).bind(tokenHash, Date.now()).first();
  return user || null;
}
__name(getAuthenticatedUser, "getAuthenticatedUser");
async function createSession(email, env2) {
  const token = randomHex(32);
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1e3;
  const tokenHash = await hashText(token);
  await env2.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(Date.now()).run();
  await env2.DB.prepare(
    "INSERT INTO sessions (token_hash, email, expires_at) VALUES (?, ?, ?)"
  ).bind(tokenHash, email, expiresAt).run();
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}`;
}
__name(createSession, "createSession");
function expiredSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
__name(expiredSessionCookie, "expiredSessionCookie");
async function deleteSession(request, env2) {
  const token = getSessionToken(request);
  if (!token) return;
  const tokenHash = await hashText(token);
  await env2.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}
__name(deleteSession, "deleteSession");

// api/auth/login.js
var DUMMY_SALT = "00112233445566778899aabbccddeeff";
async function onRequestPost({ request, env: env2 }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicita\xE7\xE3o n\xE3o autorizada." }, 403);
  }
  if (!hasDatabase(env2)) {
    return jsonResponse({ error: "Banco de dados D1 n\xE3o configurado." }, 503);
  }
  const body = await readJson(request);
  if (body?.error) return jsonResponse({ error: body.error }, 400);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.senha === "string" ? body.senha : "";
  if (!email || email.length > 254 || !password || password.length > 128) {
    return jsonResponse({ error: "E-mail ou senha incorretos." }, 401);
  }
  try {
    const user = await env2.DB.prepare(
      "SELECT email, name, password_salt, password_hash FROM users WHERE email = ?"
    ).bind(email).first();
    const salt = user?.password_salt || DUMMY_SALT;
    const passwordHash = await hashPassword(password, salt);
    if (!user || !constantTimeEqual(passwordHash, user.password_hash)) {
      return jsonResponse({ error: "E-mail ou senha incorretos." }, 401);
    }
    const cookie = await createSession(user.email, env2);
    return jsonResponse(
      { user: { name: user.name, email: user.email } },
      200,
      { "Set-Cookie": cookie }
    );
  } catch (error3) {
    console.error("Falha ao autenticar usu\xE1rio:", error3);
    return jsonResponse({ error: "N\xE3o foi poss\xEDvel realizar o login agora." }, 500);
  }
}
__name(onRequestPost, "onRequestPost");

// api/auth/register.js
async function onRequestPost2({ request, env: env2 }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicita\xE7\xE3o n\xE3o autorizada." }, 403);
  }
  if (!hasDatabase(env2)) {
    return jsonResponse({ error: "Banco de dados D1 n\xE3o configurado." }, 503);
  }
  const body = await readJson(request);
  if (body?.error) return jsonResponse({ error: body.error }, 400);
  const name = typeof body?.nome === "string" ? body.nome.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.senha === "string" ? body.senha : "";
  if (name.length < 2 || name.length > 80) {
    return jsonResponse({ error: "O nome deve ter entre 2 e 80 caracteres." }, 400);
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "Informe um e-mail v\xE1lido." }, 400);
  }
  if (password.length < 8 || password.length > 128) {
    return jsonResponse({ error: "A senha precisa ter entre 8 e 128 caracteres." }, 400);
  }
  try {
    const salt = randomHex(16);
    const passwordHash = await hashPassword(password, salt);
    await env2.DB.prepare(
      "INSERT INTO users (email, name, password_salt, password_hash) VALUES (?, ?, ?, ?)"
    ).bind(email, name, salt, passwordHash).run();
    const cookie = await createSession(email, env2);
    return jsonResponse({ user: { name, email } }, 201, { "Set-Cookie": cookie });
  } catch (error3) {
    if (String(error3?.message || "").includes("UNIQUE constraint failed")) {
      return jsonResponse({ error: "J\xE1 existe uma conta com esse e-mail." }, 409);
    }
    console.error("Falha ao criar conta:", error3);
    return jsonResponse({ error: "N\xE3o foi poss\xEDvel criar a conta agora." }, 500);
  }
}
__name(onRequestPost2, "onRequestPost");

// api/auth/session.js
async function onRequestGet({ request, env: env2 }) {
  if (!hasDatabase(env2)) {
    return jsonResponse({ error: "Banco de dados D1 n\xE3o configurado." }, 503);
  }
  try {
    const user = await getAuthenticatedUser(request, env2);
    return jsonResponse({ user: user ? { name: user.name, email: user.email } : null });
  } catch (error3) {
    console.error("Falha ao consultar sess\xE3o:", error3);
    return jsonResponse({ error: "N\xE3o foi poss\xEDvel consultar a sess\xE3o." }, 500);
  }
}
__name(onRequestGet, "onRequestGet");
async function onRequestPost3({ request, env: env2 }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicita\xE7\xE3o n\xE3o autorizada." }, 403);
  }
  if (!hasDatabase(env2)) {
    return jsonResponse(
      { error: "Banco de dados D1 n\xE3o configurado." },
      503,
      { "Set-Cookie": expiredSessionCookie() }
    );
  }
  try {
    await deleteSession(request, env2);
    return jsonResponse({ ok: true }, 200, { "Set-Cookie": expiredSessionCookie() });
  } catch (error3) {
    console.error("Falha ao encerrar sess\xE3o:", error3);
    return jsonResponse({ error: "N\xE3o foi poss\xEDvel encerrar a sess\xE3o." }, 500);
  }
}
__name(onRequestPost3, "onRequestPost");

// api/forum.js
function getGuideId(value) {
  const guideId = typeof value === "string" ? value : "";
  return /^[1-9]\d{0,8}$/.test(guideId) ? guideId : null;
}
__name(getGuideId, "getGuideId");
async function onRequestGet2({ request, env: env2 }) {
  if (!hasDatabase(env2)) {
    return jsonResponse({ error: "Banco de dados D1 n\xE3o configurado." }, 503);
  }
  const guideId = getGuideId(new URL(request.url).searchParams.get("guideId"));
  if (!guideId) return jsonResponse({ error: "Identificador de diretriz inv\xE1lido." }, 400);
  try {
    const { results } = await env2.DB.prepare(`
      SELECT id, user_name AS name, body, created_at AS createdAt
      FROM comments
      WHERE guide_id = ?
      ORDER BY id DESC
      LIMIT 100
    `).bind(guideId).all();
    return jsonResponse({ comments: results });
  } catch (error3) {
    console.error("Falha ao carregar coment\xE1rios:", error3);
    return jsonResponse({ error: "N\xE3o foi poss\xEDvel carregar a discuss\xE3o." }, 500);
  }
}
__name(onRequestGet2, "onRequestGet");
async function onRequestPost4({ request, env: env2 }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicita\xE7\xE3o n\xE3o autorizada." }, 403);
  }
  if (!hasDatabase(env2)) {
    return jsonResponse({ error: "Banco de dados D1 n\xE3o configurado." }, 503);
  }
  let user;
  try {
    user = await getAuthenticatedUser(request, env2);
  } catch (error3) {
    console.error("Falha ao validar sess\xE3o para coment\xE1rio:", error3);
    return jsonResponse({ error: "N\xE3o foi poss\xEDvel validar sua sess\xE3o." }, 500);
  }
  if (!user) return jsonResponse({ error: "Fa\xE7a login para enviar uma mensagem." }, 401);
  const body = await readJson(request);
  if (body?.error) return jsonResponse({ error: body.error }, 400);
  const guideId = getGuideId(body?.guideId);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!guideId) return jsonResponse({ error: "Identificador de diretriz inv\xE1lido." }, 400);
  if (!message || message.length > 2e3) {
    return jsonResponse({ error: "A mensagem deve ter entre 1 e 2000 caracteres." }, 400);
  }
  try {
    await env2.DB.prepare(
      "INSERT INTO comments (guide_id, user_email, user_name, body) VALUES (?, ?, ?, ?)"
    ).bind(guideId, user.email, user.name, message).run();
    return jsonResponse({ ok: true }, 201);
  } catch (error3) {
    console.error("Falha ao publicar coment\xE1rio:", error3);
    return jsonResponse({ error: "N\xE3o foi poss\xEDvel publicar sua mensagem." }, 500);
  }
}
__name(onRequestPost4, "onRequestPost");

// api/osce-ai.js
var DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
var DEFAULT_MODEL = "gemini-3.8-flash";
var PATIENT_PROMPT = `Voc\xEA \xE9 Jo\xE3o Martins, paciente fict\xEDcio de 65 anos atendido em uma UPA. Responda sempre em portugu\xEAs brasileiro, em primeira pessoa, de maneira coloquial, breve e natural.

Interprete estritamente o papel do paciente. Nunca revele ou sugira um diagn\xF3stico, n\xE3o aja como m\xE9dico e n\xE3o d\xEA orienta\xE7\xF5es cl\xEDnicas. Responda somente ao que o m\xE9dico perguntar, sem antecipar informa\xE7\xF5es.
Se o hist\xF3rico estiver vazio, inicie a consulta com uma sauda\xE7\xE3o breve e diga apenas que est\xE1 com falta de ar.

Fatos do caso, que s\xF3 devem ser revelados quando perguntados:
- Falta de ar iniciada ontem \xE0 noite, pior hoje; piora ao deitar e melhora um pouco sentado.
- Tem press\xE3o alta e n\xE3o sabe o nome do rem\xE9dio que usa.
- Nega febre e tosse. N\xE3o sabe informar outros antecedentes ou alergias sem ser perguntado.
- Se pedirem sinais vitais: press\xE3o 150/90 mmHg, frequ\xEAncia card\xEDaca 108 bpm, frequ\xEAncia respirat\xF3ria 26 irpm, satura\xE7\xE3o 91% e temperatura 36,8 \xB0C.
- Se pedirem exame f\xEDsico, descreva apenas: alerta, fala frases completas, desconforto respirat\xF3rio leve, estertores bibasais e edema bilateral discreto em membros inferiores.
- Se pedirem ECG: ritmo sinusal, frequ\xEAncia aumentada, sem altera\xE7\xF5es agudas do segmento ST.
- Se pedirem radiografia de t\xF3rax: opacidades intersticiais bilaterais e silhueta card\xEDaca aumentada.
- Se perguntarem sobre alergias, responda que n\xE3o conhece alergias. N\xE3o invente informa\xE7\xF5es al\xE9m destas.

Forne\xE7a sinais vitais, exame f\xEDsico e resultados complementares somente quando solicitados.`;
var PRECEPTOR_PROMPT = `Voc\xEA \xE9 um preceptor m\xE9dico avaliando, para fins educacionais, a conversa de um aluno com o paciente fict\xEDcio Jo\xE3o Martins, de 65 anos, com falta de ar.

Avalie exclusivamente as evid\xEAncias presentes no hist\xF3rico. N\xE3o presuma a\xE7\xF5es que o aluno n\xE3o realizou. Marque como conclu\xEDdo apenas se estiver demonstrado:
- symptoms: investigou sintomas e in\xEDcio/evolu\xE7\xE3o do quadro;
- allergies: perguntou sobre alergias;
- ecg: solicitou ECG;
- furosemide: prop\xF4s furosemida.

Retorne somente um objeto JSON v\xE1lido, sem Markdown, sauda\xE7\xF5es ou texto fora do JSON, com este formato exato:
{"finalScore":0,"checklist":[{"id":"symptoms","completed":false},{"id":"allergies","completed":false},{"id":"ecg","completed":false},{"id":"furosemide","completed":false}],"comment":"Coment\xE1rio construtivo e espec\xEDfico."}

Substitua os valores pelos resultados da avalia\xE7\xE3o. A nota deve ser um n\xFAmero entre 0 e 10, igual a 2,5 pontos por item conclu\xEDdo. Escreva um coment\xE1rio respeitoso, destacando acertos e pr\xF3ximos passos. N\xE3o inclua diagn\xF3stico novo ou recomenda\xE7\xE3o para um paciente real.`;
function jsonResponse2(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
__name(jsonResponse2, "jsonResponse");
async function onRequestPost5(context2) {
  let body;
  try {
    body = await context2.request.json();
  } catch {
    return jsonResponse2({ error: "Corpo da requisi\xE7\xE3o inv\xE1lido." }, 400);
  }
  if (!["patient", "debrief"].includes(body?.mode)) {
    return jsonResponse2({ error: "Modo de atendimento inv\xE1lido." }, 400);
  }
  if (!Array.isArray(body.messages) || body.messages.length > 100) {
    return jsonResponse2({ error: "Hist\xF3rico de conversa inv\xE1lido." }, 400);
  }
  const messages = [];
  let totalLength = 0;
  for (const message of body.messages) {
    if (!["user", "assistant"].includes(message?.role) || typeof message.content !== "string" || !message.content.trim() || message.content.length > 2e3) {
      return jsonResponse2({ error: "Mensagem inv\xE1lida no hist\xF3rico." }, 400);
    }
    totalLength += message.content.length;
    if (totalLength > 4e4) {
      return jsonResponse2({ error: "O hist\xF3rico excede o limite permitido." }, 400);
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }
  const baseUrl = context2.env?.BASE_URL || DEFAULT_BASE_URL;
  const apiKey = context2.env?.API_KEY;
  const model = context2.env?.MODEL || DEFAULT_MODEL;
  if (!apiKey) {
    return jsonResponse2({
      error: "API_KEY n\xE3o est\xE1 configurada como segredo no ambiente do Cloudflare Pages (Production ou Preview)."
    }, 500);
  }
  let endpoint;
  try {
    endpoint = new URL(`${baseUrl.replace(/\/+$/, "")}/chat/completions`);
    if (!["http:", "https:"].includes(endpoint.protocol)) throw new Error("Protocolo inv\xE1lido.");
  } catch {
    return jsonResponse2({ error: "A URL da API de IA n\xE3o \xE9 v\xE1lida." }, 500);
  }
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: body.mode === "patient" ? PATIENT_PROMPT : PRECEPTOR_PROMPT },
          ...messages
        ],
        temperature: body.mode === "patient" ? 0.7 : 0.1
      })
    });
  } catch {
    return jsonResponse2({ error: "N\xE3o foi poss\xEDvel conectar \xE0 API de IA. Verifique a URL e a disponibilidade do provedor." }, 502);
  }
  let data;
  try {
    data = await response.json();
  } catch {
    return jsonResponse2({ error: "A API de IA retornou uma resposta inv\xE1lida." }, 502);
  }
  if (!response.ok) {
    return jsonResponse2({ error: `A API de IA retornou um erro (${response.status}).` }, 502);
  }
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    return jsonResponse2({ error: "A IA n\xE3o retornou uma resposta v\xE1lida." }, 502);
  }
  return jsonResponse2({ content: content.trim() });
}
__name(onRequestPost5, "onRequestPost");

// api/prescricao.js
var RUBRICAS_POR_CASO = {
  "amigdalite-bacteriana-aguda": {
    caso: "Faringoamigdalite aguda prov\xE1vel por estreptococo do grupo A em mulher de 19 anos, com febre, exsudato tonsilar e linfonodos cervicais dolorosos. Sem alergias conhecidas.",
    diretriz: `- Avalie a probabilidade de infec\xE7\xE3o estreptoc\xF3cica e a necessidade de teste r\xE1pido/cultura conforme disponibilidade, protocolo local e crit\xE9rios cl\xEDnicos; n\xE3o presuma que todo exsudato exige antibi\xF3tico.
- Se houver indica\xE7\xE3o de tratar prov\xE1vel infec\xE7\xE3o estreptoc\xF3cica: amoxicilina 500 mg VO a cada 12 horas por 10 dias (ou esquema equivalente recomendado localmente).
- Analgesia/antit\xE9rmico: paracetamol ou dipirona em dose apropriada; considerar ibuprofeno se n\xE3o houver contraindica\xE7\xE3o.
- Oriente hidrata\xE7\xE3o, medidas de conforto e retorno se piora, dificuldade respirat\xF3ria/degluti\xE7\xE3o importante, desidrata\xE7\xE3o ou persist\xEAncia da febre/sintomas.`
  },
  "hipertensao-inicio-tratamento": {
    caso: "Homem de 52 anos, assintom\xE1tico, sem comorbidades ou les\xE3o de \xF3rg\xE3o-alvo, com m\xE9dia domiciliar de 148/92 mmHg por duas semanas e PA de consult\xF3rio de 150/94 mmHg. Fun\xE7\xE3o renal e eletr\xF3litos normais.",
    diretriz: `- Considere hipertens\xE3o est\xE1gio 1 e in\xEDcio de monoterapia associado a mudan\xE7as de estilo de vida.
- Op\xE7\xF5es iniciais: enalapril (por exemplo, 5 mg VO 1 vez ao dia), losartana (50 mg VO 1 vez ao dia) ou hidroclorotiazida (12,5 mg VO 1 vez ao dia), ajustando conforme diretriz local e perfil do paciente. Prescrever apenas uma op\xE7\xE3o.
- Para IECA/BRA, avaliar creatinina e pot\xE1ssio ap\xF3s in\xEDcio/ajuste; para tiaz\xEDdico, monitorar eletr\xF3litos e efeitos metab\xF3licos. Reavaliar press\xE3o, tolerabilidade e ades\xE3o em algumas semanas.
- Oriente redu\xE7\xE3o de sal, atividade f\xEDsica, controle de peso, modera\xE7\xE3o de \xE1lcool e seguimento; n\xE3o indicar combina\xE7\xE3o inicial automaticamente neste caso.`
  },
  "exacerbacao-leve-asma": {
    caso: "Mulher de 24 anos com asma, sintomas leves de exacerba\xE7\xE3o ap\xF3s exposi\xE7\xE3o a mofo, interrompeu o corticoide inalat\xF3rio no \xFAltimo m\xEAs. SpO\u2082 96%, FC 92 bpm, FR 22 irpm, sibilos expirat\xF3rios difusos, sem sinais de esfor\xE7o respirat\xF3rio.",
    diretriz: `- Avalie gravidade e resposta cl\xEDnica; salbutamol inalat\xF3rio 100 mcg, 2 a 4 jatos com espa\xE7ador como resgate, repetindo conforme resposta e plano de a\xE7\xE3o. Falha de resposta ou piora exige avalia\xE7\xE3o urgente.
- Oriente retomada imediata do corticoide inalat\xF3rio de manuten\xE7\xE3o previamente prescrito e ades\xE3o cont\xEDnua; confira t\xE9cnica inalat\xF3ria e plano de a\xE7\xE3o. Considere estrat\xE9gia com corticoide-formoterol conforme o tratamento j\xE1 indicado e protocolo vigente.
- N\xE3o recomendar SABA como \xFAnico tratamento de manuten\xE7\xE3o. Oriente evitar o gatilho e procurar urg\xEAncia se dispneia importante, dificuldade para falar, cianose, sonol\xEAncia ou piora/satura\xE7\xE3o baixa.`
  },
  "gastroenterite-desidratacao-leve": {
    caso: "Homem de 30 anos com cinco epis\xF3dios de diarreia aquosa e dois de v\xF4mito em 24 horas, sede e cansa\xE7o. Mucosas levemente secas, turgor preservado, PA 110/70 mmHg, FC 88 bpm, sem peritonismo.",
    diretriz: `- Priorize solu\xE7\xE3o de reidrata\xE7\xE3o oral em pequenos volumes frequentes e reposi\xE7\xE3o das perdas ap\xF3s evacua\xE7\xF5es; reavalie hidrata\xE7\xE3o e toler\xE2ncia oral.
- Antiem\xE9tico, como ondansetrona, pode ser considerado por curto per\xEDodo se o v\xF4mito impedir hidrata\xE7\xE3o, ap\xF3s avaliar contraindica\xE7\xF5es e risco de prolongamento do QT. Antiespasm\xF3dico n\xE3o \xE9 de uso rotineiro; se considerado para c\xF3lica, avaliar contraindica\xE7\xF5es e n\xE3o mascarar sinais de alarme.
- Oriente alimenta\xE7\xE3o conforme toler\xE2ncia, higiene das m\xE3os e retorno se incapacidade de ingerir l\xEDquidos, redu\xE7\xE3o importante da diurese, sangue nas fezes, febre alta, dor intensa/localizada ou sinais de desidrata\xE7\xE3o. N\xE3o prescrever antibi\xF3tico emp\xEDrico neste quadro sem indica\xE7\xE3o espec\xEDfica.`
  },
  "cistite-nao-complicada-28": {
    caso: "Mulher de 28 anos com dis\xFAria, polaci\xFAria, urg\xEAncia e desconforto suprap\xFAbico h\xE1 tr\xEAs dias. Afebril, sem dor lombar ou corrimento vaginal, Giordano negativo.",
    diretriz: `- Op\xE7\xF5es para cistite n\xE3o complicada incluem nitrofuranto\xEDna 100 mg VO a cada 6 horas por 5 dias (ou formula\xE7\xE3o de libera\xE7\xE3o modificada a cada 12 horas, conforme apresenta\xE7\xE3o/protocolo), fosfomicina 3 g VO em dose \xFAnica ou sulfametoxazol-trimetoprima 800/160 mg VO a cada 12 horas por 3 dias quando apropriado e a resist\xEAncia local permitir.
- Verifique possibilidade de gesta\xE7\xE3o, fun\xE7\xE3o renal, alergias, intera\xE7\xF5es e fatores de complica\xE7\xE3o antes de escolher o antibi\xF3tico; evite quinolonas como primeira linha. Urocultura \xE9 indicada em situa\xE7\xF5es selecionadas, n\xE3o necessariamente em cistite t\xEDpica n\xE3o complicada.
- Fenazopiridina 100\u2013200 mg VO a cada 8 horas por no m\xE1ximo 2 dias pode ser considerada para dis\xFAria, observando contraindica\xE7\xF5es; analg\xE9sico simples \xE9 alternativa. Oriente hidrata\xE7\xE3o conforme sede e retorno se febre, dor lombar, v\xF4mitos ou piora.`
  },
  "itu-nao-complicada": {
    caso: "Cistite aguda n\xE3o complicada em mulher h\xEDgida de 26 anos, com dis\xFAria, polaci\xFAria e urg\xEAncia h\xE1 dois dias. Sem febre, dor lombar, Giordano negativo ou sintomas vaginais.",
    diretriz: `- Op\xE7\xF5es de primeira linha: nitrofuranto\xEDna 100 mg VO a cada 6 horas por 5 dias (ou formula\xE7\xE3o de libera\xE7\xE3o modificada a cada 12 horas, conforme apresenta\xE7\xE3o), fosfomicina 3 g VO em dose \xFAnica ou sulfametoxazol-trimetoprima 800/160 mg VO a cada 12 horas por 3 dias quando apropriado e a resist\xEAncia local permitir.
- Evite fluoroquinolonas como primeira linha e tratamentos prolongados sem indica\xE7\xE3o. Considere fatores de complica\xE7\xE3o, alergias e contraindica\xE7\xF5es.
- Fenazopiridina 100\u2013200 mg VO a cada 8 horas por no m\xE1ximo 2 dias ou analg\xE9sico simples podem ser usados para al\xEDvio. Oriente hidrata\xE7\xE3o conforme sede e sinais de alarme, como febre, dor lombar ou piora.`
  }
};
async function onRequestPost6(context2) {
  let body;
  try {
    body = await context2.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corpo da requisi\xE7\xE3o inv\xE1lido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const prescricaoAluno = typeof body?.prescricaoAluno === "string" ? body.prescricaoAluno.trim() : "";
  const casoId = typeof body?.casoId === "string" ? body.casoId : "";
  const caso = Object.prototype.hasOwnProperty.call(RUBRICAS_POR_CASO, casoId) ? RUBRICAS_POR_CASO[casoId] : null;
  if (!caso) {
    return new Response(JSON.stringify({ error: "Selecione um caso cl\xEDnico v\xE1lido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!prescricaoAluno) {
    return new Response(JSON.stringify({ error: "Informe a prescri\xE7\xE3o para an\xE1lise." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const apiKey = context2.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Chave GEMINI_API_KEY n\xE3o configurada no Cloudflare." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  const systemPrompt = `
Voc\xEA \xE9 um preceptor m\xE9dico s\xEAnior avaliando a prescri\xE7\xE3o de um interno de medicina.

CASO CL\xCDNICO:
${caso.caso}

PRESCRI\xC7\xC3O DO ALUNO:
${prescricaoAluno}

DIRETRIZES DE REFER\xCANCIA:
${caso.diretriz}

SUA TAREFA:
Analise a prescri\xE7\xE3o do aluno considerando o caso e as diretrizes acima. N\xE3o invente dados ausentes, sinalize contraindica\xE7\xF5es e ressalte que a decis\xE3o deve seguir protocolos locais e supervis\xE3o cl\xEDnica. Responda exatamente nesta estrutura em Markdown:

### 1. Classifica\xE7\xE3o Geral
[Adequada | Parcialmente Adequada | Incorreta]

### 2. An\xE1lise da Conduta Principal
- **Escolha e indica\xE7\xE3o:** [Avalie a adequa\xE7\xE3o da conduta ao caso]
- **Posologia e dura\xE7\xE3o:** [Avalie dose, via, frequ\xEAncia e dura\xE7\xE3o quando aplic\xE1vel]

### 3. Sintom\xE1ticos e Orienta\xE7\xE3o
- **Al\xEDvio sintom\xE1tico:** [Avalie medicamentos sintom\xE1ticos e seguran\xE7a]
- **Medidas gerais e seguran\xE7a:** [Cheque seguimento, monitoriza\xE7\xE3o e sinais de alarme]

### 4. Prescri\xE7\xE3o Modelo Recomendada
[Apresente uma sugest\xE3o educacional de prescri\xE7\xE3o baseada nas diretrizes, incluindo medidas n\xE3o farmacol\xF3gicas e ressalvas relevantes.]
`;
  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
        })
      }
    );
  } catch {
    return new Response(JSON.stringify({ error: "N\xE3o foi poss\xEDvel conectar ao servi\xE7o de an\xE1lise." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
  let data;
  try {
    data = await response.json();
  } catch {
    return new Response(JSON.stringify({ error: "O servi\xE7o de an\xE1lise retornou uma resposta inv\xE1lida." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!response.ok) {
    return new Response(JSON.stringify({ error: "O servi\xE7o de an\xE1lise n\xE3o conseguiu processar a solicita\xE7\xE3o." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
  const analiseTexto = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof analiseTexto !== "string" || !analiseTexto.trim()) {
    return new Response(JSON.stringify({ error: "O servi\xE7o de an\xE1lise n\xE3o retornou um feedback v\xE1lido." }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ analise: analiseTexto }), {
    headers: { "Content-Type": "application/json" }
  });
}
__name(onRequestPost6, "onRequestPost");

// ../.wrangler/tmp/pages-2HVg3d/functionsRoutes-0.6565831568718075.mjs
var routes = [
  {
    routePath: "/api/auth/login",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/auth/register",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/auth/session",
    mountPath: "/api/auth",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/auth/session",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/forum",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/forum",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/osce-ai",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/prescricao",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  }
];

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
