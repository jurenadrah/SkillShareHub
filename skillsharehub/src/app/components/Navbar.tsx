export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <div className="flex space-x-6">
        <a href="#">About</a>
        <a href="#">Learning Tools</a>
        <a href="#">Online Courses</a>
        <a href="#">Contact</a>
      </div>
      <div className="text-xl font-bold mr-auto ml-71">📷 SkillShareHub</div>
      <div className="flex space-x-4">
        <span>🔔</span>
        <span>👤</span>
        <span>📘</span>
        <span>🐦</span>
        <span>▶️</span>
      </div>
    </nav>
  );
}
