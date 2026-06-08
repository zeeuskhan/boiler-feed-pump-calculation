import React, { useEffect, useRef } from 'react';

export default function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the script is already loaded to avoid duplicate injections
    if (containerRef.current) {
      containerRef.current.innerHTML = '';

      // Define the global atOptions configuration required by the ad network script
      (window as any).atOptions = {
        'key': '6b6777c4248ba9b31f1a7f8087ca4b49',
        'format': 'iframe',
        'height': 90,
        'width': 728,
        'params': {}
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://endedstrung.com/6b6777c4248ba9b31f1a7f8087ca4b49/invoke.js';
      
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="no-print my-8 flex justify-center items-center w-full overflow-x-auto">
      <div 
        ref={containerRef} 
        style={{ minWidth: '728px', minHeight: '90px' }} 
        className="bg-[#101E35] border border-[#2A3F5F]/40 flex items-center justify-center text-xs text-slate-500 rounded-lg shadow-inner overflow-hidden"
      >
        <div className="text-slate-500 font-mono text-[10px] animate-pulse">Loading Sponsor Match...</div>
      </div>
    </div>
  );
}
