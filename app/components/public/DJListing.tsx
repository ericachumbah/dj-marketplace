"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Euro, Music, Search } from "lucide-react";

interface DJ {
  id: string;
  bio: string;
  genres: string[];
  hourlyRate: number;
  experience: number;
  rating: number;
  totalReviews: number;
  profileImage: string | null;
  city: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
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

export default function DJListing() {
  const [djs, setDjs] = useState<DJ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    genre: "",
    city: "",
    minRate: "",
    maxRate: "",
  });

  const fetchDJs = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.search && { search: filters.search }),
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.city && { city: filters.city }),
        ...(filters.minRate && { minRate: filters.minRate }),
        ...(filters.maxRate && { maxRate: filters.maxRate }),
      });

      const response = await fetch(`/api/dj/listing?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch DJs");
      }

      setDjs(data.djs || []);
      setPagination(data.pagination);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error fetching DJs";
      setError(errorMsg);
      console.error("Error fetching DJs:", error);
      setDjs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDJs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchDJs(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    fetchDJs(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Find Your DJ</h1>

        {/* Mobile: Simple Search Bar Only */}
        <div className="md:hidden mb-6 flex gap-2">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search DJ..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop: Full Filters */}
        <div className="hidden md:block bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="DJ name or bio"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Genres</option>
                {genreOptions.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rate (€)
              </label>
              <input
                type="number"
                name="minRate"
                value={filters.minRate}
                onChange={handleFilterChange}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Rate (€)
              </label>
              <input
                type="number"
                name="maxRate"
                value={filters.maxRate}
                onChange={handleFilterChange}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* DJ Cards */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="text-center py-12">
            <p>Loading DJs...</p>
          </div>
        ) : djs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No DJs found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {djs.map((dj) => (
                <Link key={dj.id} href={`/dj/${dj.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    {/* Profile Image */}
                    <div className="relative h-48 bg-gray-200">
                      {dj.profileImage ? (
                        <Image
                          src={dj.profileImage}
                          alt={dj.user.name || "DJ"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <Music className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-2">
                        {dj.user.name || "DJ"}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(dj.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          ({dj.totalReviews})
                        </span>
                      </div>

                      {/* Rate */}
                      <div className="flex items-center text-gray-700 mb-2">
                        <Euro className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          €{dj.hourlyRate}/hour
                        </span>
                      </div>

                      {/* Location */}
                      {dj.city && (
                        <div className="flex items-center text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{dj.city}</span>
                        </div>
                      )}

                      {/* Experience */}
                      <p className="text-sm text-gray-600 mb-3">
                        {dj.experience} years experience
                      </p>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {dj.genres.slice(0, 3).map((genre) => (
                          <span
                            key={genre}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {genre}
                          </span>
                        ))}
                        {dj.genres.length > 3 && (
                          <span className="inline-block text-xs text-gray-600 px-2 py-1">
                            +{dj.genres.length - 3}
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                        View Profile
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mb-8">
              {pagination.page > 1 && (
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}

              {[...Array(pagination.pages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === pagination.page) {
                  return (
                    <button
                      key={pageNum}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (
                  pageNum === 1 ||
                  pageNum === pagination.pages ||
                  Math.abs(pageNum - pagination.page) <= 1
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}

              {pagination.page < pagination.pages && (
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
