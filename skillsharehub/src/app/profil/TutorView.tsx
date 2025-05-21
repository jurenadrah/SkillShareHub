type Props = {
    user: any;
  };
  
  export default function TutorView({ user }: Props) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Tutor Profil</h1>
        <p>Email: {user.email}</p>
        {/* Dodaj še predmete, oceno, zoom povezave itd. */}
      </div>
    );
  }
  