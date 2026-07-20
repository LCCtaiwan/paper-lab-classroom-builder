/* eslint-disable @next/next/no-img-element -- Guide images are verified screenshots of the local product flow. */
import Link from "next/link";

export const metadata = {
  title: "操作教學｜Paper Lab",
  description: "以 59 頁運動禁藥講義示範 Paper Lab 從 PDF 到互動課堂的完整操作流程。",
};

const courseSections = [
  ["01", "反禁藥體系與責任", "p.1–11", "p.11"],
  ["02", "禁用清單與臨床案例", "p.12–40", "p.40"],
  ["03", "中藥、食物與風險", "p.41–50", "p.50"],
  ["04", "治療用途豁免 TUE", "p.51–54", "p.54"],
  ["05", "諮詢判斷與帶回重點", "p.55–59", "—"],
];

function Shot({ file, alt, caption }: { file: string; alt: string; caption: string }) {
  return <figure className="guide-shot"><img src={`/guide/${file}`} alt={alt} loading="lazy" /><figcaption>{caption}</figcaption></figure>;
}

export default function GuidePage() {
  return <main className="guide-shell">
    <header className="guide-header"><Link className="wordmark" href="/">PAPER LAB</Link><nav><Link href="/build">開始建立課程</Link><span>操作教學</span></nav></header>

    <section className="guide-hero">
      <div><p className="eyebrow">REAL COURSE WALKTHROUGH</p><h1>用一份真實講義，<br />走完互動課堂。</h1><p>以下使用「0614_運動禁藥_李承洲.pdf」實際操作。你不需要理解程式或 Manifest，只要依序完成上傳、分段、停靠頁與開課。</p><div className="guide-hero-actions"><Link className="primary-link" href="/build">開啟課程建立器</Link><a className="secondary-link" href="#step-1">從第一步開始</a></div></div>
      <aside className="guide-demo-card"><span>示範教材</span><h2>運動禁藥知多少</h2><dl><div><dt>頁數</dt><dd>59 頁</dd></div><div><dt>大小</dt><dd>5.45 MB</dd></div><div><dt>格式</dt><dd>橫式 PDF</dd></div><div><dt>建議結果</dt><dd>5 段／4 停靠</dd></div></dl><p>PDF 檢查：未加密、頁面方向正確，首／中／末頁可讀。</p></aside>
    </section>

    <div className="guide-layout">
      <aside className="guide-rail" aria-label="操作章節"><b>操作目錄</b><a href="#before">開始前</a><a href="#step-1">1. 上傳 PDF</a><a href="#step-2">2. 確認頁面</a><a href="#step-3">3. 設定分段</a><a href="#step-4">4. 建立課程</a><a href="#step-5">5. 建立場次</a><a href="#step-6">6. 開始上課</a><a href="#finish">課後收尾</a></aside>

      <article className="guide-content">
        <section id="before" className="guide-section">
          <p className="guide-kicker">開始前</p><h2>先準備一份可以安全處理的 PDF</h2><p>確認 PDF 未加密、不超過 20 MB／100 頁，並由教師判斷教材不含病人姓名、病歷號或其他敏感資訊。若教材不能送至外部 AI，請不要勾選資料同意；你仍可採人工分段或 Claude Code 本機流程。</p>
          <div className="guide-callout"><b>本機 Pilot 提醒</b><p>邀請碼只保護「建立課程」。學生加入時只需要每場新產生的六碼，不需要 Pilot 邀請碼。</p></div>
        </section>

        <section id="step-1" className="guide-section">
          <p className="guide-kicker">STEP 01</p><h2>輸入邀請碼並選擇 PDF</h2><ol><li>開啟「課程建立器」。</li><li>輸入管理者提供的 Pilot 邀請碼。</li><li>按「選擇 PDF」，選取講義。</li><li>確認教材資料政策後，再勾選同意事項。</li></ol>
          <Shot file="guide-step-1-upload.png" alt="Paper Lab 課程建立器的 PDF 上傳區" caption="畫面 1：最初只需要邀請碼、PDF 與資料確認。" />
          <p>讀取完成後，檔名下方會顯示頁數與 checksum。示範教材應顯示 <b>59 頁</b>；頁數不符時先停止，不要繼續建課。</p>
          <Shot file="guide-step-2-loaded.png" alt="59 頁運動禁藥 PDF 已載入 Paper Lab" caption="畫面 2：系統已辨識 59 頁。未設定 Gemini 時會自動切換人工分段，仍可繼續。" />
        </section>

        <section id="step-2" className="guide-section">
          <p className="guide-kicker">STEP 02</p><h2>先看頁面，再談分段</h2><p>時間軸會顯示全部頁面的縮圖。至少查看第 1、30、59 頁，確認沒有裁切、旋轉、黑頁或不可讀文字。頁面按鈕有兩種用途：</p><div className="guide-two-col"><div><b>從此分段</b><p>表示這一頁是新主題的第一頁。系統會自動結束前一段，不必手算結束頁。</p></div><div><b>設為停靠</b><p>表示講師預計在這一頁整理學生問題；它不會自動中斷投影。</p></div></div>
          <Shot file="guide-step-3-timeline.png" alt="運動禁藥講義的頁面縮圖、分段與停靠按鈕" caption="畫面 3：逐頁時間軸。橘色狀態代表教師設定的問題整理頁。" />
        </section>

        <section id="step-3" className="guide-section">
          <p className="guide-kicker">STEP 03</p><h2>把 59 頁整理成教師看得懂的五段</h2><p>這是示範建議，不是系統強制答案。教師可以依實際授課節奏調整名稱、摘要與分段起點。</p>
          <div className="guide-table" role="table" aria-label="示範課程分段"><div className="guide-table-head" role="row"><span>段</span><span>名稱</span><span>頁碼</span><span>章末停靠</span></div>{courseSections.map(([number, title, pages, checkpoint]) => <div role="row" key={number}><b>{number}</b><span>{title}</span><span>{pages}</span><span>{checkpoint}</span></div>)}</div>
          <p>完成後，在段落內容區逐段檢查名稱和摘要。最後勾選「我已檢查第一頁、代表性中間頁與最後一頁」，建立按鈕才會啟用。</p>
          <Shot file="guide-step-4-sections.png" alt="五個運動禁藥課程段落與視覺確認" caption="畫面 4：五段連續覆蓋 p.1–59，沒有缺頁或重疊，視覺確認已完成。" />
        </section>

        <section id="step-4" className="guide-section">
          <p className="guide-kicker">STEP 04</p><h2>建立課程，先保存管理入口</h2><p>按「確認並建立互動課堂」後，系統會保存原始 PDF、59 張投影片、縮圖與課程設定。完成後進入課程管理頁。</p><div className="guide-callout warning"><b>管理網址不可傳給學生</b><p>管理入口包含秘密憑證。學生只應收到每次開課產生的六碼或 QR Code。</p></div>
          <Shot file="guide-step-5-manage.png" alt="運動禁藥課程管理頁與五段課程地圖" caption="畫面 5：課程已可開課；管理頁顯示 59 頁、5 段、4 個停靠頁。" />
        </section>

        <section id="step-5" className="guide-section">
          <p className="guide-kicker">STEP 05</p><h2>每次上課都建立一個新場次</h2><p>按「建立新的授課場次」後會進入講師後台。畫面上方是當次學生代碼，中間是投影預覽，右側是學生問題。相同課程可以建立多個場次，各場問題互不混用。</p>
          <Shot file="guide-step-6-host.png" alt="運動禁藥課程講師後台" caption="畫面 6：講師端可切換五段、翻動 59 頁，右側集中管理學生問題。" />
          <p>按「加入 QR」即可讓學生掃描。截圖中的 <b>ACQLH5</b> 只是示範場次；實際授課必須使用你當次畫面產生的代碼。</p>
          <Shot file="guide-step-7-qr.png" alt="Paper Lab 學生加入 QR Code 與六碼" caption="畫面 7：學生不需帳號，只輸入暱稱。六碼也可作為 QR 掃描失敗時的備援。" />
        </section>

        <section id="step-6" className="guide-section">
          <p className="guide-kicker">STEP 06</p><h2>講師、投影與學生三個畫面各做一件事</h2>
          <h3>外接螢幕：只顯示講義</h3><p>講師按「開啟投影視窗」，把新視窗拖到外接螢幕並進入全螢幕。學生問題不會自動出現在大螢幕。</p><Shot file="guide-step-8-display.png" alt="純投影頁顯示運動禁藥講義第一頁" caption="畫面 8：純投影頁沒有講師控制按鈕，適合放到外接螢幕。" />
          <h3>學生手機：隨時提問與同問</h3><p>學生輸入暱稱後即可提問；問題會自動綁定講師當下的頁碼和段落。請提醒學生不要輸入任何病人個資。</p><Shot file="guide-step-9-student.png" alt="學生端提出運動禁藥課堂問題" caption="畫面 9：學生端顯示目前 p.1 與段落；問題送出後加入共同困惑。" />
          <h3>講師端：決定是否投影</h3><p>右側依同問數整理問題。講師可以「投影這題」或「隱藏」；隱藏後學生看不到，但講師課後仍能回顧。</p><Shot file="guide-step-10-question-control.png" alt="講師端查看並控制學生問題" caption="畫面 10：學生問題停留在講師端，只有講師主動選擇才會投影。" />
          <p>按「投影這題」後，外接螢幕暫時改為單題模式；回答完按「從投影收回」，立即回到講義。</p><Shot file="guide-step-11-projected-question.png" alt="外接螢幕顯示講師指定的單一學生問題" caption="畫面 11：大螢幕只顯示講師指定的單題，不會公開整個問題牆。" />
        </section>

        <section id="finish" className="guide-section guide-finish">
          <p className="guide-kicker">FINISH</p><h2>下課前的四項確認</h2><ul className="guide-checklist"><li>回答完成後收回投影問題。</li><li>按「結束場次」，停止學生繼續送出。</li><li>確認講師端仍可回顧公開與隱藏問題。</li><li>保留課程管理網址；下次從同一課程建立新場次。</li></ul><div className="guide-hero-actions"><Link className="primary-link" href="/build">現在建立一門課</Link><a className="secondary-link" href="#step-1">重新看操作步驟</a></div>
        </section>
      </article>
    </div>
  </main>;
}
