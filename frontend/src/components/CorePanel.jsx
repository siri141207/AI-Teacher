function CorePanel() {
    return (
        <section className="core-panel">

            <div className="core-title">
                <span className="core-pulse"></span>
                LILLY CORE
            </div>

            <div className="core-status">
                <span className="online-dot"></span>
                SYSTEM ONLINE
            </div>


            <div className="core-metrics">

                <div className="core-row">
                    <span>AI MODEL</span>
                    <strong>ACTIVE</strong>
                </div>

                <div className="core-row">
                    <span>KNOWLEDGE RAG</span>
                    <strong>READY</strong>
                </div>

                <div className="core-row">
                    <span>VOICE ENGINE</span>
                    <strong>ONLINE</strong>
                </div>

                <div className="core-row">
                    <span>ADAPTIVE AI</span>
                    <strong>ACTIVE</strong>
                </div>

                <div className="core-row">
                    <span>MEMORY</span>
                    <strong>SYNCED</strong>
                </div>

            </div>


            <div className="core-progress">

                <div className="progress-heading">
                    <span>NEURAL SYNCHRONIZATION</span>
                    <strong>98.6%</strong>
                </div>

                <div className="progress-track">
                    <div className="progress-fill"></div>
                </div>

            </div>


            <div className="core-footer">

                <span>AI-07</span>

                <span>◆</span>

                <span>READY TO TEACH</span>

            </div>

        </section>
    );
}

export default CorePanel;