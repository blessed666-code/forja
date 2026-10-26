import { applyMotionLevel } from './motionLevel'

const SCRIPT = `(${applyMotionLevel.toString()})();window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',${applyMotionLevel.toString()});`

export function MotionLevelScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce}>{SCRIPT}</script>
}
