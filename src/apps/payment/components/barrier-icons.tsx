import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

// Shared square viewBox, cropped tight around the artwork so the icon fills
// its box. All icons use the same one, so the post keeps the same size and
// position in every state.
const VIEW_BOX = '-14 -76 540 540'
const PIVOT = '105.93 159.9'
const OPEN_ROTATION = -30
// Vertical scale of the arm around its centre line (1 = original thickness)
const ARM_THICKNESS = 1.5

const COLORS = {
  base: '#243442',
  post: '#35495E',
  arm: '#ECF0F1',
  stripe: '#C03A2B',
  pivot: '#95A5A5',
  lock: '#F39C12',
  shackle: '#95A5A5',
}

const BASE =
  'M113.593,424.725H9.993c-5.517,0-9.993-4.476-9.993-9.993v-15.325c0-5.517,4.476-9.993,9.993-9.993h103.601c5.517,0,9.993,4.476,9.993,9.993v15.325C123.586,420.249,119.111,424.725,113.593,424.725'
const POST =
  'M70.621,159.897c0-19.5,15.81-35.31,35.31-35.31v-18.609c0-9.225-7.477-16.702-16.702-16.702H34.357c-9.225,0-16.702,7.477-16.702,16.702v283.436h88.276V195.207C86.431,195.207,70.621,179.397,70.621,159.897'
const PIVOT_CIRCLE =
  'M141.241,159.897c0,19.5-15.81,35.31-35.31,35.31s-35.31-15.81-35.31-35.31s15.81-35.31,35.31-35.31S141.241,140.397,141.241,159.897'
const ARM =
  'M503.888,177.552H132.415v-35.31h371.474c4.484,0,8.113,3.628,8.113,8.113v19.085C512.001,173.924,508.373,177.552,503.888,177.552'
const STRIPE = (dx: number) =>
  `M${244.586 + dx},148.483c1.721-1.721,2.586-3.981,2.586-6.241h-21.31l-29.069,29.069c-1.721,1.721-2.586,3.981-2.586,6.241h21.31L${244.586 + dx},148.483z`

function Arm() {
  return (
    <g transform={`translate(0 159.9) scale(1 ${ARM_THICKNESS}) translate(0 -159.9)`}>
      <path fill={COLORS.arm} d={ARM} />
      <path fill={COLORS.stripe} d={STRIPE(0)} />
      <path fill={COLORS.stripe} d={STRIPE(70.621)} />
      <path fill={COLORS.stripe} d={STRIPE(141.241)} />
      <path fill={COLORS.stripe} d={STRIPE(211.862)} />
    </g>
  )
}

type State = 'open' | 'closed'

function BarrierSvg({ state, ...props }: IconProps & { state: State }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox={VIEW_BOX}
      width={24}
      height={24}
      aria-hidden='true'
      {...props}
    >
      <g transform='translate(0 -1)'>
        <path fill={COLORS.base} d={BASE} />
        {state === 'open' ? (
          <g transform={`rotate(${OPEN_ROTATION} ${PIVOT})`}>
            <Arm />
          </g>
        ) : (
          <Arm />
        )}
        <path fill={COLORS.post} d={POST} />
        <path fill={COLORS.pivot} d={PIVOT_CIRCLE} />
      </g>
    </svg>
  )
}

export function BarrierOpenIcon(props: IconProps) {
  return <BarrierSvg state='open' {...props} />
}

export function BarrierClosedIcon(props: IconProps) {
  return <BarrierSvg state='closed' {...props} />
}

/* ---------- standalone padlocks (not related to the barrier) ---------- */

function PadlockSvg({ unlocked, ...props }: IconProps & { unlocked: boolean }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 100 100'
      width={24}
      height={24}
      aria-hidden='true'
      {...props}
    >
      <path
        d={
          unlocked
            ? 'M31 48V26a19 19 0 0 1 38 0V34'
            : 'M31 48V32a19 19 0 0 1 38 0V48'
        }
        fill='none'
        stroke={COLORS.shackle}
        strokeWidth={10}
        strokeLinecap='round'
      />
      <rect x={16} y={48} width={68} height={46} rx={9} fill={COLORS.lock} />
      <circle cx={50} cy={66} r={7} fill={COLORS.base} />
      <rect x={47} y={68} width={6} height={14} rx={2} fill={COLORS.base} />
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  return <PadlockSvg unlocked={false} {...props} />
}

export function UnlockIcon(props: IconProps) {
  return <PadlockSvg unlocked {...props} />
}