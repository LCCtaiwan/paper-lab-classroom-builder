import { DisplayApp } from "./DisplayApp";

type Props = { params: Promise<{ code: string }> };
export default async function DisplayPage({ params }: Props) { const { code } = await params; return <DisplayApp initialCode={code.toUpperCase()} />; }
