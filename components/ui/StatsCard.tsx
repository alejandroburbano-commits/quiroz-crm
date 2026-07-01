interface StatsCardProps {
  title: string
  value: number | string
  icon: string
  change?: string
  changeType?: 'up' | 'down' | 'warning'
}

export function StatsCard({ title, value, icon, change, changeType }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${
              changeType === 'up' ? 'text-green-600' :
              changeType === 'down' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}