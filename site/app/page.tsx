import Link from "next/link";

export const metadata = { title: "Paper Lab｜把 PDF 變成互動課堂", description: "沿用教師原始講義，建立雙螢幕授課與學生共同提問課堂。" };

export default function Home() {
  return <main className="landing-shell">
    <nav className="landing-nav"><b className="wordmark">PAPER LAB</b><Link href="/join">學生加入</Link></nav>
    <section className="landing-hero">
      <div><p className="eyebrow">PDF-FIRST INTERACTIVE CLASSROOM</p><h1>不重做投影片，<br /><em>看見共同困惑。</em></h1><p className="hero-copy">上傳原有講義，確認內容分段並自行設定停靠頁。學生全程提問與按同問，講師保有每一次投影和教學決定。</p><div className="hero-actions"><Link className="primary-link" href="/build">建立一門課</Link><Link className="secondary-link" href="/join">輸入六碼加入</Link></div></div>
      <div className="hero-board" aria-label="課堂問題牆示意"><div className="board-top"><b>講義 p.24 / 64</b><span>問題整理頁</span></div><div className="board-question"><small>共同困惑</small><h2>這個結果是統計顯著，還是也有臨床意義？</h2></div><div className="board-bars"><i style={{ width: "82%" }} /><i style={{ width: "61%" }} /><i style={{ width: "38%" }} /></div><div className="board-question-bubble">▲ 8 人同問</div></div>
    </section>
    <section className="landing-principles"><p>AI 只分析內容</p><p>教師決定節奏</p><p>學生不需帳號</p><p>問題不自動投影</p></section>
    <section className="landing-flow"><div><p className="eyebrow">ONE SOURCE OF TRUTH</p><h2>不論使用 Web、Codex 或 Claude Code，都回到同一份課程 Manifest。</h2></div><ol><li><span>01</span><b>提供 PDF</b><p>保留原頁序與 checksum。</p></li><li><span>02</span><b>確認脈絡</b><p>AI 分段，教師設定停靠頁。</p></li><li><span>03</span><b>建立場次</b><p>講師、投影、學生三端同步。</p></li><li><span>04</span><b>回看困惑</b><p>每次場次保留獨立問題紀錄。</p></li></ol></section>
    <footer className="landing-footer"><b>Paper Lab Classroom Builder</b><span>請勿上傳含病人個資的教材</span></footer>
  </main>;
}
