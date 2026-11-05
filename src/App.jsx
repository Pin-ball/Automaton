import Automata from '@src/components/Automata'
import Header from '@src/components/Header'
import Menu from '@src/components/Menu'
import ScreenTooSmall from '@src/components/ScreenTooSmall'
import useMediaQuery from '@src/hooks/useMediaQuery.js'

const MIN_WIDTH = 1024
const MIN_HEIGHT = 780

export default function App() {
  const isTooSmall = useMediaQuery(
    `(max-width: ${MIN_WIDTH - 1}px), (max-height: ${MIN_HEIGHT - 1}px)`,
  )

  if (isTooSmall) {
    return <ScreenTooSmall />
  }

  return (
    <div className="flex h-full gap-2.5 p-5">
      <aside className="flex h-full max-w-80 min-w-72 grow flex-col gap-2.5">
        <Menu />
      </aside>

      <div className="flex grow-2 flex-col gap-2.5">
        <Header />
        <Automata />
      </div>
    </div>
  )
}
