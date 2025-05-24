'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Post = {
  id: string;
  content: string;
  created_at: string;
  fk_uporabniki_id: string; // or user_id
};

type Uporabniki = {
  id: number;
  ime: string;
  priimek: string;
};

type Uporabnik = {
  id: number;
  ime: string;
  priimek: string;
  email: string;
  bio: string | null;
  profilna_slika: string | null;
  tutor: boolean;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, Uporabniki>>({});
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [currentUser, setCurrentUser] = useState<Uporabnik | null>(null);

  // Input states for filter inputs (updated on every change)
  const [filterUserIdInput, setFilterUserIdInput] = useState('');
  const [filterKeywordInput, setFilterKeywordInput] = useState('');
  const [filterFromDateInput, setFilterFromDateInput] = useState('');
  const [filterToDateInput, setFilterToDateInput] = useState('');

  // Applied filter states — used to trigger fetch when changed
  const [appliedFilterUserId, setAppliedFilterUserId] = useState('');
  const [appliedFilterKeyword, setAppliedFilterKeyword] = useState('');
  const [appliedFilterFromDate, setAppliedFilterFromDate] = useState('');
  const [appliedFilterToDate, setAppliedFilterToDate] = useState('');

  const [allUsers, setAllUsers] = useState<Uporabniki[]>([]);
  const [postedUsers, setPostedUsers] = useState<Uporabniki[]>([]);

    useEffect(() => {
    async function fetchAllUsers() {
      const { data } = await supabase.from('Uporabniki').select('id, ime, priimek');
      if (data) setAllUsers(data);
    }

    async function fetchPostedUsers() {
      const { data: postData } = await supabase.from('Posti').select('fk_uporabniki_id');
      const ids = [...new Set(postData?.map(p => p.fk_uporabniki_id) || [])];
      if (ids.length > 0) {
        const { data: users } = await supabase
          .from('Uporabniki')
          .select('id, ime, priimek')
          .in('id', ids);
        if (users) setPostedUsers(users);
      }
    }

    fetchAllUsers();
    fetchPostedUsers();
  }, []);

  // Fetch posts when applied filters change
  useEffect(() => {
    fetchPostsAndUsers();
  }, [appliedFilterUserId, appliedFilterKeyword, appliedFilterFromDate, appliedFilterToDate]);

  // Copy inputs to applied filters on Search button click
  function applyFilters() {
    setAppliedFilterUserId(filterUserIdInput);
    setAppliedFilterKeyword(filterKeywordInput);
    setAppliedFilterFromDate(filterFromDateInput);
    setAppliedFilterToDate(filterToDateInput);
  }

  async function fetchPostsAndUsers() {
    setLoading(true);

    // Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      return;
    }

    // Fetch current user info
    const { data: uporabnikData, error: uporabnikError } = await supabase
      .from('Uporabniki')
      .select('id, ime, priimek,email, bio, profilna_slika, tutor')
      .eq('email', user.email)
      .single();

    if (uporabnikError || !uporabnikData) {
      setLoading(false);
      return;
    }

    setCurrentUser(uporabnikData);

    // Prepare posts query with applied filters
    let query = supabase
      .from('Posti')
      .select('id, content, created_at, fk_uporabniki_id')
      .order('created_at', { ascending: false });

    if (appliedFilterUserId) {
      query = query.eq('fk_uporabniki_id', appliedFilterUserId);
    }
    if (appliedFilterKeyword.trim()) {
      query = query.ilike('content', `%${appliedFilterKeyword.trim()}%`);
    }
    if (appliedFilterFromDate) {
      query = query.gte('created_at', appliedFilterFromDate);
    }
    if (appliedFilterToDate) {
      query = query.lte('created_at', appliedFilterToDate);
    }

    const { data: postsData, error: postsError } = await query;

    if (postsError || !postsData) {
      console.error('Error fetching posts:', postsError);
      setLoading(false);
      return;
    }

    setPosts(postsData);

    // Extract unique user IDs from posts
    const userIds = [...new Set(postsData.map(post => post.fk_uporabniki_id))];
    if (userIds.length === 0) {
      setUsersMap({});
      const newUsersMap: Record<string, Uporabniki> = {};
      const selectedUser = allUsers.find(u => u.id.toString() === appliedFilterUserId);
      if(selectedUser){
        newUsersMap[appliedFilterUserId] = selectedUser;
      }
      setUsersMap(newUsersMap);
      setLoading(false);
      return;
    }

    // Fetch all users by those IDs
    const { data: usersData, error: usersError } = await supabase
      .from('Uporabniki')
      .select('id, ime, priimek')
      .in('id', userIds);

    if (usersError || !usersData) {
      console.error('Error fetching users:', usersError);
      setLoading(false);
      return;
    }
    
    // Create map from user ID to user object
    const newUsersMap: Record<string, Uporabniki> = {};
    usersData.forEach(user => {
      newUsersMap[user.id] = user;
    });
    
    setUsersMap(newUsersMap);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!newPostContent.trim() || !currentUser) return;

    const { error } = await supabase.from('Posti').insert([
      {
        fk_uporabniki_id: currentUser.id,
        content: newPostContent.trim(),
      },
    ]);

    if (!error) {
      setNewPostContent('');
      fetchPostsAndUsers();
    } else {
      alert('Napaka pri objavi.');
    }
  }

  if (loading) return <p>Loading posts...</p>;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '2rem auto',
        padding: '1rem 1.5rem',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Objave</h1>

      {/* New Post Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <textarea
          rows={4}
          placeholder="Kaj razmišljaš?"
          value={newPostContent}
          onChange={e => setNewPostContent(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: 8,
            border: '1px solid #ccc',
            resize: 'vertical',
            boxShadow: 'inset 0 1px 3px rgb(0 0 0 / 0.1)',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            border: '2px solid black',
            borderRadius: 6,
            padding: '0.6rem 1.3rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, color 0.2s ease',
            width: 'fit-content',
            textAlign: 'center',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'black';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#0070f3';
            e.currentTarget.style.color = 'white';
          }}
        >
          Objavi
        </button>
      </form>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
          border: '1px solid #ddd',
          padding: '1rem',
          borderRadius: 8,
          backgroundColor: '#fafafa',
        }}
      >
        {/* Filter by User */}
        <label>
          Filtriraj po uporabniku:{' '}
          <select
            value={filterUserIdInput}
            onChange={e => setFilterUserIdInput(e.target.value)}
            style={{ padding: '0.3rem', minWidth: 150 }}
          >
            <option value="">Vsi uporabniki</option>
            {Object.values(usersMap).map(user => (
              <option key={user.id} value={user.id}>
                {user.ime} {user.priimek}
              </option>
            ))}
          </select>
        </label>

        {/* Filter by Keyword */}
        <label>
          Iskanje po vsebini:{' '}
          <input
            type="text"
            placeholder="Vnesi besedo ali frazo"
            value={filterKeywordInput}
            onChange={e => setFilterKeywordInput(e.target.value)}
            style={{ padding: '0.3rem', width: '100%' }}
          />
        </label>

        {/* Filter by Date */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label>
            Od:{' '}
            <input
              type="date"
              value={filterFromDateInput}
              onChange={e => setFilterFromDateInput(e.target.value)}
              style={{ padding: '0.3rem' }}
            />
          </label>
          <label>
            Do:{' '}
            <input
              type="date"
              value={filterToDateInput}
              onChange={e => setFilterToDateInput(e.target.value)}
              style={{ padding: '0.3rem' }}
            />
          </label>
        </div>

        {/* Search Button */}
        <button
          onClick={e => {
            e.preventDefault();
            applyFilters();
          }}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            border: '2px solid black',
            borderRadius: 6,
            padding: '0.6rem 1.3rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: 'fit-content',
            textAlign: 'center',
            alignSelf: 'start',
            marginTop: '0.5rem',
            transition: 'background-color 0.2s ease, color 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'black';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#0070f3';
            e.currentTarget.style.color = 'white';
          }}
        >
          Išči
        </button>
      </div>

      {/* Posts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {posts.map(post => {
          const user = usersMap[post.fk_uporabniki_id];
          return (
            <div
              key={post.id}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgb(0 0 0 / 0.05)',
                backgroundColor: 'white',
                border: '1px solid #eaeaea',
              }}
            >
              <p style={{ marginBottom: 6, fontWeight: '700', fontSize: '1.05rem' }}>
                {user ? `${user.ime} ${user.priimek}` : 'Neznan uporabnik'}
              </p>
              <p style={{ lineHeight: 1.5, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{post.content}</p>
              <small style={{ color: '#666', fontSize: '0.85rem' }}>
                {new Date(post.created_at).toLocaleString()}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
