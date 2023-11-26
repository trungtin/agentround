import React from 'react'

type Props = { rightActions?: React.ReactNode }

export default function Header({ rightActions }: Props) {
  return (
    <div className="z-50 flex h-[52px] flex-row items-center justify-between border-b border-gray-300 bg-white px-4">
      <span className="text-lg font-bold">AgentѺ</span>

      <div className="flex flex-row gap-x-4">{rightActions}</div>
    </div>
  )
}
