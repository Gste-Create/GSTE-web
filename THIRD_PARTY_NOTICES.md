# 第三方軟體與服務聲明

本文件說明目前 GSTE Web 已確認直接使用的第三方執行環境與外部服務。GSTE 的 Apache-2.0 授權不會取代第三方原有授權。本清單不宣稱涵蓋執行環境全部間接元件，也不構成整個專案已完成權利審查的保證。

## Pyodide 0.27.7

GSTE Web 使用 Pyodide 在瀏覽器中執行 Python。現行 `worker.js` 從下列路徑載入執行環境：

`https://cdn.jsdelivr.net/pyodide/v0.27.7/full/`

- 專案：[Pyodide](https://github.com/pyodide/pyodide)
- 使用版本：0.27.7
- Pyodide 專案授權：Mozilla Public License Version 2.0（MPL-2.0）
- [該版本的完整授權原文](https://github.com/pyodide/pyodide/blob/0.27.7/LICENSE)
- [該版本原始碼](https://github.com/pyodide/pyodide/tree/0.27.7)
- [該版本說明文件](https://pyodide.org/en/0.27.7/project/about.html)

Pyodide 版本文件列示：© 2019–2024 Pyodide contributors and Mozilla。各原始檔與發行物的聲明仍以上游內容為準。

Pyodide 發行物另包含 Python、Emscripten 相關產物及其他元件；這些內容依各自適用的授權提供，不能把整個執行環境統稱為 MPL-2.0，也不能改標成 GSTE 的 Apache-2.0。上述連結提供 Pyodide 授權及原始碼查閱入口，不取代任何實際散布元件所要求隨附的授權或聲明。

## jsDelivr

[jsDelivr](https://www.jsdelivr.com/) 提供上述 Pyodide 資源的 CDN 下載。jsDelivr 是外部服務，不是 GSTE 自有程式的授權人。載入資源會產生對外連線，詳見 [隱私說明](PRIVACY.md)。

## 其他內容

程式碼來源相似性掃描中的候選專案，不等於本專案實際使用的依賴，因此不僅憑掃描命中將其列為第三方元件。後續若確認採用其他程式碼或新增依賴，將依適用範圍補列來源、授權與必要聲明。

使用者匯入的樂譜及產生的音樂內容，其權利依原作品、編曲與素材的適用條件判斷；使用 GSTE 不會自動取得他人作品的使用或散布權。


---

## English Translation

# Third-Party Software and Service Notices

This document describes the third-party runtime and external services confirmed to be directly used by the current GSTE Web application. GSTE's Apache-2.0 license does not replace third-party licenses. This list does not claim to cover every indirect component of the runtime or guarantee that the entire project has completed a rights review.

## Pyodide 0.27.7

GSTE Web uses Pyodide to run Python in the browser. The current `worker.js` loads the runtime from:

`https://cdn.jsdelivr.net/pyodide/v0.27.7/full/`

- Project: [Pyodide](https://github.com/pyodide/pyodide)
- Version used: 0.27.7
- Pyodide project license: Mozilla Public License Version 2.0 (MPL-2.0)
- [Full license text for this version](https://github.com/pyodide/pyodide/blob/0.27.7/LICENSE)
- [Source code for this version](https://github.com/pyodide/pyodide/tree/0.27.7)
- [Documentation for this version](https://pyodide.org/en/0.27.7/project/about.html)

The Pyodide version documentation states: © 2019–2024 Pyodide contributors and Mozilla. Notices in individual source files and distributions remain subject to the upstream materials.

The Pyodide distribution also includes Python, Emscripten-related artifacts, and other components. These are provided under their respective applicable licenses. The entire runtime must not be described as being solely under MPL-2.0 or relabeled under GSTE's Apache-2.0 license. The links above provide access to Pyodide's license and source code; they do not replace any licenses or notices that must accompany components actually distributed.

## jsDelivr

[jsDelivr](https://www.jsdelivr.com/) provides CDN downloads for the Pyodide resources listed above. jsDelivr is an external service, not the licensor of GSTE's own code. Loading these resources creates external connections; see the [Privacy Notice](PRIVACY.md).

## Other Content

Projects identified as candidates by source-code similarity scans are not necessarily dependencies actually used by GSTE. They are therefore not listed as third-party components solely on the basis of a scan match. If the use of other code is confirmed or new dependencies are added, the relevant sources, licenses, and required notices will be added for the applicable scope.

Rights in scores imported by users and the resulting musical content depend on the applicable terms for the original works, arrangements, and materials. Using GSTE does not automatically grant rights to use or distribute someone else's works.
