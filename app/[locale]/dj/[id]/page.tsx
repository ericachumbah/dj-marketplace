"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Music, ArrowLeft, Mail, Phone, Globe, Instagram, Twitter } from "lucide-react";
import BookingModal from "@/app/components/BookingModal";

interface DJProfile {
  id: string;
  bio?: string;
  genres: string[];
  hourlyRate: number;
  experience: number;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  profileImage?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  status: string;
  verifiedAt?: string;
  user: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
}

export default function DJProfilePage() {
  const params = useParams();
  const djId = params.id as string;
  const locale = (params.locale as string) || "en";
  const [dj, setDj] = useState<DJProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!djId) return;

    const fetchDJ = async () => {
      try {
        const response = await fetch(`/api/dj/profile/${djId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch DJ profile");
        }
        const data = await response.json();
        setDj(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading profile");
        console.error("Error fetching DJ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDJ();
  }, [djId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading DJ profile...</p>
      </div>
    );
  }

  if (error || !dj) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/dj/listing" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to DJs
          </Link>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 text-lg">{error || "DJ profile not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/${locale}/dj/listing`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to DJs
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-800 p-4 sm:p-8 text-white">
            <div className="flex flex-col gap-6 items-center sm:items-start md:flex-row md:items-end">
              {/* Profile Image */}
              <div className="shrink-0 mx-auto sm:mx-0">
                {dj.profileImage ? (
                  <Image
                    src={dj.profileImage}
                    alt={dj.user.name || "DJ"}
                    width={160}
                    height={160}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white">
                    <Music className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                  </div>
                )}
              </div>

              {/* DJ Info */}
              <div className="flex-1 text-center sm:text-left w-full">
                <h1 className="text-2xl sm:text-4xl font-bold mb-2">{dj.user.name || "DJ"}</h1>
                
                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    dj.status === "VERIFIED" 
                      ? "bg-green-100 text-green-800" 
                      : dj.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {dj.status}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(dj.rating)
                            ? "text-yellow-300 fill-yellow-300"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-lg">
                    {dj.rating.toFixed(1)} ({dj.totalReviews} reviews)
                  </span>
                </div>

                {/* Quick Info */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-center sm:justify-start">
                  <div>
                    <div className="text-sm opacity-90">Hourly Rate</div>
                    <div className="text-2xl font-bold">€{dj.hourlyRate}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Experience</div>
                    <div className="text-2xl font-bold">{dj.experience} years</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Bookings</div>
                    <div className="text-2xl font-bold">{dj.totalBookings}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8">
            {/* Bio */}
            {dj.bio && (
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">About</h2>
                <p className="text-gray-700 leading-relaxed">{dj.bio}</p>
              </div>
            )}

            {/* Genres */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {dj.genres.map((genre) => (
                  <span
                    key={genre}
                    className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            {(dj.city || dj.state || dj.zipCode) && (
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Location</h2>
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                  <div className="text-gray-700">
                    {[dj.city, dj.state, dj.zipCode].filter(Boolean).join(", ")}
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Social */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Contact & Social</h2>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {dj.user.email && (
                  <a
                    href={`mailto:${dj.user.email}`}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm sm:text-base"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{dj.user.email}</span>
                    <span className="sm:hidden">Email</span>
                  </a>
                )}
                {dj.phone && (
                  <a
                    href={`tel:${dj.phone}`}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm sm:text-base"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{dj.phone}</span>
                    <span className="sm:hidden">Phone</span>
                  </a>
                )}
                {dj.website && (
                  <a
                    href={dj.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Website</span>
                  </a>
                )}
                {dj.instagram && (
                  <a
                    href={`https://instagram.com/${dj.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm sm:text-base"
                  >
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{dj.instagram}</span>
                    <span className="sm:hidden">IG</span>
                  </a>
                )}
                {dj.twitter && (
                  <a
                    href={`https://twitter.com/${dj.twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm sm:text-base"
                  >
                    <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{dj.twitter}</span>
                    <span className="sm:hidden">X</span>
                  </a>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              >
                Book Now
              </button>
              <button
                onClick={() => {
                  if (dj?.user?.email) {
                    window.location.href = `mailto:${dj.user.email}`;
                  }
                }}
                className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {dj && (
          <BookingModal
            isOpen={isBookingModalOpen}
            djId={dj.id}
            djName={dj.user?.name || "DJ"}
            hourlyRate={dj.hourlyRate}
            onClose={() => setIsBookingModalOpen(false)}
            onSuccess={() => {
              // Could refresh DJ data or show confirmation here
            }}
          />
        )}
      </div>
    </div>
  );
}
