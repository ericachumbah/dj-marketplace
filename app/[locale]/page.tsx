import Link from "next/link";
import Image from "next/image";
import { Music, Users, CheckCircle, Zap } from "lucide-react";
import { getTranslations, type Locale } from "@/lib/i18n";

export default async function Home({ 
  params 
}: { 
  params: Promise<{ locale: Locale }> 
}) {
  const { locale } = await params;
  const t = getTranslations(locale);

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-600 to-blue-900 text-white">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=600&fit=crop"
            alt="DJ performing at event"
            fill
            className="object-cover opacity-20"
            priority
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-b from-blue-600/80 via-blue-700/85 to-blue-900/90"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Music className="w-20 h-20 mx-auto mb-6 drop-shadow-lg" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 drop-shadow-md">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href={`/${locale}/dj/listing`}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg"
            >
              {t.hero.cta}
            </Link>
            <Link
              href={`/${locale}/auth/signin`}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition shadow-lg"
            >
              {t.nav.signIn}
            </Link>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute bottom-10 left-10 opacity-10">
          <Music className="w-40 h-40 text-white" />
        </div>
        <div className="absolute top-20 right-10 opacity-10">
          <Music className="w-32 h-32 text-white" />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose Mix Factory?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Verified DJs</h3>
              <p className="text-gray-600">
                All DJs are verified and have professional credentials
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Secure Bookings</h3>
              <p className="text-gray-600">
                Safe and secure booking process with payment protection
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Quick Booking</h3>
              <p className="text-gray-600">
                Book your favorite DJ in just a few clicks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Are you a DJ?</h2>
          <p className="text-lg mb-6 text-blue-100">
            Join our platform and reach more customers
          </p>
          <Link
            href={`/${locale}/auth/signin`}
            className="bg-white text-blue-700 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition inline-block"
          >
            {t.dj.register}
          </Link>
        </div>
      </div>
    </div>
  );
}
