export default function Leaderboard() {
  const leaderboard = [
    { rank: 1, name: 'Mari Maasikas', points: 5234, avatar: '🏆' },
    { rank: 2, name: 'Jaan Jooksja', points: 4890, avatar: '🥈' },
    { rank: 3, name: 'Kati Karu', points: 4567, avatar: '🥉' },
    { rank: 4, name: 'Peeter Puu', points: 3456, avatar: '👤' },
    { rank: 5, name: 'Liis Lill', points: 3234, avatar: '👤' },
    { rank: 15, name: 'Sina', points: 2340, avatar: '😎', isCurrentUser: true },
  ]

  return (
    <div>
      <div className="bg-[#3e4551] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Kuu edetabel</h2>
        
        <div className="space-y-2">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.isCurrentUser
                  ? 'bg-[#40b236] bg-opacity-20 border border-[#40b236]'
                  : 'bg-[#2c313a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold w-8">
                  {user.rank <= 3 ? user.avatar : `#${user.rank}`}
                </div>
                <div className="text-2xl">{user.avatar === '👤' ? user.avatar : ''}</div>
                <div>
                  <div className="font-medium">
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="ml-2 text-xs bg-[#40b236] px-2 py-1 rounded">SINA</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold text-[#60cc56]">
                {user.points} p
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-[#2c313a]">
          <p className="text-sm text-gray-400 text-center">
            Sinu koht: #15 • Kuni esikohani: 2894 punkti
          </p>
        </div>
      </div>
    </div>
  )
}