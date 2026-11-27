function AiChatColumn({
    chatMessages,
    chatInput,
    onChatInputChange,
    onChatKeyPress,
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
    onProposeTasks,
}) {
    return (
        <section className="dashboard-col">
            <h2 className="col-title">AIに相談</h2>
            <div className="chat-container">
                <div className="chat-header">
                    <span>AI アシスト</span>
                    <button type="button" className="chat-new-btn" onClick={onClearChat}>
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
                                    <div key={index} className="chat-subtask">
                                        <div className="chat-subtask-title">
                                            {subtask.title}（推奨頻度: {subtask.frequency_days}日）
                                        </div>
                                        {subtask.description ? (
                                            <p className="chat-subtask-desc">{subtask.description}</p>
                                        ) : null}
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => onRegisterSubtask(subtask)}
                                        >
                                            ＋ タスクに登録
                                        </button>
                                    </div>
                                ))
                                : null}
                        </div>
                    ))}
                    {isAiLoading ? <div className="chat-bubble chat-ai">考え中...</div> : null}
                </div>

                {showSeasonForm ? (
                    <div className="chat-season-form">
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label>季節</label>
                            <select value={season} onChange={(e) => onSeasonChange(e.target.value)}>
                                <option>春</option>
                                <option>夏</option>
                                <option>秋</option>
                                <option>冬</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                            <label>住環境</label>
                            <select
                                value={livingEnvironment}
                                onChange={(e) => onLivingEnvironmentChange(e.target.value)}
                            >
                                <option>一人暮らし</option>
                                <option>ファミリー世帯</option>
                                <option>ペットあり</option>
                            </select>
                        </div>
                        <div className="panel-actions" style={{ marginTop: '12px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => onShowSeasonForm(false)}
                            >
                                キャンセル
                            </button>
                            <button type="button" className="btn" onClick={onProposeTasks}>
                                提案してもらう
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="chat-season-bar">
                        <button
                            type="button"
                            className="chat-season-trigger"
                            onClick={() => onShowSeasonForm(true)}
                        >
                            季節の家事を提案してもらう
                        </button>
                    </div>
                )}

                <div className="chat-input-area">
                    <input
                        type="text"
                        placeholder="入力例：車内の清掃、衣替え"
                        value={chatInput}
                        onChange={(e) => onChatInputChange(e.target.value)}
                        onKeyPress={onChatKeyPress}
                    />
                    <button type="button" className="btn" onClick={onSendChat}>
                        送信
                    </button>
                </div>
            </div>
        </section>
    )
}

export default AiChatColumn
