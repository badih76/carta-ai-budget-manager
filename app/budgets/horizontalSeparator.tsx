import React from 'react'

function HorizontalSeparator() {
  return (    
    <div className="w-full flex flex-col gap-[3px] my-6">
        {/* Top Line */}
        <div className="w-full border-t border-slate-300" />
        {/* Bottom Line */}
        <div className="w-full border-t border-slate-300" />
    </div>
  )
}

export default HorizontalSeparator