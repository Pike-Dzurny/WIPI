"use client";


import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  display_name: string;
}


export default function Page({ params }: { params: { id: string } }) {
  const [following, setFollowing] = useState<User[]>([]);
  const id = parseInt(params.id);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (id) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${id}/following`);
        const data = await response.json();
        setFollowing(data);
      }
    };

    fetchFollowers();
  }, []);

  return (
    <div className="following-list">
      <h1>Following</h1>
      <div>
        {following.map(following => (
          <div key={following.id} className="following-item">
            {following.display_name}
          </div>
        ))}
      </div>
    </div>
  );
};

