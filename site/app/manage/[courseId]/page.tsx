import { ManageApp } from "./ManageApp";

type Props = { params: Promise<{ courseId: string }> };

export default async function ManagePage({ params }: Props) {
  const { courseId } = await params;
  return <ManageApp courseId={courseId} />;
}
