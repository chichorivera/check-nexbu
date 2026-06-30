export default function Header() {
  return (
    <header className="border-b border-[#e9e9e7] bg-white">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-[#2383e2] rounded-md">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-[#37352f] leading-none">Nexbu Check</h1>
          <p className="text-xs text-[#787774] mt-0.5">Auditoría automatizada para WordPress</p>
        </div>
      </div>
    </header>
  )
}
