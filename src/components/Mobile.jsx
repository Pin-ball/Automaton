export default function Mobile() {

  return (
    <div className='px-4 py-8 flex flex-col h-full'>
      <header>
        <span className='p-2 bg-c-neutral-700 inline-block rounded-full'>
          <img src='./logo_simple.svg' alt='logo' className='size-8'/>
        </span>
      </header>
      <main className='py-3 px-5 m-auto rounded-lg'>
        <h3 className='mb-1 font-extralight text-c-neutral-400 text-sm'>Information</h3>
        <p>This simulator is only available on Desktop</p>
      </main>
    </div>
  )
}
