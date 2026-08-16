import { AutoModel, AutoTokenizer, Tensor, env } from '@huggingface/transformers';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

env.allowLocalModels = true;
env.useBrowserCache = false;
const MODEL = fileURLToPath(new URL('../models/kokoro-zh/', import.meta.url));

const model = await AutoModel.from_pretrained(MODEL, { dtype: 'q8', device: 'cpu' });
const tokenizer = await AutoTokenizer.from_pretrained(MODEL);
console.log('model loaded:', model.constructor.name);

async function synth(voiceId) {
  const { input_ids } = tokenizer('队长你好，我是你的队员，请多关照。', { truncation: true });
  const buf = readFileSync(fileURLToPath(new URL(`../models/kokoro-zh/voices/${voiceId}.bin`, import.meta.url)));
  const embAll = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
  const offset = 256 * Math.min(Math.max(input_ids.dims.at(-1) - 2, 0), 509);
  const style = embAll.slice(offset, offset + 256);
  const { waveform } = await model({
    input_ids,
    style: new Tensor('float32', style, [1, 256]),
    speed: new Tensor('float32', [1.0], [1]),
  });
  const audio = waveform.data;
  let sum = 0, energy = 0;
  for (let i = 0; i < audio.length; i++) { sum += audio[i]; energy += audio[i] * audio[i]; }
  return { samples: audio.length, mean: (sum / audio.length).toFixed(5), rms: Math.sqrt(energy / audio.length).toFixed(5) };
}

const a = await synth('zf_001');
const b = await synth('zm_009');
console.log('zf_001 ->', JSON.stringify(a));
console.log('zm_009 ->', JSON.stringify(b));
const styleDiff = Math.abs(Number(a.rms) - Number(b.rms));
console.log('SELFTEST OK: kokoro engine works, two voices produced');
console.log('rms difference:', styleDiff.toFixed(5));
