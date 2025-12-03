"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Music, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface DJProfile {
  id: string;
  bio?: string;
  genres: string[];
  hourlyRate: number;
  experience: number;
  profileImage?: string;
  status: string;
  totalBookings: number;
  rating: number;
  totalReviews: number;
}

export default function DJDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [djProfile, setDjProfile] = useState<DJProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    // Fetch DJ profile
    fetch("/api/dj/profile/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setDjProfile(data);
        }
      })
      .catch((err) => console.error("Failed to fetch profile:", err))
      .finally(() => setLoading(false));
  }, [session, router]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DJ Dashboard</h1>
              <p className="text-gray-600">Welcome, {session?.user?.name || session?.user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center">
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        ) : !djProfile ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Complete Your DJ Profile
            </h2>
            <p className="text-gray-600 mb-6">
              To start accepting bookings, you need to complete your DJ profile.
            </p>
            <Link
              href="/dj/register"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Complete Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
              {djProfile.profileImage && (
                <Image
                  src={djProfile.profileImage}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
              )}
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="text-gray-900">{djProfile.bio || "No bio added"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Genres</dt>
                  <dd className="flex flex-wrap gap-2">
                    {djProfile.genres?.map((genre: string) => (
                      <span key={genre} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {genre}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
                  <dd className="text-gray-900">€{djProfile.hourlyRate}/hr</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Experience</dt>
                  <dd className="text-gray-900">{djProfile.experience} years</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      djProfile.status === "VERIFIED" ? "bg-green-100 text-green-800" :
                      djProfile.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {djProfile.status}
                    </span>
                  </dd>
                </div>
              </dl>
              <Link
                href="/dj/register"
                className="mt-6 block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
              >
                Edit Profile
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm text-gray-500">Total Bookings</dt>
                    <dd className="text-3xl font-bold text-gray-900">{djProfile.totalBookings || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Rating</dt>
                    <dd className="text-3xl font-bold text-gray-900">
                      {djProfile.rating?.toFixed(1) || "N/A"} ⭐
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Reviews</dt>
                    <dd className="text-3xl font-bold text-gray-900">{djProfile.totalReviews || 0}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition text-left flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    View Bookings
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition text-left flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Portfolio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
