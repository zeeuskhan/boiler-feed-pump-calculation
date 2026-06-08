import React from 'react';

const iframeSrcDoc = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '6b6777c4248ba9b31f1a7f8087ca4b49',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://endedstrung.com/6b6777c4248ba9b31f1a7f8087ca4b49/invoke.js"></script>
  </body>
</html>
`;

export default function AdBanner() {
  return (
    <div className="no-print my-6 flex justify-center items-center w-full overflow-x-auto">
      <div 
        style={{ width: '728px', height: '90px' }} 
        className="bg-[#101E35] border border-[#2A3F5F]/40 flex items-center justify-center rounded-lg shadow-inner overflow-hidden"
      >
        <iframe
          title="Sponsored Content"
          srcDoc={iframeSrcDoc}
          style={{ width: '728px', height: '90px', border: 'none', overflow: 'hidden' }}
          scrolling="no"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
