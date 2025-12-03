"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface DJForVerification {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  bio: string | null;
  genres: string[];
  hourlyRate: number;
  experience: number;
  credentials: string[];
  status: string;
  createdAt: string;
  _count: {
    bookings: number;
    reviews: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [djs, setDjs] = useState<DJForVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [selectedDJ, setSelectedDJ] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDJs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/dj?status=${selectedStatus}&page=${page}&limit=10`
      );
      const data = await response.json();
      setDjs(data.djs);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching DJs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only allow access if authenticated and admin
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }
    if ((session.user as any).role !== "ADMIN") {
      router.push("/auth/signin?error=forbidden");
      return;
    }
    fetchDJs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, session, status, router]);

  const handleVerifyDJ = async (djId: string, status: "VERIFIED" | "REJECTED") => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/dj/${djId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          verificationNotes,
        }),
      });

      if (response.ok) {
        setSelectedDJ(null);
        setVerificationNotes("");
        fetchDJs(pagination.page);
      }
    } catch (error) {
      console.error("Error updating DJ status:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-8">
          {["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* DJ Table */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : djs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No DJs found in this status.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Genres
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {djs.map((dj) => (
                    <tr key={dj.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {dj.user.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {dj.user.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {dj.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {genre}
                            </span>
                          ))}
                          {dj.genres.length > 2 && (
                            <span className="text-xs text-gray-600">
                              +{dj.genres.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        €{dj.hourlyRate}/hr
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(dj.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {selectedDJ === dj.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={verificationNotes}
                              onChange={(e) =>
                                setVerificationNotes(e.target.value)
                              }
                              placeholder="Add notes..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleVerifyDJ(dj.id, "VERIFIED")
                                }
                                disabled={submitting}
                                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleVerifyDJ(dj.id, "REJECTED")
                                }
                                disabled={submitting}
                                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDJ(null);
                                  setVerificationNotes("");
                                }}
                                className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedDJ(dj.id)}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              {pagination.page > 1 && (
                <button
                  onClick={() => fetchDJs(pagination.page - 1)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}

              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = pagination.page - 2 + i;
                if (pageNum < 1 || pageNum > pagination.pages) {
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchDJs(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      pageNum === pagination.page
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {pagination.page < pagination.pages && (
                <button
                  onClick={() => fetchDJs(pagination.page + 1)}
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
