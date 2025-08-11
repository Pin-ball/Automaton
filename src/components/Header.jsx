import Box from "@src/components/Box";

export default function Header() {
  return (
    <header className="flex gap-2.5">
      <Box className="overflow-hidden grow">
        <label>
          <span className="mr-1 text-sm font-extralight text-c-neutral-400">
            How does it works
          </span>
        </label>
        <p className="whitespace-nowrap text-ellipsis">
          This simulator works according to the famous Conway’s Game of Life
        </p>
      </Box>
      <Box>
        <img src="./logo_simple.svg" alt="Brand" />
      </Box>
    </header>
  );
}
