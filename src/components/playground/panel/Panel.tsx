export function PanelLoadingError({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-4">
      <div className="text-rose-400">{children}</div>
    </div>
  )
}
