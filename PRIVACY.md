# 資料處理與隱私說明

更新日期：2026-11-21。適用於目前以 Pyodide 0.27.7 執行的 GSTE Web 測試版；不自動涵蓋日後加入的廣告、分析工具或其他服務。

## 本機處理

目前程式使用瀏覽器 File API 讀取使用者選取的 MusicXML／JSON，交由 Web Worker 與 Pyodide 執行。未見將選取檔案內容或檔案指紋送往遠端的應用程式碼；轉換與 GAR 結果由瀏覽器提供下載。

轉換橋接程式在 Pyodide 虛擬檔案系統建立工作檔並於工作結束時清理工作目錄。這不等於記憶體的安全抹除；GAR 資料、瀏覽器暫存及已下載檔案可能持續存在，直到相應程序／分頁結束、快取清除或使用者刪除檔案。

## 仍然存在的網路請求

載入網站會向託管服務請求 HTML、JS、CSS、Python 橋接檔及核心壓縮檔；首次初始化另會向 jsDelivr 取得 Pyodide 0.27.7 及執行環境資源。服務供應商可能依其政策處理 IP、請求時間及瀏覽器等連線資訊。

目前附件未見應用程式主動使用 Cookie、localStorage 或分析追蹤程式保存使用紀錄；不代表瀏覽器快取、網站託管與 CDN 完全沒有紀錄。不得據此保證「零網路」、「所有資訊完全不離開裝置」或「永遠可離線使用」。

## 使用者提醒

- 網站尚未具備完整離線封裝與離線可用保證；請勿以瀏覽器曾載入過一次就推定日後可離線。
- 公開回報問題前，移除私人檔名與敏感素材；分享報告／Context JSON 也可能揭露樂曲內容。
- 新增廣告、追蹤、遠端 API、檔案上傳或錯誤回報服務前，必須重新檢查實際資料流並更新此說明。

## 說明更新

本說明依目前程式資料流整理。網站部署環境或第三方服務可能調整；若日後新增上傳、分析、廣告或其他資料處理方式，應同步更新本說明。


---

## English Translation

# Data Processing and Privacy Notice

Updated: 2026-11-21. This notice applies to the current GSTE Web test version running on Pyodide 0.27.7. It does not automatically cover advertising, analytics tools, or other services added in the future.

## Local Processing

The current application uses the browser File API to read MusicXML/JSON files selected by the user and processes them using a Web Worker and Pyodide. No application code was found that sends selected file contents or file fingerprints to remote services. Conversion and GAR results are made available for download through the browser.

The conversion bridge creates working files in Pyodide's virtual file system and cleans up the working directory when the job ends. This is not secure erasure of memory. GAR data, browser caches, and downloaded files may remain until the relevant process or tab ends, caches are cleared, or the user deletes the files, as applicable.

## Network Requests That Still Occur

Loading the website requests HTML, JavaScript, CSS, Python bridge files, and the core archive from the hosting service. Initial setup also retrieves Pyodide 0.27.7 and runtime resources from jsDelivr. Service providers may process connection information, such as IP addresses, request times, and browser information, in accordance with their policies.

No application code was found in the current supplied files that actively uses cookies, localStorage, or analytics tracking scripts to retain usage records. This does not mean that browser caches, the hosting provider, and the CDN retain no records. It does not support guarantees of “zero network activity,” “all information always remaining on the device,” or “permanent offline availability.”

## Reminders for Users

- The website does not yet include a complete offline package or a guarantee of offline availability. Loading it once does not establish that it will work offline later.
- Remove private filenames and sensitive materials before reporting issues publicly. Sharing reports or Context JSON may also reveal musical content.
- Before adding advertising, tracking, remote APIs, file uploads, or error-reporting services, the actual data flow must be reviewed again and this notice updated.

## Updates to This Notice

This notice is based on the current application's data flow. The deployment environment or third-party services may change. If uploads, analytics, advertising, or other forms of data processing are added later, this notice should be updated accordingly.
