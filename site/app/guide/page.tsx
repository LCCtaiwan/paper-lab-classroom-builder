import Link from "next/link";

export const metadata = {
  title: "操作教學｜Paper Lab",
  description: "使用可公開散布的三頁合成教材，走完 Paper Lab 從 PDF 到互動課堂的流程。",
};

const courseSections = [
  ["01", "Shared questions", "p.1–2", "—"],
  ["02", "Teacher checkpoint", "p.3", "p.3"],
];

function Preview({ label, title, items }: { label: string; title: string; items: string[] }) {
  return <div className="guide-preview" role="img" aria-label={`${label}：${title}`}>
    <span>{label}</span><h3>{title}</h3>
    <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
  </div>;
}

export default function GuidePage() {
  return <main className="guide-shell">
    <header className="guide-header"><Link className="wordmark" href="/">PAPER LAB</Link><nav><Link href="/build">開始建立課程</Link><span>操作教學</span></nav></header>

    <section className="guide-hero">
      <div><p className="eyebrow">SYNTHETIC DEMO WALKTHROUGH</p><h1>用三頁教材，<br />走完互動課堂。</h1><p>Repository 內的 <code>examples/paper-lab-demo.pdf</code> 是可自由散布的合成教材，不含病人資料或第三方講義。你不需要理解程式或 Manifest，也能依序完成上傳、分段、停靠頁與開課。</p><div className="guide-hero-actions"><Link className="primary-link" href="/build">開啟課程建立器</Link><a className="secondary-link" href="#step-1">從第一步開始</a></div></div>
      <aside className="guide-demo-card"><span>開源示範教材</span><h2>Paper Lab Demo</h2><dl><div><dt>頁數</dt><dd>3 頁</dd></div><div><dt>內容</dt><dd>合成</dd></div><div><dt>格式</dt><dd>橫式 PDF</dd></div><div><dt>示範結果</dt><dd>2 段／1 停靠</dd></div></dl><p>PDF 檢查：未加密、無 JavaScript、頁面方向正確，三頁皆可讀。</p></aside>
    </section>

    <div className="guide-layout">
      <aside className="guide-rail" aria-label="操作章節"><b>操作目錄</b><a href="#before">開始前</a><a href="#step-1">1. 上傳 PDF</a><a href="#step-2">2. 確認頁面</a><a href="#step-3">3. 設定分段</a><a href="#step-4">4. 建立課程</a><a href="#step-5">5. 建立場次</a><a href="#step-6">6. 開始上課</a><a href="#finish">課後收尾</a></aside>

      <article className="guide-content">
        <section id="before" className="guide-section">
          <p className="guide-kicker">開始前</p><h2>準備一份可以安全處理的 PDF</h2><p>自己的教材需未加密、不超過 20 MB／100 頁，並確認有權上傳且不含病人姓名、病歷號或其他敏感資訊。Web Builder 不呼叫模型 API；可匯入 Codex／Claude Code 草稿，也可完全人工分段。</p>
          <div className="guide-callout"><b>Pilot 邀請碼</b><p>邀請碼只保護「建立課程」。學生加入時只需要每場新產生的六碼，不需要 Pilot 邀請碼。</p></div>
        </section>

        <section id="step-1" className="guide-section">
          <p className="guide-kicker">STEP 01</p><h2>輸入邀請碼並選擇 PDF</h2><ol><li>開啟課程建立器。</li><li>輸入部署者提供的 Pilot 邀請碼。</li><li>選擇 <code>examples/paper-lab-demo.pdf</code> 或自己的講義。</li><li>確認教材權利與資料安全後勾選確認事項。</li></ol>
          <Preview label="BUILDER" title="PDF 與建課門檻" items={["Pilot 邀請碼", "PDF 上傳", "教材權利與敏感資料確認"]} />
          <p>讀取完成後會顯示頁數與 checksum。合成 demo 應為 <b>3 頁</b>；頁數不符時先停止。</p>
        </section>

        <section id="step-2" className="guide-section">
          <p className="guide-kicker">STEP 02</p><h2>先看頁面，再談分段</h2><p>時間軸會顯示全部頁面縮圖。demo 必須逐頁查看 p.1、p.2、p.3，確認沒有裁切、旋轉、黑頁或不可讀文字。</p><div className="guide-two-col"><div><b>從此分段</b><p>表示這一頁是新主題的第一頁。系統會自動結束前一段。</p></div><div><b>設為停靠</b><p>表示講師預計在此整理學生問題；它不會自動中斷投影。</p></div></div>
          <Preview label="PAGE TIMELINE" title="p.1、p.2、p.3" items={["查看全部三頁", "由 p.3 開始第二段", "教師將 p.3 設為停靠"]} />
        </section>

        <section id="step-3" className="guide-section">
          <p className="guide-kicker">STEP 03</p><h2>把三頁整理成兩段</h2><p>這只是示範，不是系統強制答案。Codex／Claude Code 可提出連續段落草稿，但停靠頁仍由教師決定。</p>
          <div className="guide-table" role="table" aria-label="示範課程分段"><div className="guide-table-head" role="row"><span>段</span><span>名稱</span><span>頁碼</span><span>章末停靠</span></div>{courseSections.map(([number, title, pages, checkpoint]) => <div role="row" key={number}><b>{number}</b><span>{title}</span><span>{pages}</span><span>{checkpoint}</span></div>)}</div>
          <p>完成後逐段檢查名稱與摘要，並勾選「我已檢查第一頁、代表性中間頁與最後一頁」，建立按鈕才會啟用。</p>
          <Preview label="COURSE MANIFEST" title="連續覆蓋 p.1–3" items={["無缺頁或重疊", "Agent checkpoints 保持空白", "教師確認後才建立"]} />
        </section>

        <section id="step-4" className="guide-section">
          <p className="guide-kicker">STEP 04</p><h2>建立課程，保存管理入口</h2><p>系統會保存原始 PDF、逐頁投影片、縮圖與 Manifest，完成後進入課程管理頁。</p><div className="guide-callout warning"><b>管理網址不可傳給學生</b><p>管理入口包含秘密憑證。學生只應收到每次開課產生的六碼或 QR Code。</p></div>
          <Preview label="COURSE ADMIN" title="Paper Lab Demo" items={["3 pages", "2 sections", "Create a new class session"]} />
        </section>

        <section id="step-5" className="guide-section">
          <p className="guide-kicker">STEP 05</p><h2>每次上課建立新場次</h2><p>相同課程可以建立多個六碼場次，各場問題互不混用。講師後台顯示投影預覽、翻頁控制與學生問題。</p>
          <Preview label="LIVE SESSION" title="六碼只屬於這一場" items={["開啟投影視窗", "顯示學生加入 QR", "結束後保留問題回顧"]} />
        </section>

        <section id="step-6" className="guide-section">
          <p className="guide-kicker">STEP 06</p><h2>三個畫面各做一件事</h2>
          <div className="guide-two-col"><div><b>講師與投影</b><p>講師翻頁、整理問題並選擇單題投影；外接螢幕只顯示講義或指定問題。</p></div><div><b>學生手機</b><p>以六碼與暱稱加入，隨時提問與同問；問題自動綁定當下頁碼與段落。</p></div></div>
          <Preview label="SHARED CONFUSION" title="只有講師能指定投影" items={["學生提問", "同問排序", "投影單題", "回答後收回"]} />
        </section>

        <section id="finish" className="guide-section guide-finish">
          <p className="guide-kicker">FINISH</p><h2>下課前的四項確認</h2><ul className="guide-checklist"><li>回答完成後收回投影問題。</li><li>結束場次，停止學生繼續送出。</li><li>確認講師端仍可回顧公開與隱藏問題。</li><li>保留課程管理網址；下次建立新場次。</li></ul><div className="guide-hero-actions"><Link className="primary-link" href="/build">現在建立一門課</Link><a className="secondary-link" href="#step-1">重新看操作步驟</a></div>
        </section>
      </article>
    </div>
  </main>;
}
