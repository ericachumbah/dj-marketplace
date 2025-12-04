"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import FileUpload from "@/components/common/FileUpload";

interface DJFormData {
  bio: string;
  genres: string[];
  hourlyRate: string;
  experience: string;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  twitter: string;
  website: string;
  phone: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  radius: string;
}

interface DJProfile extends DJFormData {
  id: string;
  userId: string;
  profileImage?: string;
  credentials: string[];
  status: string;
}

const genreOptions = [
  "House",
  "Techno",
  "Hip-Hop",
  "Pop",
  "Electronic",
  "Deep House",
  "Trance",
  "Drum & Bass",
  "Reggae",
  "Latin",
  "R&B",
  "Funk",
  "Afrobeats",
  "Makossa",
  "Ndombolo",
];

export default function DJRegistrationForm() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const locale = pathname.split("/")[1] || "en";
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    profile: "",
    credentials: [] as string[],
  });

  const [formData, setFormData] = useState<DJFormData>({
    bio: "",
    genres: [],
    hourlyRate: "",
    experience: "",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
    twitter: "",
    website: "",
    phone: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: "",
    longitude: "",
    radius: "",
  });

  // Load existing profile on component mount
  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/dj/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          // Profile exists - load it for editing
          setIsEditMode(true);
          setFormData({
            bio: data.bio || "",
            genres: data.genres || [],
            hourlyRate: data.hourlyRate?.toString() || "",
            experience: data.experience?.toString() || "",
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            youtube: data.youtube || "",
            tiktok: data.tiktok || "",
            twitter: data.twitter || "",
            website: data.website || "",
            phone: data.phone || "",
            city: data.city || "",
            state: data.state || "",
            zipCode: data.zipCode || "",
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
            radius: data.radius?.toString() || "",
          });
          if (data.profileImage) {
            setUploadedFiles((prev) => ({ ...prev, profile: data.profileImage }));
          }
          if (data.credentials && Array.isArray(data.credentials)) {
            setUploadedFiles((prev) => ({ ...prev, credentials: data.credentials }));
          }
        }
      })
      .catch((err) => console.error("Error loading profile:", err))
      .finally(() => setPageLoading(false));
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleFileUpload = (type: "profile" | "credential") => {
    return async (url: string) => {
      if (type === "profile") {
        setUploadedFiles((prev) => ({ ...prev, profile: url }));
      } else {
        setUploadedFiles((prev) => ({
          ...prev,
          credentials: [...prev.credentials, url],
        }));
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!formData.hourlyRate) {
      setError("Hourly rate is required");
      setLoading(false);
      return;
    }
    if (!formData.experience) {
      setError("Years of experience is required");
      setLoading(false);
      return;
    }
    if (formData.genres.length === 0) {
      setError("Please select at least one genre");
      setLoading(false);
      return;
    }

    try {
      const method = isEditMode ? "PUT" : "POST";
      const payload = {
        bio: formData.bio,
        genres: formData.genres || [],
        hourlyRate: formData.hourlyRate,
        experience: formData.experience,
        instagram: formData.instagram,
        facebook: formData.facebook,
        youtube: formData.youtube,
        tiktok: formData.tiktok,
        twitter: formData.twitter,
        website: formData.website,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        latitude: formData.latitude || "",
        longitude: formData.longitude || "",
        radius: formData.radius || "",
        profileImage: uploadedFiles.profile,
        credentials: uploadedFiles.credentials || [],
      };

      console.log("Sending payload:", payload);

      const response = await fetch("/api/dj/profile", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("API Error:", data);
        throw new Error(data.error || `Failed to ${isEditMode ? "update" : "create"} profile`);
      }

      router.push(`/${locale}/dj/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Become a DJ</h1>
          <p className="text-gray-600 mb-8">Create an account to get started with your DJ profile</p>
          
          <div className="space-y-4">
            <Link
              href={`/${locale}/dj/signup`}
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Create DJ Account
            </Link>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Link
              href={`/${locale}/auth/signin`}
              className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href={`/${locale}/auth/signin`} className="text-blue-600 hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-8">
          {pageLoading ? "Loading..." : isEditMode ? "Edit DJ Profile" : "DJ Registration"}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {pageLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            {uploadedFiles.profile && (
              <div className="mb-4 flex justify-center">
                <img 
                  src={uploadedFiles.profile} 
                  alt="Profile preview" 
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
                />
              </div>
            )}
            <FileUpload
              endpoint="/api/dj/upload"
              fileType="profile"
              onUpload={handleFileUpload("profile")}
              accept="image/*"
            />
            {uploadedFiles.profile && (
              <p className="mt-2 text-sm text-green-600">✓ Profile image {isEditMode ? "updated" : "uploaded"}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genres
            </label>
            <div className="grid grid-cols-2 gap-2">
              {genreOptions.map((genre) => (
                <label key={genre} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Hourly Rate & Experience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Social Media */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Social Media Accounts
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="instagram" className="block text-xs font-medium text-gray-600 mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="facebook" className="block text-xs font-medium text-gray-600 mb-2">
                  Facebook
                </label>
                <input
                  type="text"
                  id="facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="youtube" className="block text-xs font-medium text-gray-600 mb-2">
                  YouTube
                </label>
                <input
                  type="text"
                  id="youtube"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="tiktok" className="block text-xs font-medium text-gray-600 mb-2">
                  TikTok
                </label>
                <input
                  type="text"
                  id="tiktok"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="twitter" className="block text-xs font-medium text-gray-600 mb-2">
                  Twitter (X)
                </label>
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-xs font-medium text-gray-600 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Credentials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DJ Credentials & Certifications (Optional)
            </label>
            <FileUpload
              endpoint="/api/dj/upload"
              fileType="credential"
              onUpload={handleFileUpload("credential")}
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
            {uploadedFiles.credentials.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploadedFiles.credentials.map((cred, idx) => (
                  <p key={idx} className="text-sm text-green-600">
                    Credential {idx + 1} uploaded
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? isEditMode 
                ? "Updating Profile..." 
                : "Creating Profile..." 
              : isEditMode 
              ? "Update DJ Profile" 
              : "Create DJ Profile"}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}
