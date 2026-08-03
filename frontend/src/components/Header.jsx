import { Link } from 'react-router-dom'

/**
 * 共通ヘッダー
 *
 * props:
 * - title: 中央に表示するタイトル文字列（必須）
 * - backTo: 戻る/キャンセルリンクの遷移先パス（省略時は左側を空欲示にする）
 * - backLabel: 左側リンクの表示文字（省略時は "＜ 戻る"）
 * - actionTo: 右側リンクの遷移先パス（省略時は右側を空欲示にする）
 * - actionLabel: 右側リンクの表示文字（例: "変更", "編集"）
 * - variant: ヘッダーの色パターン。"default"（黒）または "accent"（AI画面などの紫）
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
    variant === 'accent' ? { backgroundColor: '#8e44ad' } : undefined

  return (
    <header style={headerStyle}>
      <div style={{ width: '70px' }}>
        {backTo ? <Link to={backTo}>{backLabel}</Link> : null}
      </div>
      <div>{title}</div>
      <div style={{ width: '70px', textAlign: 'right' }}>
        {actionTo ? <Link to={actionTo}>{actionLabel}</Link> : null}
      </div>
    </header>
  )
}

export default Header