import assert from 'assert';
import { AudioDspEngine } from '/Users/abhishekkumar/Desktop/NoiseMap/src/services/audioDspService.ts';

// Set up mock Web Audio and MediaDevices environments
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

class MockAudioContext {
  constructor() {
    MockAudioContext.instances.push(this);
    this.id = `ctx_${MockAudioContext.instances.length}`;
    this.state = 'running'; // Or 'suspended'
    this.isClosed = false;
    this.closeCount = 0;
    this.analyser = new MockAnalyserNode(this.id);
  }
  async resume() {
    this.state = 'running';
  }
  async close() {
    this.isClosed = true;
    this.closeCount++;
    this.state = 'closed';
  }
  createMediaStreamSource(_stream) {
    return {
      connect: (_dest) => {},
    };
  }
  createAnalyser() {
    return this.analyser;
  }
}
MockAudioContext.instances = [];

let gumCalls = [];
function mockGetUserMedia(constraints) {
  return new Promise((resolve, reject) => {
    gumCalls.push({ constraints, resolve, reject });
  });
}

globalThis.window = {
  AudioContext: MockAudioContext,
};
Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  configurable: true,
  writable: true,
});

async function testProductionRace() {
  console.log('Testing Production AudioDspEngine Race Condition...');
  const engine = new AudioDspEngine();

  // 1. Start Attempt A (pending getUserMedia)
  const promiseA = engine.start().catch((err) => err);
  // Yield microtask to allow AudioContext initialization to reach getUserMedia
  await Promise.resolve();
  await Promise.resolve();

  assert.strictEqual(gumCalls.length, 1, 'Attempt A should invoke getUserMedia');
  const callA = gumCalls[0];
  const streamA = new MockMediaStream('stream_A');

  // Verify AudioContext for A was instantiated
  assert.strictEqual(MockAudioContext.instances.length, 1, 'AudioContext A created');
  const ctxA = MockAudioContext.instances[0];

  // 2. User stops/cancels Attempt A
  engine.stop();
  assert.strictEqual(engine.isActive(), false, 'Engine is not active after stop');

  // 3. User initiates Attempt B
  const promiseB = engine.start();
  await Promise.resolve();
  await Promise.resolve();

  assert.strictEqual(gumCalls.length, 2, 'Attempt B should invoke getUserMedia');
  const callB = gumCalls[1];
  const streamB = new MockMediaStream('stream_B');

  assert.strictEqual(MockAudioContext.instances.length, 2, 'AudioContext B created');
  const ctxB = MockAudioContext.instances[1];

  // 4. Resolve Attempt B first
  callB.resolve(streamB);
  const analyserB = await promiseB;
  assert.strictEqual(engine.isActive(), true, 'Engine must be active with Attempt B');
  assert.strictEqual(engine.getAnalyser(), analyserB, 'Engine analyser must be B analyser');

  // 5. Now resolve Attempt A late
  callA.resolve(streamA);
  const resultA = await promiseA;

  // 6. Verify assertions
  // A should fail with AbortError
  assert.strictEqual(resultA instanceof Error, true, 'Result A must be an Error');
  assert.strictEqual(resultA.name, 'AbortError', `Result A must be AbortError, got ${resultA.name}`);
  assert.strictEqual(resultA.message, 'Audio startup was cancelled by a newer session');

  // A's own resources should be cleaned up
  assert.strictEqual(streamA.tracks[0].isStopped, true, "Attempt A's media stream track must be stopped");
  assert.strictEqual(ctxA.isClosed, true, "Attempt A's AudioContext must be closed");

  // B's active resources must NOT be touched
  assert.strictEqual(streamB.tracks[0].isStopped, false, "Attempt B's track must NOT be stopped");
  assert.strictEqual(ctxB.isClosed, false, "Attempt B's AudioContext must NOT be closed");
  assert.strictEqual(engine.isActive(), true, 'Engine must remain active for B');
  assert.strictEqual(engine.getAnalyser(), analyserB, 'Engine analyser must still belong to B');

  // Verify B can compute metrics and stop cleanly
  const metrics = engine.getMetrics();
  assert.strictEqual(metrics.instantDb > 0, true, 'Metrics computed from active engine');
  const finalMetrics = engine.stop();
  assert.strictEqual(engine.isActive(), false, 'Engine stopped');
  assert.strictEqual(streamB.tracks[0].isStopped, true, "Attempt B track stopped on final engine.stop()");
  assert.strictEqual(ctxB.isClosed, true, "Attempt B context closed on final engine.stop()");

  console.log('✅ ALL PRODUCTION DSP ENGINE ASSERTIONS PASSED!');
}

testProductionRace().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
