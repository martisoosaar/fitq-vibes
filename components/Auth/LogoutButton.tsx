"use client";
export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    try {
      sessionStorage.removeItem('access_token');
    } catch {}
    window.location.reload();
  };
  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
    >
      Logi välja
    </button>
  );
}

