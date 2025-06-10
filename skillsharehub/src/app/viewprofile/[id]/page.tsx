'use client'
import { useParams } from 'next/navigation';

export default function ViewProfilePage() {
  const params = useParams();
  const userId = params.id;
  console.log(params)

  return (
    <div>
      <h1>Profile page for user ID: {userId}</h1>
      {/* Fetch and display user info based on userId */}
    </div>
  );
}
