
const ProfileSkeleton = () => {
  return (
    <div className="w-full max-w-3xl animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-40 rounded bg-border" />
        <div className="mt-3 h-5 w-64 rounded bg-border" />
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-2 h-4 w-20 rounded bg-border" />
            <div className="h-11 w-full rounded-lg bg-border" />
          </div>

          <div>
            <div className="mb-2 h-4 w-20 rounded bg-border" />
            <div className="h-11 w-full rounded-lg bg-border" />
          </div>

          <div>
            <div className="mb-2 h-4 w-28 rounded bg-border" />
            <div className="h-11 w-full rounded-lg bg-border" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
