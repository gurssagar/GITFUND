'use client'
import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useSession } from 'next-auth/react';
import { Octokit } from 'octokit';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from "ai";
import Topbar from "@/assets/components/topbar";
import Sidebar from "@/assets/components/sidebar";
import { useSidebarContext } from "@/assets/components/SidebarContext";

// Define a type for your repository data for better type safety
interface Repo {
  id: number;
  name: string;
  // Add other relevant properties from the GitHub API response
}

export default function CreateProjects() {
    const { data: sessionData } = useSession(); // Renamed to avoid conflict with repoData's 'data'
    const [repoData, setRepoData] = useState<Repo[]>([]); // Use the Repo interface
    const [page, setPage] = useState(1);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [selectedRepo, setSelectedRepo] = useState<string>(''); // Initialize with empty string
    const [aiReply, setAiReply] = useState<string | undefined>();
    const [repoValue, setRepoValue] = useState<string>(''); // Initialize with empty string
    const [collabs, setCollabs] = useState<any[]>([]); // Initialize as an empty array
    const { isShrunk } = useSidebarContext();
    const [languages, setLanguages] = useState<any>([]);
    const [stars, setStars] = useState<number>(0);
    const [forks, setForks] = useState<number>(0);
    // Initialize Octokit once or when the access token changes
    const octokit = useMemo(() => {
        if ((sessionData as any)?.accessToken) {
            return new Octokit({ auth: (sessionData as any)?.accessToken });
        }
        return null;
    }, [sessionData]);

    // Fetch repositories when the component mounts and octokit is available
    useEffect(() => {
        const fetchRepos = async () => {
            if (!octokit) return; // Don't fetch if octokit is not initialized
            try {
                const response = await octokit.request("GET /user/repos", {
                    headers: {
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                });
                setRepoData(response.data as Repo[]); 
                console.log(response.data, "repos");
            } catch (error) {
                console.error("Error fetching repositories:", error);
                setAlertMessage("Failed to fetch repositories.");
            }
        };

        fetchRepos();
    }, [octokit]); // Dependency: octokit

    // Fetch README when selectedRepo changes and octokit/session is available
    useEffect(() => {
        const fetchReadme = async () => {
            if (!selectedRepo || !octokit || !(sessionData?.user as any)?.username) {
                // Clear repoValue if conditions are not met, or handle as needed
                if (repoValue) setRepoValue(''); 
                return;
            }
            try {
                const response = await octokit.request('GET /repos/{owner}/{repo}/readme', {
                    owner: (sessionData?.user as any).username,
                    repo: selectedRepo,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });
                // Ensure content exists and is a string before decoding
                if (response.data && typeof response.data.content === 'string') {
                    const value = atob(response.data.content);
                    setRepoValue(value);
                    console.log("README content fetched for", selectedRepo);
                } else {
                    console.warn("README content is missing or not a string for", selectedRepo);
                    setRepoValue(''); // Set to empty or handle as an error
                    setAlertMessage(`README not found or is empty for ${selectedRepo}.`);
                }
            } catch (error) {
                console.error("Error fetching README:", error);
                setRepoValue(''); // Clear on error
                setAlertMessage(`Failed to fetch README for ${selectedRepo}.`);
            }
        };

        fetchReadme();
    }, [selectedRepo, octokit, sessionData, repoValue]); // Added repoValue to dependencies to avoid stale closure issues if we clear it

    // Generate AI reply when repoValue changes
    useEffect(() => {
        async function generateAiSummary() {
            if (!repoValue) { // Only run if repoValue has content
                // Optionally clear aiReply if repoValue is empty
                // if (aiReply) setAiReply(undefined); 
                return;
            }

            console.log("Generating AI summary for repo value:", repoValue.substring(0,100) + "...");
            try {
              const response = await fetch('/api/ai-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoValue }),
              });
              const data = await response.json();
              setAiReply(data.text || 'Failed to generate AI summary.');
              console.log('AI summary generated.');
            } catch (error) {
              console.error('Error generating AI reply:', error);
              setAiReply('Failed to generate AI summary. Please try again.');
            }
        }

        generateAiSummary();
    }, [repoValue]); // Dependency: repoValue

    useEffect(() => {
        async function fetchRepoDetails() {
          let fetchedCollabs: any[] = [];
          try {
            const collabsResponse = await octokit?.request('GET /repos/{owner}/{repo}/contributors', {
                owner: (sessionData?.user as any).username,
                repo: selectedRepo,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            const repoForks=await octokit?.request('GET /repos/{owner}/{repo}/forks', {
                owner: (sessionData?.user as any).username,
                repo: selectedRepo,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            const repoForksArray = repoForks?.data;
            console.log(repoForksArray?.length, "forks fetched");
            setForks(repoForksArray.length);
            const repoStars=await octokit?.request('GET /repos/{owner}/{repo}/stargazers', {
                owner: (sessionData?.user as any).username,
                repo: selectedRepo,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            const repoStarsArray = repoStars?.data;
            console.log(repoStarsArray?.length, "stars fetched");
            setStars(repoStarsArray.length);
            const repoLanguages=await octokit?.request('GET /repos/{owner}/{repo}/languages', {
                owner: (sessionData?.user as any).username,
                repo: selectedRepo,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            const repoLanguagesArray = repoLanguages?.data;
            setLanguages(repoLanguagesArray);
            fetchedCollabs = collabsResponse.data;
            setCollabs(fetchedCollabs); // Update state
            console.log(fetchedCollabs, "collaborators fetched");
        } catch (collabError) {
            console.error("Error fetching collaborators:", collabError);
            // Decide if this is a critical error or if you can proceed without collabs
            setAlertMessage("Warning: Could not fetch project collaborators.");
        }
        }
        fetchRepoDetails();
    },[ repoValue]);

    const addProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!octokit || !(sessionData?.user as any)?.username || !selectedRepo) {
            setAlertMessage("User session, Octokit, or selected repository is not available.");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const fileInput = formData.get("projectImage") as File;

        if (!fileInput || fileInput.size === 0) {
            setAlertMessage("Project image is required.");
            return;
        }

        try {
            const signedUrlResponse = await fetch("/api/s3", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileName: fileInput.name,
                    fileType: fileInput.type,
                }),
            });

            if (!signedUrlResponse.ok) {
                throw new Error(`Failed to get signed URL: ${signedUrlResponse.statusText}`);
            }
            const { signedUrl } = await signedUrlResponse.json();

            await fetch(signedUrl, {
                method: "PUT",
                body: fileInput,
                headers: {
                    "Content-Type": fileInput.type,
                },
            });
            
            const imageUrl = signedUrl.split("?")[0];
            
            
            

            await fetch("/api/add-projects", { // Assuming this is your endpoint to add project details
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contributors: collabs, 
                    aiDescription: aiReply || "AI description not available.",
                    projectOwner: (sessionData?.user as any).username,
                    projectName: formData.get("projectName") as string,
                    shortdes: formData.get("shortDescription") as string,
                    longdis: formData.get("longDescription") as string,
                    image_url: imageUrl,
                    project_repository: selectedRepo,         
                    email: sessionData?.user?.email,
                    languages:languages,
                    stars:stars,
                    forks:forks
                }),
            });

            console.log(collabs, "collabs");
            console.log(aiReply, "aiReply");
            console.log(selectedRepo, "selectedRepo");
            console.log(repoValue, "repoValue");
            console.log(sessionData?.user?.email, "email");
            console.log(languages, "languages");
            console.log(stars, "stars");
            console.log(forks, "forks");
            

            console.log("Project creation initiated successfully!");
            setAlertMessage("Project submitted successfully!");
            // Optionally reset form or navigate user
            setPage(1); // Or navigate to a success page
            setSelectedRepo('');
            setRepoValue('');
            setAiReply(undefined);
            // e.currentTarget.reset(); // Reset form fields

        } catch (error) {
            console.error("Error in project creation:", error);
            if (error instanceof Error) {
                setAlertMessage(`Error: ${error.message}`);
            } else {
                setAlertMessage("An unexpected error occurred during project creation.");
            }
        }
    };


    return(
        <>
        <div className="flex">
          <Sidebar />
          <div
            className={`transition-all duration-300 ease-in-out ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
          >
            <Topbar />
            <div className='mt-17'> {/* Assuming mt-17 is a valid Tailwind class or custom utility */}
            <form onSubmit={addProject} className="p-10 mx-auto space-y-4">
              {
                page===1?
                <>
                  <div>
                  
                    <div className="text-3xl mb-6">Project Information</div>
                    <div className="space-y-2">
                      <label className="text-[14px]" htmlFor="projectName">
                        Project name
                      </label>
                      <input
                        id="projectName"
                        name="projectName"
                        type="text"
                        className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                        required // Added required for basic validation
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px]" htmlFor="shortDescription">
                        Short description
                      </label>
                      <input
                        id="shortDescription"
                        name="shortDescription"
                        type="text"
                        className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px]" htmlFor="longDescription">
                        Long Description
                      </label>
                      <textarea
                        id="longDescription"
                        name="longDescription"
                        className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                        rows={4} // Added rows for better textarea appearance
                        required
                      />
                    </div>
                    <div className="space-y-2 flex gap-4">
                      <div className="w-full">
                        <label className="text-[14px]" htmlFor="projectImage">
                          Project image
                        </label>
                        <input
                          id="projectImage"
                          name="projectImage"
                          type="file"
                          accept="image/*" // Added accept attribute for better UX
                          className="w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                          required
                        />
                      </div>
                      
                    </div>
                    <div className="space-y-2  w-1/3">
                    <label className="text-[14px]" htmlFor="projectRepo">
                      Project Repository
                    </label>
                    <select
                      id="projectRepo"
                      name="projectRepo"
                      className="dark:bg-[#0a0a0a] w-full p-2 border-2 dark:border-custom-dark-gray rounded-md"
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      value={selectedRepo} // Value is controlled by selectedRepo state
                      required
                    >
                      <option value="">Select a repository</option>
                      {repoData?.map((repo: Repo) => ( // Use Repo type
                        <option value={repo.name} key={repo.id}>
                          {repo.name}
                        </option>
                      ))}
                    </select>
                  </div>
                    
                    {/* Display AI Summary (Read-only) */}
                    {aiReply && selectedRepo && (
                        <div className="mt-6 p-4 border-2 dark:border-custom-dark-gray rounded-md">
                            <h3 className="text-lg font-semibold mb-2">AI Generated Project Summary:</h3>
                            <p className="text-sm whitespace-pre-wrap">{aiReply}</p>
                        </div>
                    )}

                    {/* Alert Message Display */}
                    {alertMessage && (
                        <Alert className={`mt-4 ${alertMessage.startsWith("Error") || alertMessage.startsWith("Failed") ? "border-red-500 text-red-700" : "border-green-500 text-green-700"}`}>
                            <AlertTitle>{alertMessage.startsWith("Error") || alertMessage.startsWith("Failed") ? "Error" : "Success"}</AlertTitle>
                            <AlertDescription>{alertMessage}</AlertDescription>
                        </Alert>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit" // Changed from onClick to type="submit" for form submission
                        // onClick={() => setPage(2)} // This button now submits the form, page change handled in addProject
                        className="bg-[#29292c] text-white p-2 rounded-md hover:bg-[#222225] px-4 disabled:opacity-50"
                        // disabled={!selectedRepo || !formDataIsComplete} // Add more robust disabling logic if needed
                      >
                        Submit Project
                      </button>
                    </div>
                  </div>
                </>
                :
                <>
                  {/* Content for page === 2 if you still need a multi-page form */}
                  {/* For now, assuming submission happens on page 1 */}
                  <div className="text-xl">Project Submitted! (Placeholder for page 2)</div>
                  <button onClick={() => setPage(1)} className="mt-4 bg-blue-500 text-white p-2 rounded-md">Create Another Project</button>
                </>
              }
              </form>
            </div>
          </div>
        </div>
        </>
    )
}