import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const u = process.env.NEXT_PUBLIC_APP_URL || 'https://bookedmove.com';
  const s = '(function(){var c=document.getElementById("bookedmove-widget")||document.currentScript.parentElement;var i=document.createElement("iframe");i.src="'+u+'/widget/'+params.slug+'";i.style.width="100%";i.style.minHeight="700px";i.style.border="none";i.allow="payment";c.appendChild(i);})();';
  return new NextResponse(s, { headers: { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' } });
}
