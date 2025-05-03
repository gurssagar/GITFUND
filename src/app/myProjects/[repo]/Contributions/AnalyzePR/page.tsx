'use client';

import { useCompletion } from '@ai-sdk/react';

export default function Page() {
  const { completion, complete } = useCompletion({
    api: '/api/completion',
  });


  return (
    <div>
      <div
        onClick={async () => {
          await complete(
            "Analyze the changes made in a pull request https://github.com/Aider-AI/aider/pull/3869. Focus on a technical review: explain the purpose of the changes, evaluate the code quality, identify any potential issues or improvements, and assess if the modifications align with best coding practices. Assume the reader is familiar with programming concepts.",
          );
        }}
      >
        Schedule a call
      </div>
      {completion}
    </div>
  );
}