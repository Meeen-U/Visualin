import { Link } from 'react-router-dom'

/**
 * 共通ヘッダー
 *
 * props:
 * - title: 表示するタイトル文字列（必須）
 * - backTo: 戻る/キャンセルリンクの遷移先パス（省略時は非表示）
 * - backLabel: 左側リンクの表示文字（省略時は "＜ 戻る"）
 * - actionTo: 右側リンクの遷移先パス（省略時は非表示）
 * - actionLabel: 右側リンクの表示文字（例: "変更", "編集"）
 * - variant: ヘッダーの色パターン。"default" または "accent"
 */
function Header({
  title,
  backTo,
  backLabel = '＜ 戻る',
  actionTo,
  actionLabel,
  variant = 'default',
}) {
  const headerStyle =
    variant === 'accent'
      ? { backgroundColor: 'var(--accent)', color: 'var(--paper)' }
      : undefined

  if (!backTo && !actionTo) {
    return (
      <header style={headerStyle}>
        <span>🏠 {title}</span>
      </header>
    )
  }

  return (
    <header style={headerStyle}>
      <div className="header-side">
        {backTo ? <Link to={backTo}>{backLabel}</Link> : null}
      </div>
      <div>🏠 {title}</div>
      <div className="header-side">
        {actionTo ? <Link to={actionTo}>{actionLabel}</Link> : null}
      </div>
    </header>
  )
}

export default Header
