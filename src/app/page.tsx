import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
            <span className="text-xl font-bold text-gray-900">BookedMove</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">Log In</Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
          Built for Moving Companies
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Book Moves <span className="text-blue-600">24/7</span><br />While You Sleep
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Add a beautiful booking widget to your website. Customers get instant price estimates, 
          pick their date, and pay a deposit - all without a phone call.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/login" className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg shadow-lg shadow-blue-200">
            Start Free Trial
          </Link>
          <Link href="/widget/ihaul" className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 font-semibold text-lg">
            See Demo Widget
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🎨', title: 'Customize Your Widget', desc: 'Set your branding, pricing rules, and deposit requirements. Takes 5 minutes.' },
              { icon: '📋', title: 'Embed on Your Site', desc: 'Copy one line of code. Works on any website - WordPress, Wix, Squarespace, anything.' },
              { icon: '💰', title: 'Collect Bookings & Deposits', desc: 'Customers book online with instant estimates. You get notified and deposits hit your Stripe.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-gray-600 mb-12">No hidden fees. Cancel anytime.</p>
          <div className="max-w-sm mx-auto bg-white border-2 border-blue-600 rounded-2xl p-8 shadow-xl">
            <div className="text-blue-600 font-semibold mb-2">PRO</div>
            <div className="text-5xl font-bold mb-1">$49<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <p className="text-gray-500 mb-6">per company</p>
            <ul className="text-left space-y-3 mb-8">
              {['Unlimited bookings', 'Custom branding', 'Stripe deposit collection', 'SmartMoving integration', 'Email confirmations', 'Real-time notifications'].map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/login" className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-center">
              Start 14-Day Free Trial
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Moves While You Sleep?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join moving companies already using BookedMove to grow their business.</p>
          <Link href="/login" className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50">
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 BookedMove. Built by MovingLetters.ai
        </div>
      </footer>
    </div>
  );
}
