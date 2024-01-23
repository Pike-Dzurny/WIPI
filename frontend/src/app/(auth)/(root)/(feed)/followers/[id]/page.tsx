"use client";

import React, { useState, useEffect } from 'react';



interface User {
  id: number;
  display_name: string;
}


export default function Page({ params }: { params: { id: string } }) {
  const [followers, setFollowers] = useState<User[]>([]);
  const id = parseInt(params.id);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (id) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${id}/followers`);
        const data = await response.json();
        setFollowers(data);
      }
    };

    fetchFollowers();
  }, []);

  return (
    <div className="followers-list">
      <h1>Followers</h1>
      <div>
        {followers.map(follower => (
          <div key={follower.id} className="follower-item">
            {follower.display_name}
          </div>
        ))}
      </div>
    </div>
  );
};

