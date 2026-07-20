import { JoinApp } from "../JoinApp";
type Props = { params: Promise<{ code: string }> };
export default async function JoinCodePage({ params }: Props) { const { code } = await params; return <JoinApp initialCode={code.toUpperCase()} />; }
