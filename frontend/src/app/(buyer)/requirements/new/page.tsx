import { PostRequirementForm } from '@/features/requirements/post-requirement-form';

export const metadata = { title: 'Post a buy requirement' };

export default function NewRequirementPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Tell us what you need</h1>
        <p className="mt-1 text-sm text-ink-500">
          Post your requirement and verified suppliers in the matching category will reach out.
        </p>
      </div>
      <PostRequirementForm />
    </div>
  );
}
