import Box from '@src/components/Box'

export default function Header() {
  return (
    <header className="flex gap-2.5">
      <Box className="grow overflow-hidden">
        <span className="text-muted-foreground mr-1 text-sm font-extralight">How does it work</span>
        <p className="text-ellipsis whitespace-nowrap">
          This simulator works according to the famous Conway’s Game of Life
        </p>
      </Box>
      <Box>
        <img src="./logo_simple.svg" alt="Brand" />
      </Box>
    </header>
  )
}
