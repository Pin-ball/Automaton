import { Automata, Menu, Header } from "./components";
import 'rsuite/dist/rsuite-no-reset.min.css';
// import 'rsuite/dist/rsuite.min.css';
import { Mobile } from "@src/components";
import { useMedia } from 'react-use'


export default function App() {
  // console.log('--> Refresh: App')
  const isMobile = useMedia('(max-width: 768px)')


  if (isMobile) {
    return <Mobile />
  }


  return (
    <div className='flex gap-2.5 p-5 h-full'>

      <aside className='max-w-80 min-w-72 grow flex gap-2.5 flex-col h-full'>
        <Menu />
      </aside>

      <div className='grow-2 flex gap-2.5 flex-col'>
        <Header />
        <Automata />
      </div>
    </div>
  )
}



