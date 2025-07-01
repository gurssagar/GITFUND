"use client";
import React, { useEffect, useState, Suspense } from "react"; // Ensure Suspense is imported
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSession, SessionContextValue } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Session } from "next-auth"; // Import Session type

// Define a custom session type that includes potential user ID fields and username
interface CustomUser {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
}

interface CustomSession extends Session {
  user?: CustomUser;
}

interface UserProfile {
  id: string;
  fullName: string;
  image_url: string;
  metaMask: string;
  email: string;
  Location: string;
  Bio: string;
  Telegram: string;
  Twitter: string;
  Linkedin: string;
  rating: number;
  skills: string[];
}

interface SignupApiResponse {
  success: boolean;
  error?: string;
  message?: string; // For success messages
  user?: any; // Or a more specific user type if available from API
}

// This component will contain the actual content and logic of your settings page
function SettingsContent() {
  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: SessionContextValue["status"];
  };
  const { isShrunk } = useSidebarContext();
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    fullName: "",
    image_url: "",
    metaMask: "",
    email: "",
    Location: "",
    Bio: "",
    Telegram: "",
    Twitter: "",
    Linkedin: "",
    rating: 0,
    skills: [],
  });
  const [initialProfile, setInitialProfile] = useState<UserProfile>({
    id: "",
    fullName: "",
    image_url: "",
    metaMask: "",
    email: "",
    Location: "",
    Bio: "",
    Telegram: "",
    Twitter: "",
    Linkedin: "",
    rating: 0,
    skills: [],
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // useEffect(() => {
  //   if (session?.user) {
  //     const userData: UserProfile = {
  //       name: session.user.name || "",
  //       // Assuming bio, location, etc., might come from a different source or are user-input only
  //       // If they are part of the session or fetched user data, initialize them here.
  //       bio: (session.user as any)?.bio || "", // Example if bio was on user object
  //       location: (session.user as any)?.location || "", // Example
  //       telegram: (session.user as any)?.telegram || "", // Example
  //       twitter: (session.user as any)?.twitter || "", // Example
  //       linkedin: (session.user as any)?.linkedin || "", // Example
  //     };
  //     setProfile(userData);
  //     setInitialProfile(userData);
  //   }
  // }, [session]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `/api/publicProfile?username=${session?.user?.username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          const userData = data.user[0];
          console.log(userData, "user data");

          setProfile({
            id: userData.id,
            fullName: userData.fullName,
            image_url: userData.image_url,
            metaMask: userData.metaMask,
            email: userData.email,
            Location: userData.Location,
            Bio: userData.Bio,
            Telegram: userData.Telegram,
            Twitter: userData.Twitter,
            Linkedin: userData.Linkedin,
            rating: userData.rating,
            skills: userData.skills,
          });

          console.log("profile", profile);
        } else {
          console.error("Failed to fetch users:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateStatus(null);

    try {
      // Check if user ID exists and log session data for debugging
      console.log("Session data:", session);

      // Get user ID from session data - try different possible locations
      const userId = session?.user?.username;
      const email = session?.user?.email; // Fallback to email if no ID is found

      if (!userId) {
        throw new Error("User ID not found in session data");
      }

      // Map profile fields to the expected API fields
      const updateData = {
        id: userId, // Use the extracted user ID
        fullName: profile.fullName,
        email: email,
        bio: profile.Bio,
        location: profile.Location,
        twitter: profile.Twitter,
        linkedin: profile.Linkedin,
        telegram: profile.Telegram, // Added telegram which was missing
        // metaMask can be added here if needed
      };

      console.log("Update data being sent:", updateData);

      const response = await fetch("/api/publicProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result: SignupApiResponse = await response.json();

      if (result.success) {
        setInitialProfile(profile);
        setUpdateStatus({
          success: true,
          message: result.message || "Profile updated successfully!",
        });
      } else {
        setUpdateStatus({
          success: false,
          message: result.error || "Failed to update profile",
        });
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      setUpdateStatus({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while updating your profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelChanges = () => {
    setProfile(initialProfile);
    setUpdateStatus(null);
  };

  const hasChanges: boolean =
    JSON.stringify(profile) !== JSON.stringify(initialProfile);

  if (status === "loading") {
    return (
      <div>
        <Sidebar />
        <div
          className={` ${
            isShrunk
              ? "ml-[4rem] w-[calc(100%_-_4rem)]"
              : "ml-[16rem] w-[calc(100%_-_16rem)]"
          }`}
        >
          <Topbar />
          <div className="mt-[80px] px-[2vw] flex justify-center items-center h-[calc(100vh-80px)]">
            <p>Loading settings content...</p>{" "}
            {/* More specific loading message */}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div>
        <Sidebar />
        <div
          className={` ${
            isShrunk
              ? "ml-[4rem] w-[calc(100%_-_4rem)]"
              : "ml-[16rem] w-[calc(100%_-_16rem)]"
          }`}
        >
          <Topbar />
          <div className="mt-[80px] px-[2vw] flex justify-center items-center h-[calc(100vh-80px)]">
            <p>Please log in to view settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    // The Suspense boundary was here, but it's more effective at the page root.
    // The content itself is now wrapped by the Page default export's Suspense.
    <div>
      <Sidebar />
      <div
        className={` ${
          isShrunk
            ? "ml-[4rem] w-[calc(100%_-_4rem)]"
            : "ml-[16rem] w-[calc(100%_-_16rem)]"
        }`}
      >
        <Topbar />
        <div className="mt-[80px] px-[2vw] py-8">
          <h1 className="text-3xl font-semibold mb-8">Settings</h1>

          {/* Profile Section */}
          <section className="mb-10 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <h2 className="text-2xl font-medium mb-6">Profile Information</h2>

            {updateStatus && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  updateStatus.success
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {updateStatus.message}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    width={150}
                    height={150}
                    className="rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                    alt={
                      session.user.name
                        ? `${session.user.name}'s profile picture`
                        : "User profile picture"
                    }
                  />
                )}
                {/* <Button variant="outline" className="mt-4 w-full">Change Picture</Button> */}
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="flex-grow space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      className="border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-800 bg-gray-50 py-2 text-[16px] rounded-md w-full text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      value={
                        session.user?.username ||
                        session.user?.email?.split("@")[0] ||
                        "N/A"
                      }
                      readOnly
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Your full name"
                      className="border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-900 bg-white py-2 text-[16px] rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                      value={profile.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-800 bg-gray-50 py-2 text-[16px] rounded-md w-full text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      value={session.user.email || "N/A"}
                      readOnly
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Location
                    </label>
                    <input
                      id="Location"
                      name="Location"
                      type="text"
                      placeholder="City, Country"
                      className="border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-900 bg-white py-2 text-[16px] rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                      value={profile.Location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="Bio"
                    name="Bio"
                    rows={3}
                    placeholder="Tell us a bit about yourself"
                    className="border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-900 bg-white py-2 text-[16px] rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                    value={profile.Bio}
                    onChange={handleInputChange}
                  />
                </div>

                <h3 className="text-lg font-medium mb-3 mt-6">
                  Social Profiles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="telegram"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Telegram
                    </label>
                    <input
                      id="Telegram"
                      name="Telegram"
                      type="text"
                      placeholder="@username"
                      className="border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-900 bg-white py-2 text-[16px] rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                      value={profile.Telegram}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="twitter"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Twitter
                    </label>
                    <input
                      id="Twitter"
                      name="Twitter"
                      type="text"
                      placeholder="@username"
                      className="border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-900 bg-white py-2 text-[16px] rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                      value={profile.Twitter}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="linkedin"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      LinkedIn
                    </label>
                    <input
                      id="Linkedin"
                      name="Linkedin"
                      type="text"
                      placeholder="linkedin.com/in/username"
                      className="border border-gray-300 dark:border-gray-600 px-3 dark:bg-gray-900 bg-white py-2 text-[16px] rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                      value={profile.Linkedin}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {hasChanges && (
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelChanges}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="mb-10 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <h2 className="text-2xl font-medium mb-6">Appearance</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Theme preferences (Light/Dark/System) can be adjusted using the
              theme toggle button in the top navigation bar.
            </p>
          </section>

          {/* Account Section */}
          <section className="p-6 border border-red-300 dark:border-red-700 rounded-lg shadow-sm bg-red-50 dark:bg-red-900/20">
            <h2 className="text-2xl font-medium mb-6 text-red-700 dark:text-red-400">
              Account Management
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Manage your account settings and data.
              </p>
              <Button
                variant="destructive"
                onClick={() =>
                  alert(
                    "Delete account functionality not yet implemented. This would typically require confirmation and an API call."
                  )
                }
              >
                Delete Account
              </Button>
              <p className="text-sm text-red-600 dark:text-red-500">
                Warning: Deleting your account is irreversible and will remove
                all your data.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Default export for the page, wrapping the content component with Suspense
export default function Page() {
  return (
    <Suspense
      fallback={
        // You can provide a more sophisticated skeleton loader here if desired
        <div>
          {/* Minimal layout during page suspense */}
          {/* <Sidebar />  Consider if Sidebar/Topbar should be part of this root fallback */}
          {/* <div className='ml-[16em]'> */}
          {/* <Topbar /> */}
          <div className="mt-[80px] px-[2vw] flex justify-center items-center h-[calc(100vh-80px)]">
            <p>Loading settings page...</p>
          </div>
          {/* </div> */}
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
