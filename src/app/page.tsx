import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ArrowRight, BarChart3, Palette, Code2, Shield, Zap, Users, Star, Play, Phone, Calendar, DollarSign, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Image src="/images/2026-02-12-bookedmove-logo.png" alt="BookedMove" width={180} height={40} className="h-9 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Log In</Link>
            <Link href="/signup" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 text-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-6 tracking-wide uppercase">
                <Zap className="h-3.5 w-3.5" />
                Built by movers, for movers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-5 leading-[1.08] tracking-tight">
                Stop losing moves to your voicemail.
              </h1>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                Your customers want to book online. Give them a beautiful booking widget that shows instant estimates, collects deposits, and fills your calendar — even at 2am.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/signup" className="group px-7 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-semibold shadow-xl shadow-blue-600/25 transition-all hover:shadow-2xl hover:shadow-blue-600/30 flex items-center gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/widget/ihaul" className="px-7 py-3.5 border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-gray-300 hover:bg-gray-50 font-semibold transition-all flex items-center gap-2">
                  <Play className="h-4 w-4" /> Live Demo
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> 14-day trial</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cancel anytime</span>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-100">
                <Image src="/images/hero-moving-day.png" alt="Happy couple booking their move online" width={600} height={400} className="w-full h-auto" priority />
              </div>
              {/* Floating stats cards */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Deposit Collected</p>
                  <p className="text-lg font-bold text-gray-900">$215.00</p>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">New Booking!</p>
                  <p className="text-sm font-bold text-gray-900">March 15, 8am</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { stat: '67%', label: 'of customers prefer to book online' },
              { stat: '3 in 4', label: 'will leave if they can\'t book instantly' },
              { stat: '40%', label: 'of calls go to voicemail during moves' },
              { stat: '2x', label: 'more bookings with online scheduling' },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-1">{item.stat}</p>
                <p className="text-sm text-gray-500 leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28" id="how-it-works">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm tracking-wide uppercase mb-3">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Live on your site in 5 minutes</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">No developers. No complex setup. Sign up, customize, embed. Done.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', icon: Palette, title: 'Make It Yours', desc: 'Upload your logo. Set your colors. Configure pricing, crew sizes, and deposit rules. Add custom questions if you want. Takes 3 minutes.', color: 'blue' },
              { step: '2', icon: Code2, title: 'Drop It On Your Site', desc: 'Copy one line of embed code. Paste it on your website. Works with WordPress, Wix, Squarespace, GoDaddy — anything with HTML.', color: 'indigo' },
              { step: '3', icon: BarChart3, title: 'Watch Bookings Roll In', desc: 'Customers get instant estimates and book right there. You get notified. Deposits hit your account. All while you\'re running jobs.', color: 'violet' },
            ].map((item) => (
              <div key={item.step} className="group relative">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-500 h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${item.color}-50 text-${item.color}-600 font-extrabold text-lg`}>
                      {item.step}
                    </div>
                    <div className="h-px flex-1 bg-gray-100" />
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mb-5">
                    <item.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-600 font-semibold text-sm tracking-wide uppercase mb-3">Your Command Center</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 tracking-tight">Know exactly what&apos;s happening</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                See every booking, every dollar, every customer — in real-time. Track where people drop off your widget and fix it. Export to CSV. Update statuses. Send confirmations. All from one clean dashboard.
              </p>
              <div className="space-y-4">
                {[
                  { icon: BarChart3, text: 'Bookings, revenue, and conversion rates at a glance' },
                  { icon: Users, text: 'Invite your team with owner, admin, or viewer roles' },
                  { icon: Clock, text: 'See exactly when and where customers drop off' },
                  { icon: Shield, text: 'Your API keys are AES-256 encrypted — never exposed' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-gray-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-100">
                <Image src="/images/dashboard-preview.png" alt="BookedMove dashboard showing booking analytics" width={600} height={400} className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Widget preview */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 flex justify-center">
              <div className="relative w-[280px]">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-900/15 border-8 border-gray-900 bg-gray-900">
                  <Image src="/images/widget-phone.png" alt="BookedMove booking widget on mobile phone" width={280} height={560} className="w-full h-auto" />
                </div>
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <p className="text-blue-600 font-semibold text-sm tracking-wide uppercase mb-3">The Booking Widget</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 tracking-tight">Beautiful on every screen</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Your customers pick their addresses (with Google autocomplete), choose their move date, tell you about their home, and see an instant price — all in a smooth, guided flow that feels like using a top-tier app.
              </p>
              <div className="space-y-3">
                {[
                  'Google Places autocomplete for addresses',
                  'Square footage slider & "how full" selector',
                  'Real-time price estimates from your pricing rules',
                  'Authorize.net deposit collection built in',
                  'Custom questions & toggleable steps',
                  'Your branding, your colors, your logo',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-gray-600 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 bg-gray-50/80" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm tracking-wide uppercase mb-3">Everything You Need</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Built for the way movers actually work</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '💰', title: 'Instant Estimates', desc: 'Customers see real-time pricing based on your rates, home size, and move details.' },
              { icon: '🎨', title: 'Full Branding Control', desc: 'Your logo, colors, and custom CSS. The widget looks like you built it.' },
              { icon: '📊', title: 'Conversion Analytics', desc: 'See exactly where customers drop off. Fix bottlenecks. Book more moves.' },
              { icon: '👥', title: 'Multi-User Teams', desc: 'Invite dispatchers and office staff with role-based access. Everyone stays in the loop.' },
              { icon: '💳', title: 'Deposit Collection', desc: 'Authorize.net gateway built in. Collect deposits at booking. Reduce no-shows.' },
              { icon: '📱', title: 'Mobile-First', desc: 'Over 70% of your customers are on their phone. The widget is gorgeous on every device.' },
              { icon: '📋', title: 'Booking Management', desc: 'Search, filter, update status, add notes, export CSV. Your single source of truth.' },
              { icon: '📧', title: 'Auto Notifications', desc: 'Branded emails for confirmations, status updates, and payment receipts. All automatic.' },
              { icon: '🔒', title: 'Enterprise Security', desc: 'AES-256 encrypted API keys. PCI-compliant payments. Your data stays yours.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-600/5 transition-all duration-300">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / movers image */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/10">
              <Image src="/images/movers-team.png" alt="Professional moving crew" width={600} height={400} className="w-full h-auto" />
            </div>
            <div>
              <p className="text-blue-600 font-semibold text-sm tracking-wide uppercase mb-3">Built by Movers</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 tracking-tight">We know this industry because we live it</h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                BookedMove was built by a moving company owner who got tired of missing calls during jobs. We know the pain of lost leads, voicemail tag, and customers who go to your competitor because they couldn&apos;t book right now.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Every feature was designed around how real moving companies actually operate — from crew-size-based pricing to deposit requirements that reduce no-shows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-b from-gray-50/50 to-white" id="pricing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm tracking-wide uppercase mb-3">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">One booking pays for a year</h2>
            <p className="text-lg text-gray-500">Seriously. Your first online booking covers the cost. Everything after is profit.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter', price: 49, desc: 'Perfect for getting started',
                features: ['1 booking widget', 'Up to 50 bookings/mo', 'Basic analytics', 'Custom branding', 'Email notifications', 'Email support'],
                cta: 'Start Free Trial', popular: false,
              },
              {
                name: 'Pro', price: 99, desc: 'For growing companies',
                features: ['Unlimited widgets', 'Unlimited bookings', 'Advanced analytics & funnel', 'Team access (5 users)', 'Authorize.net payments', 'SmartMoving integration', 'Custom form questions', 'CSV export', 'Priority support'],
                cta: 'Start Free Trial', popular: true,
              },
              {
                name: 'Enterprise', price: null, desc: 'Multi-location operations',
                features: ['Everything in Pro', 'Unlimited team members', 'API access', 'White-label (no BookedMove branding)', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
                cta: 'Contact Sales', popular: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`relative bg-white rounded-3xl p-8 transition-all duration-300 ${plan.popular ? 'border-2 border-blue-600 shadow-2xl shadow-blue-600/10 md:scale-[1.03]' : 'border border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
                </div>
                <div className="mb-6">
                  {plan.price ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold text-gray-900">${plan.price}</span>
                      <span className="text-gray-400 font-medium">/mo</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-extrabold text-gray-900">Let&apos;s talk</div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.price ? '/signup' : 'mailto:matt@bookedmove.com'}
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" id="testimonials">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm tracking-wide uppercase mb-3">From Real Movers</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Don&apos;t take our word for it</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Mike Johnson', company: 'Summit Moving Co.', location: 'Denver, CO', quote: 'We went from 10 online bookings a month to over 60. The widget pays for itself before the free trial even ends.' },
              { name: 'Sarah Chen', company: 'Golden State Movers', location: 'Sacramento, CA', quote: 'I had our widget live on our site in under 10 minutes. No developer, no plugins, no headaches. It just worked.' },
              { name: 'David Park', company: 'Metro Relocations', location: 'Atlanta, GA', quote: 'The analytics showed us 40% of people were dropping off at the date picker. We fixed it and doubled our conversion rate overnight.' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-7 rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed text-[15px]">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.company} · {t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-[2rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.3),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Your competitors are booking<br />moves while you sleep.</h2>
              <p className="text-blue-100 mb-8 text-lg max-w-xl mx-auto leading-relaxed">Join the moving companies that stopped playing phone tag and started booking online.</p>
              <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl">
                Start Your Free Trial <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-blue-200 text-sm mt-5">Free 14-day trial · No credit card · Set up in 5 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/images/2026-02-12-bookedmove-logo.png" alt="BookedMove" width={140} height={32} className="h-7 w-auto" />
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/login" className="hover:text-gray-600 transition-colors">Log In</Link>
            <a href="mailto:matt@bookedmove.com" className="hover:text-gray-600 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-gray-400">© 2026 BookedMove · A <a href="https://movingletters.ai" className="text-blue-500 hover:underline">MovingLetters.ai</a> product</p>
        </div>
      </footer>
    </div>
  );
}
