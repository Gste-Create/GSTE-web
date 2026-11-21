# GSTE Web｜MusicXML 吉他指彈編曲工具

GSTE 將事先分軌的 MusicXML 樂譜轉換成吉他譜，提供單旋律、雙手鋼琴及團譜三種輸入方式。Python 核心透過 Pyodide 在瀏覽器執行，轉換結果由使用者下載。

目前為實驗測試版，轉換結果與指板建議需人工確認。

## 目前功能

| 功能 | 說明 |
|---|---|
| 單旋律 | 匯入旋律 MusicXML，可選擇自動生成伴奏或不生成伴奏 |
| 雙手鋼琴 | 分別匯入右手旋律、左手伴奏的 MusicXML |
| 團譜 | 匯入旋律及分開匯出的伴奏軌；伴奏類別為 GUITAR、BASS |
| 調弦 | 標準調弦及 Drop D 的 MusicXML 輸出 |
| 下載 | 轉換後 MusicXML、轉換報告，以及成功產生時的 Editor Context JSON |
| GAR 參考 | 讀取完整 Editor Context JSON，查閱小節、和弦、TAB、指板位置與雙音建議；唯讀，不會回寫譜面 |

GAR 指板音高對應位置目前固定使用標準調弦，**Drop D 使用者請勿直接依 GAR 建議演奏**。

## 使用方式

1. 開啟網站並等待 Python 核心載入完成。第一次載入需要網路下載 Pyodide。
2. 選擇輸入模式及調弦方式。
3. 選擇未壓縮的 `.musicxml` 或 `.xml`。單一樂譜目前上限為 12 MiB。
4. 按下轉換，完成後下載譜面及報告；可用支援 MusicXML 的打譜軟體開啟，人工檢查音高、節奏、弦品與可演奏性。
5. 需要 GAR 時，匯入含 `measures`、`windows`、`score_notes` 的完整 Context JSON；檔案上限為 30 MiB。

鋼琴與團譜素材須先分開匯出各聲部，並保持起點、拍號與小節對齊。MXL 請先解壓縮取得 MusicXML。此版本不直接辨識圖片簡譜、PDF、錄音或 MIDI，也沒有網站內建音訊試聽或 PDF 匯出。


## 資料處理與限制

目前應用程式沒有將選取樂譜上傳至伺服器的程式路徑，也未加入廣告或分析追蹤程式。樂譜在瀏覽器的工作執行緒內處理；但載入網站、核心與外部執行環境仍會產生網路請求。這不等於完全離線，也不等於網站託管商或 CDN 不會留存連線紀錄。詳見 [隱私說明](PRIVACY.md)。

編曲結果與 GAR 建議均需人工確認。大型或複雜樂譜可能處理較久或失敗；目前沒有取消按鈕。手機相容性、效能及無障礙支援仍需實機測試。

## 授權、第三方元件與素材

本專案中由 GSTE 權利人有權授權的程式碼與專案文件，依儲存庫根目錄的 [LICENSE](LICENSE) 採用 Apache License 2.0。第三方元件及音樂／樂譜素材保留各自原有的權利與授權，不因本專案採用 Apache-2.0 而改變。

- [第三方元件聲明](THIRD_PARTY_NOTICES.md)


請僅匯入有權處理的樂譜；軟體授權不會自動授予原曲、編曲、歌詞或樂譜的使用與散布權。

## 問題回報

請提供輸入模式、瀏覽器及版本、調弦、錯誤訊息與轉換報告；可重現時附上自製或可分享的最小樂譜。公開 Issue 前，請移除私人檔名、個資及沒有權利公開的素材。回報時請僅提供定位問題所需的最小內容，避免公開貼出敏感資訊或無權分享的原始碼。


---

## English Translation

# GSTE Web | MusicXML Fingerstyle Guitar Arrangement Tool

GSTE converts MusicXML scores with parts exported separately into guitar scores. It supports three input modes: single melody, two-hand piano, and ensemble. The Python core runs in the browser through Pyodide, and users download the conversion results.

This is an experimental test version. Conversion results and fretboard suggestions require manual review.

## Current Features

| Feature | Description |
|---|---|
| Single melody | Import a melody MusicXML file, with optional automatically generated accompaniment |
| Two-hand piano | Import separate MusicXML files for the right-hand melody and left-hand accompaniment |
| Ensemble | Import a melody and separately exported accompaniment tracks; available accompaniment categories are GUITAR and BASS |
| Tuning | MusicXML output for standard tuning and Drop D |
| Downloads | Converted MusicXML, a conversion report, and Editor Context JSON when successfully generated |
| GAR reference viewer | Load a complete Editor Context JSON to view measures, chords, TAB, fretboard positions, and double-stop suggestions; read-only, with no changes written back to the score |

GAR currently calculates fretboard pitch positions using standard tuning only. **Drop D users should not play directly from GAR suggestions without checking them.**

## How to Use

1. Open the website and wait for the Python core to load. The first load requires an internet connection to download Pyodide.
2. Select the input mode and tuning.
3. Select an uncompressed `.musicxml` or `.xml` file. The current limit is 12 MiB per score file.
4. Start conversion, then download the score and report. Open the result in notation software that supports MusicXML and manually check pitches, rhythms, string and fret assignments, and playability.
5. To use GAR, import a complete Context JSON containing `measures`, `windows`, and `score_notes`. The file size limit is 30 MiB.

For piano and ensemble inputs, export each part separately and keep the starting positions, time signatures, and measures aligned. Extract MXL files to obtain MusicXML before importing. This version does not directly recognize numbered-notation images, PDFs, recordings, or MIDI, and does not include in-browser audio playback or PDF export.

## Data Processing and Limitations

The current application has no code path that uploads selected scores to a server, and contains no advertising or analytics tracking scripts. Scores are processed in a browser worker. However, loading the website, core, and external runtime still generates network requests. This does not mean the application is fully offline or that the hosting provider and CDN retain no connection logs. See the [Privacy Notice](PRIVACY.md).

Arrangement results and GAR suggestions require manual review. Large or complex scores may take longer to process or fail. There is currently no cancel button. Mobile compatibility, performance, and accessibility support still require testing on actual devices.

## License, Third-Party Components, and Materials

The code and project documentation that GSTE rights holders are entitled to license are licensed under the Apache License 2.0, as set out in the [LICENSE](LICENSE) file at the repository root. Third-party components and music/score materials retain their respective rights and licenses; these do not change because GSTE uses Apache-2.0.

- [Third-Party Notices](THIRD_PARTY_NOTICES.md)

Only import scores you have the right to process. The software license does not automatically grant rights to use or distribute the underlying compositions, arrangements, lyrics, or scores.

## Reporting Issues

Please provide the input mode, browser and version, tuning, error messages, and conversion report. Where possible, include a minimal reproducible score that you created or are permitted to share. Before opening a public issue, remove private filenames, personal information, and materials you are not entitled to publish. Include only the minimum information needed to identify the problem, and avoid posting sensitive information or source code you do not have permission to share.
