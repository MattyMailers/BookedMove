import Link from 'next/link';
import { Truck, CheckCircle2, ArrowRight, BarChart3, Palette, Code2, Shield, Zap, Users, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
            <span className="text-xl font-bold text-gray-900">BookedMove</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Reviews</a>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">Log In</Link>
            <Link href="/signup" className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-600/20">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              Built specifically for moving companies
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              The Booking System<br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Built for Movers</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Beautiful booking widgets. Instant price estimates. Deposits collected automatically.
              Your customers book 24/7 while you sleep.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/signup" className="group px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-semibold text-lg shadow-xl shadow-blue-600/25 transition-all hover:shadow-2xl hover:shadow-blue-600/30 flex items-center gap-2">
                Start Free Trial <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/widget/ihaul" className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:border-gray-300 hover:bg-gray-50 font-semibold text-lg transition-all">
                See Demo Widget
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-6">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> Trusted by 200+ moving companies</span>
          <span>•</span>
          <span>50,000+ bookings processed</span>
          <span>•</span>
          <span>$12M+ in deposits collected</span>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24" id="features">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold mb-3">HOW IT WORKS</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Up and running in 5 minutes</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">No developers needed. No complex setup. Just sign up, customize, and embed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Palette, title: 'Customize Your Widget', desc: 'Set your brand colors, logo, pricing rules, and deposit requirements. Toggle steps on or off. Add custom questions.' },
              { step: '02', icon: Code2, title: 'Embed on Your Site', desc: 'Copy one line of code. Works on WordPress, Wix, Squarespace, or any website. It just works.' },
              { step: '03', icon: BarChart3, title: 'Collect & Track', desc: 'Customers book online with instant estimates. You get notified, deposits hit your account, analytics show everything.' },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                  <div className="text-6xl font-bold text-gray-100 mb-4">{item.step}</div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
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

      {/* Features grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold mb-3">FEATURES</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything you need to book more moves</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '💰', title: 'Instant Estimates', desc: 'Customers see real-time pricing based on your rules — home size, distance, time of year.' },
              { icon: '🎨', title: 'Custom Branding', desc: 'Your logo, your colors, your questions. The widget looks like part of your website.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'See bookings, conversion rates, revenue, and drop-off points. Know what\'s working.' },
              { icon: '👥', title: 'Team Management', desc: 'Invite your team with role-based access. Owners, admins, and viewers.' },
              { icon: '🔒', title: 'Encrypted API Keys', desc: 'Your Google Maps, SmartMoving, and Stripe keys are AES-256 encrypted. Never exposed.' },
              { icon: '📱', title: 'Mobile-First Design', desc: 'Gorgeous on every device. Your customers book from their phone as easily as desktop.' },
              { icon: '📋', title: 'Booking Management', desc: 'Status updates, notes, search, filter, CSV export. Manage everything in one place.' },
              { icon: '🔌', title: 'SmartMoving Integration', desc: 'Bookings sync to SmartMoving CRM automatically. No double entry.' },
              { icon: '⚡', title: 'Widget Analytics', desc: 'Track loads, step completions, submissions, and failures. See your funnel.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24" id="pricing">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold mb-3">PRICING</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-500">No hidden fees. No surprise charges. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter', price: 49, desc: 'For small movers getting started',
                features: ['1 booking widget', 'Up to 50 bookings/mo', 'Basic analytics', 'Email support', 'Custom branding'],
                cta: 'Start Free Trial', popular: false,
              },
              {
                name: 'Pro', price: 99, desc: 'For growing moving companies',
                features: ['Unlimited widgets', 'Unlimited bookings', 'Advanced analytics & funnel', 'Team management (5 users)', 'SmartMoving integration', 'Priority support', 'Custom form questions', 'CSV export'],
                cta: 'Start Free Trial', popular: true,
              },
              {
                name: 'Enterprise', price: null, desc: 'For multi-location operations',
                features: ['Everything in Pro', 'Unlimited team members', 'API access', 'White-label option', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
                cta: 'Contact Sales', popular: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`relative bg-white rounded-3xl p-8 ${plan.popular ? 'border-2 border-blue-600 shadow-2xl shadow-blue-600/10 scale-105' : 'border border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
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
                      <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500">/mo</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-gray-900">Custom</div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0" />
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.price ? '/signup' : 'mailto:matt@movingletters.ai'}
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition-colors ${
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
      <section className="py-24 bg-gray-50" id="testimonials">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold mb-3">TESTIMONIALS</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Loved by moving companies</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Mike Johnson', company: 'Summit Moving Co.', quote: 'We went from 10 online bookings a month to over 60. The widget pays for itself in the first week.' },
              { name: 'Sarah Chen', company: 'Golden State Movers', quote: 'The onboarding was incredible. I had our widget live on our site in under 10 minutes. No developer needed.' },
              { name: 'David Park', company: 'Metro Relocations', quote: 'The analytics show us exactly where customers drop off. We optimized our pricing and doubled our conversion rate.' },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5 text-yellow-500 fill-yellow-500" />)}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to book moves<br />while you sleep?</h2>
              <p className="text-blue-100 mb-8 text-lg max-w-xl mx-auto">Join hundreds of moving companies using BookedMove to grow their business.</p>
              <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs">B</div>
            <span className="font-semibold text-gray-900">BookedMove</span>
          </div>
          <p className="text-sm text-gray-500">© 2025 BookedMove. Built by <a href="https://movingletters.ai" className="text-blue-600 hover:underline">MovingLetters.ai</a></p>
        </div>
      </footer>
    </div>
  );
}
