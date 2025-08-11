import Automata from "@src/components/Automata";
import Header from "@src/components/Header";
import Menu from "@src/components/Menu";
import Mobile from "@src/components/Mobile";
import { useMedia } from "react-use";
import "rsuite/dist/rsuite-no-reset.min.css";

export default function App() {
  const isMobile = useMedia("(max-width: 768px)");

  if (isMobile) {
    return <Mobile />;
  }

  return (
    <div className="flex gap-2.5 p-5 h-full">
      <aside className="max-w-80 min-w-72 grow flex gap-2.5 flex-col h-full">
        <Menu />
      </aside>

      <div className="grow-2 flex gap-2.5 flex-col">
        <Header />
        <Automata />
      </div>
    </div>
  );
}
