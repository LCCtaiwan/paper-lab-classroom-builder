import { HostApp } from "./HostApp";

type Props = { params: Promise<{ code: string }> };

export default async function HostPage({ params }: Props) {
  const { code } = await params;
  return <HostApp initialCode={code.toUpperCase()} />;
}
