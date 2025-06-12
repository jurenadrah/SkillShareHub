'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Post = {
  id: string;
  content: string;
  created_at: string;
  fk_uporabniki_id: string; // or user_id
  image_url:string;
};

type Uporabniki = {
  id: number;
  ime: string;
  priimek: string;
  profilna_slika: string | null;
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

type Komentar = {
  id:number;
  postid:number;
  userid:number;
  senderid:number;
  content:string;
  created_at:string;
}

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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
    async function fetchAllUsers() {
      const { data } = await supabase.from('Uporabniki').select('id, ime, priimek, profilna_slika');
      if (data) setAllUsers(data);
    }

    async function fetchPostedUsers() {
      const { data: postData } = await supabase.from('Posti').select('fk_uporabniki_id');
      const ids = [...new Set(postData?.map(p => p.fk_uporabniki_id) || [])];
      if (ids.length > 0) {
        const { data: users } = await supabase
          .from('Uporabniki')
          .select('id, ime, priimek, profilna_slika')
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
      .select('id, content, created_at, fk_uporabniki_id,image_url')
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
      .select('id, ime, priimek,profilna_slika')
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

  





const [comments, setComments] = useState<Komentar[]>([]);
const [newComment, setNewComment] = useState("");


useEffect(() => {
    const fetchComments = async () => {
      if (!selectedPost?.id) return;
      const { data, error } = await supabase
        .from("Komentar")
        .select("*")
        .eq("postid", selectedPost.id)
        .order("created_at", { ascending: true });

      if (!error) setComments(data);
    };

    fetchComments();
  }, [selectedPost]);

  // Handle new comment submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !currentUser || !selectedPost?.id) return;
    const { data, error } = await supabase.from("Komentar").insert([
      {
        postid: selectedPost.id,
        senderid: currentUser.id,
        content: newComment.trim(),
      },
    ]).select();

    if (error) {
      console.error("Error saving comment:", error);
    } else if (data){
      setComments([...comments, { ...data[0], content: newComment.trim() }]);
      setNewComment("");
    }
  };


  const handleDeleteComment = async (commentId: number) => {
    const { error } = await supabase
      .from("Komentar")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Napaka pri brisanju komentarja:", error);
    } else {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  };


  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !imageFile) return;

    const imageUrl = await uploadImage();

    const { error } = await supabase.from('Posti').insert([
      {
        fk_uporabniki_id: currentUser!.id,
        content: newPostContent.trim(),
        image_url: imageUrl,
      },
    ]);

    if (!error) {
      setNewPostContent('');
      setImageFile(null);
      fetchPostsAndUsers(); // osveži poste
    } else {
      alert('Napaka pri objavi.');
    }
  };

  async function handleDeletePost(postId: string) {
  const confirmDelete = confirm('Ali ste prepričani, da želite izbrisati to objavo?');
  if (!confirmDelete) return;

  const { error } = await supabase.from('Posti').delete().eq('id', postId);

  if (error) {
    alert('Napaka pri brisanju objave.');
  } else {
    fetchPostsAndUsers();
  }
}


  const uploadImage = async () => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('slike')
      .upload(filePath, imageFile);

    setUploading(false);

    if (uploadError) {
      console.error('Napaka pri nalaganju slike:', uploadError);
      return null;
    }

    // Dobimo javni URL do slike
    const { data: urlData } = supabase.storage
      .from('slike')
      .getPublicUrl(filePath);

    
    return urlData.publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

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
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          maxWidth: 600,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <textarea
          rows={4}
          placeholder="Kaj razmišljaš?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            borderRadius: 8,
            border: '1px solid #ccc',
            resize: 'vertical',
            boxShadow: 'inset 0 1px 3px rgb(0 0 0 / 0.1)',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#0070f3')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ccc')}
        />

        <label
          htmlFor="image-upload"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'center',
            maxWidth: 150,
          }}
        >
          Izberi sliko
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </label>

        {uploading && <p style={{ color: '#666', fontStyle: 'italic' }}>Nalaganje slike...</p>}

        <button
          type="submit"
          disabled={uploading}
          style={{
            backgroundColor: uploading ? '#8ab4f8' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '0.75rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            if (!uploading) e.currentTarget.style.backgroundColor = '#005bb5';
          }}
          onMouseLeave={(e) => {
            if (!uploading) e.currentTarget.style.backgroundColor = '#0070f3';
          }}
        >
          Objavi
        </button>
      </form>











      {/* Filtri */}
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
















      {/*odprto za podrobnosti posta in branje komentrarjev */}
      {isModalOpen && selectedPost && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: 10,
              width: '80%',
              maxWidth: '1000px',
              display: 'flex',
              gap: '2rem',
            }}
          >
            {/* Left side: Post details */}
            <div style={{ flex: 1 }}>
              {usersMap[selectedPost.fk_uporabniki_id] ? (
                <Link href={`/viewprofile/${selectedPost.fk_uporabniki_id}`} passHref>
                  <div className="flex items-center space-x-4 mb-2">
                    <img
                      src={usersMap[selectedPost.fk_uporabniki_id].profilna_slika ?? "/default-profile.png"}
                      alt="Profilna slika"
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <h2 style={{ marginBottom: '0.5rem' }}>
                      {usersMap[selectedPost.fk_uporabniki_id].ime} {usersMap[selectedPost.fk_uporabniki_id].priimek}
                    </h2>
                  </div>
                </Link>
              ) : (
                <h2 style={{ marginBottom: '0.5rem' }}>Neznan uporabnik</h2>
              )}
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{selectedPost.content}</p>
              {/* Show post image if exists */}
              {selectedPost.image_url && (
                <img
                  src={selectedPost.image_url}
                  alt="Post image"
                  style={{ maxWidth: '100%', borderRadius: 8, marginBottom: '0.5rem' }}
                />
              )}
              <small style={{ color: '#666' }}>
                {new Date(selectedPost.created_at).toLocaleString()}
              </small>
            </div>

            {/* Right side: comments */}
            <div
              style={{
                flex: 1,
                backgroundColor: "#f9f9f9",
                padding: "1rem",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {/* Comments display area (top 80%) */}
              <div style={{ flex: "0 1 80%", overflowY: "auto", marginBottom: "1rem" }}>
                <p><strong>Komentarji</strong></p>
                {comments.length === 0 ? (
                  <p>Ni komentarjev.</p>
                ) : (
                  comments.map((comment, idx) => {
                    const user = usersMap[comment.senderid];

                    return (
                      <div
                        key={idx}
                        style={{
                          marginBottom: "0.5rem", 
                          padding: "0.5rem",
                          background: "#fff",
                          borderRadius: 4,
                          position:"relative",
                        }}
                      >
                        {user ? (
                          <Link href={`/viewprofile/${comment.senderid}`} passHref>
                            <div className="flex items-center space-x-4 mb-2">
                              <img
                                src={user.profilna_slika ?? "/default-profile.png"}
                                alt="Profilna slika"
                                className="w-10 h-10 object-cover rounded-full"
                              />
                              <h2 style={{ marginBottom: "0.5rem" }}>
                                {user.ime} {user.priimek}
                              </h2>
                            </div>
                          </Link>
                        ) : (
                          <div className="mb-2">
                            <h2 style={{ marginBottom: "0.5rem" }}>Neznan uporabnik</h2>
                          </div>
                        )}

                        {/*comment content and timestamp*/}
                        <p style={{ margin: 0 }}>{comment.content}</p>
                        <small style={{ color: "#888" }}>
                          {new Date(comment.created_at).toLocaleString()}
                        </small>
                        
                        {/* Delete button aligned right inside the comment box */}
                        {currentUser?.id === comment.senderid && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{
                              position: "absolute",
                              top: "0.5rem",
                              right: "0.5rem",
                              background: "none",
                              border: "none",
                              color: "#d00",
                              cursor: "pointer",
                              fontSize: "1.2rem",
                            }}
                            title="Izbriši komentar"
                            aria-label="Delete comment"
                          >
                            🗑
                          </button>
                        )}
                        
                      </div>
                    );
                  }))
                }
              </div>

              {/* New comment input area (bottom 20%) */}
              <div style={{ flex: "0 1 20%" }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Vnesi komentar..."
                  style={{
                    width: "100%",
                    height: "60%",
                    resize: "none",
                    padding: "0.5rem",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    marginBottom: "0.5rem",
                  }}
                />
                <button
                  onClick={handleCommentSubmit}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    backgroundColor: "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Dodaj komentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}













      {/* Posts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {posts.map(post => {
          const user = usersMap[post.fk_uporabniki_id];
          const isAuthor = currentUser?.id===parseInt(post.fk_uporabniki_id)
          return (
            <div
              key={post.id}
              onClick={() => {
                setSelectedPost(post);
                setIsModalOpen(true);
              }}
              style={{
                padding: '1rem 1.5rem',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgb(0 0 0 / 0.05)',
                backgroundColor: 'white',
                border: '1px solid #eaeaea',
              }}
            >
              {/* normal prikazani posti */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ marginBottom: 6, fontWeight: '700', fontSize: '1.05rem' }}>
                    {user ? (
                      <Link href={`/viewprofile/${post.fk_uporabniki_id}`} passHref>
                        <div className="flex items-center space-x-4">
                          <img
                            src={user.profilna_slika ?? "/default-profile.png"}
                            alt="Profilna slika"
                            className="w-10 h-10 object-cover rounded-full"
                          />
                          <span>{user.ime} {user.priimek}</span>
                        </div>
                      </Link>
                    ) : (
                      'Neznan uporabnik'
                    )}
                  </div>
                  {isAuthor && (
                      <div>
                          <button
                              onClick={() => handleDeletePost(post.id)}
                              title="Izbriši objavo"
                              style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1.1rem',
                              color: '#e74c3c',
                              marginLeft: '1rem',
                              }}
                          >
                              🗑️
                          </button>
                      </div>
                  )}
              </div>
                <p style={{ lineHeight: 1.5, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{post.content}</p>

                  {/* Show post image if exists */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post image"
                      style={{ maxWidth: '100%', borderRadius: 8, marginBottom: '0.5rem' }}
                    />
                  )}

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
