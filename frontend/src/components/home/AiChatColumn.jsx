function AiChatColumn({
    chatMessages,
    chatInput,
    onChatInputChange,
    onChatKeyPressm,
    isAiLoading,
    chatAreaRef,
    onSendChat,
    onClearChat,
    onRegisterSubtask,
    showSeasonForm,
    onShowSeasonForm,
    season,
    onSeasonChange,
    livingEnvironment,
    onLivingEnvironmentChange,
    onPropposeTasks,
}) {
    return (
        <div
            className="dashboard-col"
            style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}
        >
            <div className="caht-container">
                <div className="chat-header">
                    <span>AI アシスト</span>
                    <button className="chat-new-btn" onClick={onClearChat}>
                        新規チャット
                    </button>
                </div>

                <div className="chat-messages" ref={chatAreaRef}>
                    {chatMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={msg.role === 'user' ? 'chat-bubble chat-user' : 'chat-bubble chat-ai'}
                        >
                            {msg.text}
                            {msg.subtasks
                                ? msg.subtasks.map((subtask, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            border: '1px solid #D6CDC4',
                                            padding: '10px',
                                            background: '#FFFFFF',
                                            marginTop: '10px',
                                        }}
                                    >
                                        {subtask.title} (推奨頻度: {subtask.frequency_days}日)
                                        {subtask.description ? (
                                            <p style={{ fontSize: '0.85em', color: '#6E6055', margin: '5px 0 0 0' }}>
                                                {subtask.description}
                                            </p>
                                        ) : null}
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '4px 8px', fontSize: '0.8em', marginTop: '5px' }}
                                            onClick={() => onRegisterSubtask(subtask)}
                                        >
                                            タスクに登録
                                        </button>
                                    </div>
                                ))
                            : null}
                        </div>
                    ))}
                    {isAiLoading ? <div className="caht-bubble chat-ai">考え中...</div> : null}
                </div>

                {showSeasonForm ? (
                    <div style={{ padidng: '15px', borderTop: '2px solid #40342B', background: '#F5F2EB' }}>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '0.85em' }}>季節</label>
                            <select value={season} onChange={(e) => onSeasonChange(e.target.value)}>
                                <option>春</option>
                                <option>夏</option>
                                <option>秋</option>
                                <option>冬</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '0.85em' }}>住環境</label>
                            <select value={livingEnvironment} onChange={(e) => onLivingEnvironmentChange(e.target.value)}>
                                <option>一人暮らし</option>
                                <option>ファミリー世帯</option>
                                <option>ペットあり</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ margin: 0, flex: 1 }}
                                onClick={() => onShowSeasonForm(false)}
                            >
                                キャンセル
                            </button>
                            <button className="btn" style={{ margin: 0, flex: 1 }} onClick={onPropposeTasks}>
                                提案してもらう
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        className="chat-new-btn"
                        style={{ margin: '10px 15px 0 15px', color: '#40342B', borderColor: '#40342B' }}
                        onClick={() => onShowSeasonForm(true)}
                    >
                        季節の家事を提案してもらう
                    </button>
                )}

                <div className="chat-input-area">
                    <input
                        type="text"
                        placeholder="入力例：車内の清掃、衣替え"
                        value={chatInput}
                        onChange={(e) => onChatInputChange(e.target.value)}
                        onKeyPress={onChatKeyPressm}
                    />
                    <button className="btn" onClick={onSendChat}>
                        送信
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AiChatColumn