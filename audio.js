"use strict";
// Sound: effects + background music, all synthesized with the Web Audio API.
// No audio files are loaded, and every track here is original.
const Sound = (() => {
  let ac, mg, sg, mb, S = { mv: .8, sv: .8, mu: .5, track: "off" }
  let paused = false, noiseBuf = null, timer = 0
  let cur = null, step = 0, nextT = 0, arpN = 0

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)
  const CH = { m: [0, 3, 7, 12], M: [0, 4, 7, 12] }       // chord tones (semitones above the root)

  // step lists are 16th-note positions inside a bar (0-15). Each track loops 4 bars.
  const TRACKS = [
    { id: "lagos", name: "Lagos Nights", bpm: 104, swing: .12, roots: [45, 41, 48, 43], q: "mMMM",
      k: [0, 6, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], hv: .05,
      bass: { steps: [0, 3, 6, 10, 12], wave: "triangle", len: .2, v: .5 },
      arp: { steps: [2, 5, 7, 9, 13, 15], wave: "triangle", oct: 24, len: .13, v: .16, seq: [2, 1, 3, 0, 2] } },
    { id: "neon", name: "Neon Drive", bpm: 100, swing: 0, roots: [40, 36, 43, 38], q: "mMMM",
      k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14], hv: .06,
      bass: { steps: [0, 2, 4, 6, 8, 10, 12, 14], wave: "sawtooth", len: .13, v: .26, lp: 520 },
      arp: { steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], wave: "square", oct: 24, len: .08, v: .06, seq: [0, 1, 2, 3, 2, 1] } },
    { id: "sunrise", name: "Highlife Sunrise", bpm: 116, swing: .18, roots: [36, 41, 43, 33], q: "MMMm",
      k: [0, 8, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], hv: .04,
      bass: { steps: [0, 3, 4, 8, 11, 12], wave: "triangle", len: .2, v: .5 },
      arp: { steps: [0, 3, 6, 8, 10, 14], wave: "triangle", oct: 36, len: .14, v: .14, seq: [1, 3, 2, 0, 3, 2] } },
    { id: "chill", name: "Chill Waves", bpm: 78, swing: .2, roots: [38, 34, 41, 36], q: "mMMM",
      k: [0, 10], s: [12], sv: .1, h: [0, 2, 4, 6, 8, 10, 12, 14], hv: .025,
      bass: { steps: [0, 7, 10], wave: "sine", len: .4, v: .5 },
      arp: { steps: [4, 9, 14], wave: "sine", oct: 36, len: .3, v: .1, seq: [2, 0, 1, 3] },
      pad: { oct: 24, wave: "triangle", v: .05 } },
  ]

  // ----- instruments -----
  const note = (t, m, d, type, v, lp) => {
    const o = ac.createOscillator(), g = ac.createGain()
    o.type = type; o.frequency.value = mtof(m)
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .008)
    g.gain.exponentialRampToValueAtTime(.0001, t + Math.max(.04, d))
    if (lp) { const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; o.connect(f); f.connect(g) }
    else o.connect(g)
    g.connect(mb); o.start(t); o.stop(t + d + .03)
  }
  const kick = (t) => {
    const o = ac.createOscillator(), g = ac.createGain()
    o.type = "sine"; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + .12)
    g.gain.setValueAtTime(.8, t); g.gain.exponentialRampToValueAtTime(.001, t + .22)
    o.connect(g); g.connect(mb); o.start(t); o.stop(t + .25)
  }
  const burst = (t, dur, vol, type, freq, q) => {
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain()
    src.buffer = noiseBuf; f.type = type; f.frequency.value = freq; if (q) f.Q.value = q
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur)
    src.connect(f); f.connect(g); g.connect(mb); src.start(t); src.stop(t + dur + .02)
  }
  const hat = (t, v) => burst(t, .04, v, "highpass", 7000)
  const clap = (t, v) => burst(t, .12, v, "bandpass", 1800, .8)

  // ----- sequencer -----
  const stepLen = (T) => 60 / T.bpm / 4 / (1 + .06 * api.mood())
  const play = (n, t, T) => {
    const bar = (n >> 4) & 3, s = n & 15, root = T.roots[bar], ch = CH[T.q[bar]], mood = api.mood(), sd = stepLen(T)
    if (T.k.includes(s)) kick(t)
    if (T.s.includes(s)) clap(t, T.sv || .2)
    const on = T.h.includes(s)
    if (on || (mood > 0 && s % 2)) hat(t, T.hv * (on ? 1 : .6))
    if (T.bass.steps.includes(s)) note(t, root, T.bass.len, T.bass.wave, T.bass.v, T.bass.lp)
    if (T.arp.steps.includes(s)) note(t, root + T.arp.oct + ch[T.arp.seq[arpN++ % T.arp.seq.length]], T.arp.len, T.arp.wave, T.arp.v)
    if (s === 0 && T.pad) for (let i = 0; i < 3; i++) note(t, root + T.pad.oct + ch[i], sd * 15, T.pad.wave, T.pad.v)
  }
  const tick = () => {
    if (!ac || paused || !cur || ac.state !== "running") return
    if (nextT < ac.currentTime) nextT = ac.currentTime + .05
    while (nextT < ac.currentTime + .2) {
      const sd = stepLen(cur)
      play(step, nextT + (step & 1 ? cur.swing * sd : 0), cur)
      nextT += sd; step++
    }
  }

  // ----- public api -----
  const api = {
    tracks: TRACKS.map(({ id, name }) => ({ id, name })),
    mood: () => 0,                      // the game sets this: 0 calm, 1 faster, 2 boss
    init(settings) {
      if (settings) S = settings
      if (ac) return
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)()
        mg = ac.createGain(); sg = ac.createGain(); mb = ac.createGain()
        sg.connect(mg); mb.connect(mg); mg.connect(ac.destination)
        noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * .3), ac.sampleRate)
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
        api.volume(); api.setTrack(S.track); ac.resume()
        timer = setInterval(tick, 40)
      } catch { ac = null }
    },
    volume() { if (ac) { mg.gain.value = S.mv; sg.gain.value = S.sv; mb.gain.value = S.mu * .5 } },
    setTrack(id) { cur = TRACKS.find((t) => t.id === id) || null; step = 0; arpN = 0; nextT = 0 },
    suspend() { paused = true; try { ac && ac.suspend() } catch {} },
    resume() { paused = false; try { ac && ac.resume() } catch {} },
    tone(f, d = .08, ty = "square", v = .15) {
      if (!ac || paused) return
      const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime
      o.type = ty; o.frequency.setValueAtTime(Math.max(40, f), t0)
      if (ty !== "sine") o.frequency.exponentialRampToValueAtTime(Math.max(36, f * (ty === "sawtooth" ? .35 : .62)), t0 + d)
      g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + Math.max(.03, d))
      o.connect(g); g.connect(sg); o.start(t0); o.stop(t0 + d + .02)
    },
    noise(d = .12, v = .18) {
      if (!ac || paused) return
      const n = Math.floor(ac.sampleRate * d), buf = ac.createBuffer(1, n, ac.sampleRate), data = buf.getChannelData(0)
      for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n)
      const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain()
      f.type = "bandpass"; f.frequency.value = 900; src.buffer = buf; g.gain.value = v
      src.connect(f); f.connect(g); g.connect(sg); src.start()
    },
  }
  return api
})()
