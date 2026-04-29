import { MyRequirementsList } from '@/features/requirements/my-requirements-list';

export const metadata = { title: 'My requirements' };

export default function MyRequirementsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My requirements</h1>
        <p className="mt-1 text-sm text-ink-500">
          Open requirements suppliers can quote on, plus your closed history.
        </p>
      </div>
      <MyRequirementsList />
    </div>
  );
}
