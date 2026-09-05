function Message({ type, text }) {
    return (
        <div className={`message ${type}`}>

            <div className="message-label">

                {type === "ai"
                    ? "LILLY"
                    : "YOU"}

            </div>

            <div className="message-text">
                {text}
            </div>

        </div>
    );
}

export default Message;