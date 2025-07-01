# GitFund

*   **GitHub Integration:** Authenticate with GitHub, list your repositories, select issues, view collaborators, and manage pull requests.
*   **Smart Contract Funding:** Project owners can deposit cryptocurrency into a dedicated smart contract to fund specific tasks.
*   **Crypto Rewards:** Contributors receive cryptocurrency rewards directly to their wallets upon successful merging of their pull requests by the project owner.
*   **Web3 Wallet Connection:** Integrates with browser wallets like MetaMask for seamless deposit and withdrawal operations.
*   **Project & Issue Management:** Create detailed project listings, link them to GitHub repositories and specific issues, and track contributions.
*   **AI-Powered Descriptions:** Automatically generates project descriptions using AI based on the repository's README content.
*   **S3 Image Storage:** Project images are uploaded and stored securely using AWS S3 and other s3 providers.

## How It Works

1.  **Project Creation:** Project owners connect their GitHub account and Web3 wallet. They create a project listing on GitFund, selecting a repository, an issue, and setting a reward amount.
2.  **Funding:** The owner deposits the specified reward amount into the project's associated smart contract.
3.  **Contribution:** Developers browse listed projects/issues. They can apply to work on an issue (feature might exist or be planned).
4.  **Development & PR:** The contributor works on the issue and submits a Pull Request on GitHub.
5.  **Review & Merge:** The project owner reviews the PR via the GitFund interface.
6.  **Reward Payout:** Upon deciding to merge, the owner triggers a function that first attempts to withdraw the reward from the smart contract to the contributor's (or owner's, based on current implementation) wallet. If successful, the PR is merged on GitHub, and the transaction is recorded.

## Technology Stack

*   **Frontend:** Next.js, React, TypeScript, Tailwind CSS
*   **Blockchain Interaction:** Ethers.js
*   **GitHub API:** Octokit.js
*   **Authentication:** NextAuth.js (with GitHub Provider)
*   **AI:** Groq SDK (using models like Llama)
*   **File Storage:** AWS S3 (via pre-signed URLs)
*   **Backend:** Next.js API Routes

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd GITFUND
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up environment variables:** Create a `.env.local` file and add necessary variables (GitHub credentials, S3 keys, Groq API key, Smart Contract address, Network details, etc. - *Specific variables need documentation*).
4.  **Run the development server once**
    ```bash
    bun run dev
    # or
    yarn dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Note: You'll need a configured Web3 wallet like MetaMask connected to the appropriate network (e.g., BNB, Educhain Testnet) and funded with test ETH for contract interactions.)*
