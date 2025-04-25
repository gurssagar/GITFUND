'use client'
import { useState } from "react";
import { Octokit } from "octokit";
import { useParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import Issue from "@/assets/components/issue";
import { useSearchParams } from 'next/navigation';

const IssueCommentForm = () => {
  const searchParams = useSearchParams();
  const contributors = searchParams.get('collabs');
  const { data: session } = useSession();
  const params = useParams();
  const Repo = params?.Repo as string;
  const Issue = params?.Issue as string;
  console.log(session)
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const parsedContributors = contributors ? JSON.parse(contributors) : [];
  console.log(parsedContributors,"tegs")


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const octokit = new Octokit({
        auth: (session as any)?.accessToken
      });

      // Split repo into owner and repo name
      const owner= parsedContributors as string
      const repo=Repo
      console.log(owner,repo,parseInt(Issue))
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: parseInt(Issue),
        body: comment
      });

      await fetch('/api/requestIssue',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          projectName: repo,
          Contributor_id: (session?.user as any)?.username as string,
          issue: Issue,
          image_url: (session?.user as any)?.image as string,
          name: (session?.user as any)?.name as string,
          description:comment 
        })
      });


      setSuccess(true);
      setComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
        
        <div className='flex'>
            <Sidebar/>
            <div className='ml-[12em] w-[calc(100%_-_12em)]'>
                <Topbar/>
                <div className='flex'>
                <div className='w-[85%]'>
                <div className="mt-20 mx-auto w-[calc(100%_-_16rem)] justify-center">
                    <form onSubmit={handleSubmit} className="max-w-[600px] border-1 border-gray-800 rounded-xl p-10 mx-auto space-y-4">
                    <div className="text-3xl mb-6">
              Add Comment to Issue #{Issue}
                    </div>
            
                        {error && (
                            <div className="text-red-500 p-2 rounded-md">
                                {error}
                            </div>
                        )}
            
                        {success && (
                            <div className="text-green-500 p-2 rounded-md">
                                Comment posted successfully!
                            </div>
                        )}

            <div className="space-y-2">
              <label className="text-[14px]" htmlFor="comment">
                Your Comment
              </label>
              <textarea
                id="comment"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border-1 border-gray-800 rounded-md h-32"
                required
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#29292c] text-white p-2 rounded-md hover:bg-[#222225] px-4 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
            </div>
        </div>

        </>
    
  );
};

export default IssueCommentForm;