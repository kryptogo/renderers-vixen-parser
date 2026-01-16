# Known Issues

## 已修復

### Proto `pub type` 語法錯誤

**狀態:** ✅ 已修復

**問題:** Codama 生成 tuple type 時，proto 檔案出現無效語法：

```proto
pub type OptionBool = message OptionBool {
  bool field_0 = 1;
}
;
```

**原因:** `getProtoTypeManifestVisitor.ts` 的 `visitDefinedType` 沒有將 `tupleTypeNode` 納入檢查。

**修正:** 在 `isNode()` 檢查中加入 `'tupleTypeNode'`。

---

## 外部套件問題 (@codama/renderers-rust)

以下問題來自 `@codama/renderers-rust` 套件，需要在該套件中修復或透過 fork/後處理解決。

### 1. Tuple Type 多餘括號

**狀態:** ⚠️ 未修復 (外部套件)

**問題:** 單元素 tuple type 生成時帶有多餘括號：

```rust
// 生成的程式碼
pub type OptionBool = (bool);

// 應該是
pub type OptionBool = bool;
```

**影響:** 編譯器警告 `unnecessary parentheses around type`

**位置:** `src/generated_sdk/types/option_bool.rs`

---

### 2. Defined Types (Events) 缺少 Discriminator 常數

**狀態:** ⚠️ 未修復 (外部套件)

**問題:** `@codama/renderers-rust` 會為 accounts 和 instructions 生成有前綴的 discriminator 常數（如 `POSITION_DISCRIMINATOR`），但不會為 defined types（如 events）生成。

當手動新增 discriminator 常數時：

```rust
// buy_event.rs
pub const DISCRIMINATOR: [u8; 8] = [...];
pub const CPI_LOG_PREFIX: [u8; 8] = [...];

// sell_event.rs
pub const DISCRIMINATOR: [u8; 8] = [...];  // 名稱衝突！
pub const CPI_LOG_PREFIX: [u8; 8] = [...]; // 名稱衝突！
```

因為 `types/mod.rs` 使用 glob re-export：

```rust
pub use self::{
    r#buy_event::*,
    r#sell_event::*,
    // ...
};
```

會產生 `ambiguous glob re-exports` 警告。

**解決方案:** 手動加上前綴區分：

```rust
// buy_event.rs
pub const BUY_EVENT_DISCRIMINATOR: [u8; 8] = [...];
pub const BUY_EVENT_CPI_LOG_PREFIX: [u8; 8] = [...];

// sell_event.rs
pub const SELL_EVENT_DISCRIMINATOR: [u8; 8] = [...];
pub const SELL_EVENT_CPI_LOG_PREFIX: [u8; 8] = [...];
```

---

## 可能的長期解決方案

1. **Fork `@codama/renderers-rust`** - 建立自訂版本修復這些問題
2. **上游貢獻** - 向 [codama-idl/codama](https://github.com/codama-idl/codama) 提交 PR
3. **後處理腳本** - 在 `renderVisitor.ts` 加入後處理步驟自動修正生成的檔案
