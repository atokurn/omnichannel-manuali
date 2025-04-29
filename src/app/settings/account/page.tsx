export const metadata = {
  title: "Account Settings",
  description: "Manage your account settings.",
}

export default function AccountSettingsPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Account Settings</h1>
      </div>
      {/* Placeholder for account settings content */}
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
        x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Account Settings Content Goes Here
          </h3>
          <p className="text-sm text-muted-foreground">
            You can manage your account details here.
          </p>
        </div>
      </div>
    </>
  )
}