import assert from 'assert';
import { AudioDspEngine } from '../src/services/audioDspService.ts';

// ---------- Mock helpers ----------
class MockTrack {
  constructor(id) {
    this.id = id;
    this.kind = 'audio';
    this.isStopped = false;
    this.stopCount = 0;
  }
  stop() {
    this.isStopped = true;
    this.stopCount++;
  }
}

class MockMediaStream {
  constructor(id, tracks) {
    this.id = id;
    this.tracks = tracks || [new MockTrack(`${id}_track_1`)];
  }
  getTracks() {
    return this.tracks;
  }
}

class MockAnalyserNode {
  constructor(ctxId) {
    this.ctxId = ctxId;
    this.fftSize = 2048;
    this.smoothingTimeConstant = 0.75;
  }
  getFloatTimeDomainData(array) {
    array.fill(0.01);
  }
}

// Flexible AudioContext mock that can be configured per test
class ConfigurableMockAudioContext {
  constructor(config = {}) {
    ConfigurableMockAudioContext.instances.push(this);
    this.id = `ctx_${ConfigurableMockAudioContext.instances.length}`;
    this.state = config.initialState ?? 'running'; // 'suspended' triggers resume path
    this.isClosed = false;
    this.closeCount = 0;
    this.analyser = new MockAnalyserNode(this.id);
    this._resumeShouldReject = !!config.resumeShouldReject;
    this._resumeError = config.resumeError ?? new Error('AudioContext resume failed');
  }
  async resume() {
    if (this._resumeShouldReject) {
      throw this._resumeError;
    }
    this.state = 'running';
  }
  async close() {
    this.isClosed = true;
    this.closeCount++;
    this.state = 'closed';
  }
  createMediaStreamSource(_stream) {
    return { connect: (_dest) => {} };
  }
  createAnalyser() {
    return this.analyser;
  }
}
ConfigurableMockAudioContext.instances = [];

// Global arrays to capture mock getUserMedia calls
let gumCalls = [];
function mockGetUserMedia(constraints) {
  return new Promise((resolve, reject) => {
    gumCalls.push({ constraints, resolve, reject });
  });
}

// Helper to reset global mocks between test runs
function resetMocks() {
  ConfigurableMockAudioContext.instances = [];
  gumCalls = [];
  globalThis.window = { AudioContext: ConfigurableMockAudioContext };
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    configurable: true,
    writable: true,
  });
}

// ---------- Test 1: Permission denied ----------------
async function testPermissionDenied() {
  console.log('--- testPermissionDenied ---');
  resetMocks();
  const engine = new AudioDspEngine();

  // Make getUserMedia reject with a permission error for both attempts
  const permError = new Error('Permission denied');
  permError.name = 'NotAllowedError';
  // We'll reject each call as soon as it's made
  const originalMock = mockGetUserMedia;
  // override to reject immediately
  function rejectingMock(_c) {
    return Promise.reject(permError);
  }
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: { getUserMedia: rejectingMock },
    configurable: true,
    writable: true,
  });

  let caughtErr;
  try {
    await engine.start();
  } catch (e) {
    caughtErr = e;
  }

  // Assertions
  assert.ok(caughtErr, 'Engine.start should reject');
  assert.strictEqual(caughtErr.name, 'NotAllowedError', 'Error name should be permission error');
  assert.strictEqual(engine.isActive(), false, 'Engine should be inactive after failure');
  // No AudioContext should remain open
  assert.strictEqual(ConfigurableMockAudioContext.instances.length, 1, 'AudioContext was created');
  const ctx = ConfigurableMockAudioContext.instances[0];
  assert.ok(ctx.isClosed, 'AudioContext must be closed after permission failure');
  console.log('✅ Permission denied test passed');
}

// ---------- Test 2: AudioContext.resume rejection ----------------
async function testResumeReject() {
  console.log('--- testResumeReject ---');
  resetMocks();
  // Create a context that starts suspended and whose resume rejects
  const engine = new AudioDspEngine();
  // Swap the AudioContext class to a version that will be suspended and reject on resume
  class RejectingAudioContext extends ConfigurableMockAudioContext {
    constructor() {
      super({ initialState: 'suspended', resumeShouldReject: true, resumeError: new Error('Resume failed') });
    }
  }
  globalThis.window.AudioContext = RejectingAudioContext;

  // Allow getUserMedia to succeed (so we isolate resume failure)
  const mockStream = new MockMediaStream('good_stream');
  function successfulMock(_c) {
    return Promise.resolve(mockStream);
  }
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: { getUserMedia: successfulMock },
    configurable: true,
    writable: true,
  });

  let caughtErr;
  try {
    await engine.start();
  } catch (e) {
    caughtErr = e;
  }

  assert.ok(caughtErr, 'Engine.start should reject when resume fails');
  assert.strictEqual(caughtErr.message, 'Resume failed', 'Error message should match resume rejection');
  assert.strictEqual(engine.isActive(), false, 'Engine should be inactive after resume failure');
  // Verify that the created AudioContext was closed
  assert.strictEqual(RejectingAudioContext.instances.length, 1, 'One AudioContext instance created');
  const ctx = RejectingAudioContext.instances[0];
  assert.ok(ctx.isClosed, 'AudioContext must be closed after resume failure');
  console.log('✅ AudioContext.resume rejection test passed');
}



async function runAll() {
  await testPermissionDenied();
  await testResumeReject();
  // Re‑setup for the third test (clean environment)
  resetMocks();
  const engine = new AudioDspEngine();
  // ---------- Failure phase ----------
  const permError = new Error('Permission denied');
  permError.name = 'NotAllowedError';
  function rejectMock(_c) { return Promise.reject(permError); }
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: { getUserMedia: rejectMock },
    configurable: true,
    writable: true,
  });
  try {
    await engine.start();
    assert.fail('First start should have thrown');
  } catch (e) {
    // expected failure
  }
  assert.strictEqual(engine.isActive(), false, 'Engine inactive after first failure');
  // Ensure any created AudioContext was closed
  assert.strictEqual(ConfigurableMockAudioContext.instances.length, 1, 'One AudioContext created during failure');
  assert.ok(ConfigurableMockAudioContext.instances[0].isClosed, 'AudioContext closed after failure');

  // ---------- Success phase ----------
  // Restore getUserMedia to succeed
  const goodStream = new MockMediaStream('good_stream');
  function succeedMock(_c) { return Promise.resolve(goodStream); }
  Object.defineProperty(globalThis.navigator, 'mediaDevices', {
    value: { getUserMedia: succeedMock },
    configurable: true,
    writable: true,
  });
  // Use a running AudioContext (default ConfigurableMockAudioContext)
  const analyser = await engine.start();
  assert.ok(engine.isActive(), 'Engine should be active after successful start');
  assert.strictEqual(engine.getAnalyser(), analyser, 'Returned analyser should be stored');
  // Compute metrics and stop cleanly
  const metrics = engine.getMetrics();
  assert.ok(metrics.instantDb > 0, 'Metrics should be positive after start');
  const finalMetrics = engine.stop();
  assert.strictEqual(engine.isActive(), false, 'Engine should be inactive after stop');
  console.log('✅ Success after failure test passed');
}

runAll().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
