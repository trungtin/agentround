export function PanelHeader(props: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-50 border-b border-gray-100 bg-white pb-2 pt-4">
      <div className="flex flex-row justify-between">{props.children}</div>
    </div>
  )
}

export function PanelHeaderTitle(props: { children: React.ReactNode }) {
  return (
    <div className="flex items-center text-xs font-bold uppercase">
      {props.children}
    </div>
  )
}

export function PanelHeaderActions(props: { children: React.ReactNode }) {
  return <div className="flex items-center space-x-4">{props.children}</div>
}
