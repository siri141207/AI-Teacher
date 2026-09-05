function ChatPanel({
    question,
    answer,
    loading,
    language = "English",
    onLanguageChange = null
}) {
    const langLower = (language || "english").toLowerCase();
    const isTelugu = langLower.includes("telugu") || langLower.includes("te");
    const isHindi = langLower.includes("hindi") || langLower.includes("hi");

    return (
        <section className="chat-panel">

            {/* =========================================
                HEADER & LANGUAGE SELECTOR
            ========================================= */}
            <div className="panel-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span></span>
                    {isTelugu ? "తరగతి ప్రశ్నోత్తరాలు" : isHindi ? "कक्षा प्रश्नोत्तरी" : "CLASSROOM Q&A CHAT"}
                </div>
                {onLanguageChange && (
                    <div className="chat-panel-lang-pills">
                        {[
                            { id: "English", label: "EN" },
                            { id: "Hindi", label: "हि" },
                            { id: "Telugu", label: "తె" }
                        ].map(l => (
                            <button
                                key={l.id}
                                type="button"
                                className={`chat-mini-pill ${language.toLowerCase().includes(l.id.toLowerCase()) ? "active" : ""}`}
                                onClick={() => onLanguageChange(l.id)}
                                title={`Switch Q&A language to ${l.id}`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* =========================================
                QUESTION
            ========================================= */}
            <div className="question-box">
                <small>{isTelugu ? "మీరు అడిగిన ప్రశ్న" : isHindi ? "आपका प्रश्न" : "YOU ASKED"}</small>
                <p>
                    {question || (
                        isTelugu
                            ? "అభ్యాసం ప్రారంభించడానికి లిల్లీని ఏదైనా ప్రశ్న అడగండి."
                            : isHindi
                            ? "सीखना शुरू करने के लिए लिली से कोई भी प्रश्न पूछें।"
                            : "Ask Lilly anything to begin learning."
                    )}
                </p>
            </div>

            {/* =========================================
                LILLY EXPLANATION
            ========================================= */}
            <div className="explanation-box">
                <small>
                    {isTelugu ? "లిల్లీ బోధిస్తున్నారు // వివరణ" : isHindi ? "लिली समझा रही हैं // स्पष्टीकरण" : "LILLY IS EXPLAINING"}
                </small>

                {loading ? (
                    <div className="thinking">
                        <i></i>
                        <i></i>
                        <i></i>
                        <span>
                            {isTelugu ? "లిల్లీ విశ్లేషిస్తున్నారు..." : isHindi ? "लिली विचार कर रही हैं..." : "Lilly is thinking..."}
                        </span>
                    </div>
                ) : (
                    <p className="lilly-answer">
                        {answer || (
                            isTelugu
                                ? "మీ వ్యక్తిగతీకరించిన వివరణ మరియు దశలు ఇక్కడ కనిపిస్తాయి."
                                : isHindi
                                ? "आपका व्यक्तिगत स्पष्टीकरण और चरण यहाँ दिखाई देंगे।"
                                : "Your personalized explanation will appear here."
                        )}
                    </p>
                )}
            </div>

            {/* =========================================
                LEARNING STATUS
            ========================================= */}
            <div className="learning-status">
                <div className="learning-status-header">
                    <span>
                        ◆ {isTelugu ? "అభ్యాస స్థితి" : isHindi ? "सीखने की स्थिति" : "LEARNING MODE"}
                    </span>
                    <span className="learning-active">
                        {isTelugu ? "యాక్టివ్" : isHindi ? "सक्रिय" : "ACTIVE"}
                    </span>
                </div>

                <div className="learning-info">
                    <div>
                        <small>{isTelugu ? "స్థాయి" : isHindi ? "स्तर" : "LEVEL"}</small>
                        <strong>{isTelugu ? "ప్రారంభ" : isHindi ? "शुरुआती" : "BEGINNER"}</strong>
                    </div>

                    <div>
                        <small>{isTelugu ? "భాష" : isHindi ? "भाषा" : "LANGUAGE"}</small>
                        <strong className="highlight-lang">{language}</strong>
                    </div>

                    <div>
                        <small>{isTelugu ? "AI స్థితి" : isHindi ? "AI स्थिति" : "AI STATUS"}</small>
                        <strong>{isTelugu ? "సిద్ధంగా ఉంది" : isHindi ? "तैयार" : "READY"}</strong>
                    </div>
                </div>
            </div>

            {/* =========================================
                KEY POINTS
            ========================================= */}
            <div className="key-points">
                <h3>
                    ◆ {isTelugu ? "ముఖ్య ప్రయోజనాలు" : isHindi ? "मुख्य बिंदु" : "KEY POINTS"}
                </h3>

                <div>
                    <span>01</span>
                    {isTelugu
                        ? "భావనలు మీ అభ్యసన స్థాయికి మరియు ఎంచుకున్న భాషకు అనుగుణంగా వివరించబడతాయి."
                        : isHindi
                        ? "अवधारणाएं आपके सीखने के स्तर और चुनी गई भाषा के अनुसार समझाई जाती हैं।"
                        : "Concepts are explained according to your learning level and chosen language."}
                </div>

                <div>
                    <span>02</span>
                    {isTelugu
                        ? "టెక్స్ట్ లేదా మీ గొంతు ద్వారా సహజంగా ప్రశ్నలు అడగవచ్చు."
                        : isHindi
                        ? "टेक्स्ट या अपनी आवाज़ का उपयोग करके स्वाभाविक रूप से प्रश्न पूछें।"
                        : "Ask questions naturally using text or your voice."}
                </div>

                <div>
                    <span>03</span>
                    {isTelugu
                        ? "కష్టమైన అంశాలను సులభంగా అర్థం చేసుకునేలా లిల్లీ ఉదాహరణలతో అనుకూలిస్తుంది."
                        : isHindi
                        ? "कठिन विषयों को समझने में मदद के लिए लिली उदाहरणों के साथ अनुकूलित होती है।"
                        : "Lilly adapts explanations to help you understand difficult topics."}
                </div>

                <div>
                    <span>04</span>
                    {isTelugu
                        ? "సరళమైన వివరణలు, ఉదాహరణలు మరియు దశలవారీ మార్గదర్శకత్వంతో నేర్చుకోండి."
                        : isHindi
                        ? "सरल व्याख्याओं, उदाहरणों और चरण-दर-चरण मार्गदर्शन के माध्यम से सीखें।"
                        : "Learn through simple explanations, examples, and step-by-step guidance."}
                </div>
            </div>

        </section>
    );
}

export default ChatPanel;