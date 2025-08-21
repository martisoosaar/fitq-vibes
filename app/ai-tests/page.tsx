'use client'

import Link from 'next/link'

interface Workout {
  id: string
  title: string
  image: string
  exerciseName: string
  timeLimits: number[]
}

const workouts: Workout[] = [
  {
    id: 'NyIRf7LXxbJJxen2N36R',
    title: 'Kätekõverdused',
    image: '/images/push-ups.jpeg',
    exerciseName: 'push_up',
    timeLimits: [1, 2, 0]
  },
  {
    id: 'C8Q63dwF38uuS6U8wkuM',
    title: 'Kükid',
    image: '/images/squats.jpeg',
    exerciseName: 'squat',
    timeLimits: [1, 2, 0]
  },
  {
    id: 'uNDpAoaWAVo6ZF41Vlp0',
    title: 'Kõhulihased',
    image: '/images/abs.jpeg',
    exerciseName: 'sit_up',
    timeLimits: [1, 2, 0]
  },
  {
    id: '9k1XWydTwcWGUoTvMfho',
    title: 'Põlvelt kätekõverdused',
    image: '/images/knee-push-ups.jpeg',
    exerciseName: 'knee_push_up',
    timeLimits: [1, 2, 0]
  },
  {
    id: 'ZUQ63dwF38uuS6U8wkuT',
    title: 'Põlvetõstejooks',
    image: '/images/knee-raises.jpg',
    exerciseName: 'running_in_place',
    timeLimits: [2]
  }
]

export default function AITestsPage() {
  return (
    <div className="min-h-screen bg-[#2c313a] text-white">
      {/* Page Header */}
      <div className="bg-[#3e4551] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">AI Testid</h1>
          <div className="text-gray-300">
            <p>Testi oma võimeid AI-põhistes harjutustes. Vali harjutus ja ajalimit ning alusta testi.</p>
            <p>AI jälgib sinu liigutusi ja loeb kordusi automaatselt kaamera abil.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-[#3e4551] rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-video bg-[#4d5665] relative">
                {workout.image && (
                  <img 
                    src={workout.image} 
                    alt={workout.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
                  <h3 className="p-4 text-xl font-bold text-white w-full">
                    {workout.title}
                  </h3>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex gap-2 flex-wrap">
                  {workout.timeLimits.map((time) => (
                    <Link
                      key={`${workout.id}-${time}`}
                      href={`/ai-tests/${workout.id}?time=${time}`}
                      className="flex-1 min-w-[80px] text-center px-4 py-2 bg-[#40b236] hover:bg-[#60cc56] text-white rounded-lg font-medium transition-colors"
                    >
                      {time === 0 ? 'Piiramatu' : `${time} min`}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}